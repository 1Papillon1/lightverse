<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Building;
use App\Models\Voxel;
use App\Services\LightService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GalleryController extends Controller
{
    public function __construct(private LightService $light)
    {
    }

    /**
     * Lista objavljenih izgradnji za javnu galeriju (samo pregled, ne editiranje).
     */
    public function index(Request $request)
    {
        $buildings = Building::query()
            ->with('user:id,username')
            ->orderByDesc('published_at')
            ->paginate(12);

        return response()->json($buildings);
    }

    /**
     * Detalj jedne izgradnje - voxel podaci za render + komentari.
     */
    public function show(Building $building)
    {
        $building->load(['user:id,username', 'comments.user:id,username']);

        return response()->json([
            'building'          => $building,
            'my_rating'         => optional(
                $building->ratings()->where('user_id', auth()->id())->first()
            )->rating,
            'has_contributed'   => $building->hasContributionFrom(auth()->user()),
        ]);
    }

    /**
     * Objavi trenutno stanje privatnog voxel prostora kao novu izgradnju u galeriji.
     * Ovo je SNAPSHOT - kasnije izmjene u privatnom builderu ne diraju objavljenu kopiju.
     */
    public function publish(Request $request)
    {
        $validated = $request->validate([
            'planet_id' => ['required', 'string'],
            'title'     => ['required', 'string', 'max:100'],
        ]);

        $user = auth()->user();

        $voxel = Voxel::where('user_id', $user->id)
            ->where('planet_id', $validated['planet_id'])
            ->first();

        if (!$voxel || empty($voxel->data)) {
            return response()->json([
                'message' => 'You have nothing built in this space to publish.',
            ], 422);
        }

        $building = Building::create([
            'user_id'      => $user->id,
            'planet_id'    => $validated['planet_id'],
            'title'        => $validated['title'],
            'voxel_data'   => $voxel->data,
            'block_count'  => count($voxel->data),
            'published_at' => now(),
        ]);

        // Malen Active Light bonus za objavu - potiče dijeljenje u galeriji
        $this->light->award(
            user: $user,
            type: 'active',
            amount: 10,
            source: "building:published:{$building->id}",
            expiresAt: now()->addDays(30),
        );

        // Self-notifikacija - ovo je vizualna potvrda objave (zvončić +
        // recentNotifications preko HandleInertiaRequests share-a)
        NotificationService::create(
            user: $user,
            type: 'building_published',
            title: 'Published to Gallery',
            message: "\"{$building->title}\" is now live in the Digital Art Gallery.",
            actionUrl: "/galaxy/art-galaxy/digital-canvas/gallery?building={$building->id}",
            metadata: ['building_id' => $building->id],
        );

        return response()->json($building, 201);
    }

    /**
     * Contribute-with-light: NE oduzima Light contributoru (Light je netransferabilan).
     * Umjesto toga generira nov Active Light za creatora, kao nagradu za podršku
     * zajednice - i mali bonus contributoru za sudjelovanje.
     */
    public function contribute(Building $building)
    {
        $contributor = auth()->user();

        if ($building->user_id === $contributor->id) {
            return response()->json(['message' => 'You cannot contribute to your own building.'], 422);
        }

        if ($building->hasContributionFrom($contributor)) {
            return response()->json(['message' => 'You have already contributed to this building.'], 422);
        }

        $creatorAward     = 15;
        $contributorAward = 3;

        DB::transaction(function () use ($building, $contributor, $creatorAward, $contributorAward) {
            $building->contributions()->create([
                'user_id' => $contributor->id,
                'amount'  => $creatorAward,
            ]);

            $building->increment('light_received', $creatorAward);

            $this->light->award(
                user: $building->user,
                type: 'active',
                amount: $creatorAward,
                source: "building:contribution:{$building->id}",
                expiresAt: now()->addDays(30),
            );

            $this->light->award(
                user: $contributor,
                type: 'active',
                amount: $contributorAward,
                source: "building:contributed_to:{$building->id}",
                expiresAt: now()->addDays(30),
            );
        });

        NotificationService::lightEarned(
            user: $building->user,
            amount: $creatorAward,
            source: "a contribution to \"{$building->title}\"",
        );

        return response()->json(['message' => 'Thank you for your support!']);
    }

    public function comment(Request $request, Building $building)
    {
        $validated = $request->validate([
            'body' => ['required', 'string', 'min:1', 'max:500'],
        ]);

        $comment = $building->comments()->create([
            'user_id' => auth()->id(),
            'body'    => $validated['body'],
        ]);

        $building->increment('comment_count');

        if ($building->user_id !== auth()->id()) {
            $commenterName = $comment->user->username ?? auth()->user()->username;

            NotificationService::create(
                user: $building->user,
                type: 'comment',
                title: 'New comment',
                message: "{$commenterName} commented on \"{$building->title}\"",
                actionUrl: "/galaxy/art-galaxy/digital-canvas/gallery?building={$building->id}",
                metadata: ['building_id' => $building->id, 'comment_id' => $comment->id],
            );
        }

        return response()->json($comment->load('user:id,username'), 201);
    }

    public function rate(Request $request, Building $building)
    {
        $validated = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
        ]);

        if ($building->user_id === auth()->id()) {
            return response()->json(['message' => 'You cannot rate your own building.'], 422);
        }

        DB::transaction(function () use ($building, $validated) {
            $building->ratings()->updateOrCreate(
                ['user_id' => auth()->id()],
                ['rating' => $validated['rating']]
            );

            // Rekalkulacija prosjeka - ratings tablica je uvijek izvor istine,
            // building.rating_average/count su samo cache za brzi prikaz u galeriji.
            $stats = $building->ratings()
                ->selectRaw('AVG(rating) as avg_rating, COUNT(*) as total')
                ->first();

            $building->update([
                'rating_average' => round($stats->avg_rating, 2),
                'rating_count'   => $stats->total,
            ]);
        });

        return response()->json(['message' => 'Rating saved.']);
    }
}