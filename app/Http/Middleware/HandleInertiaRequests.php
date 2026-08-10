<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Closure;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;
use App\Services\LightService;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    // Override the handle method to set cache headers for Inertia requests 
    // Example - json data request as user wont return if you go back in browser
    public function handle(Request $request, Closure $next): Response
    {
        $response = parent::handle($request, $next);

        if ($request->header('X-Inertia')) {
            $response->headers->set('Vary', 'X-Inertia');
            $response->headers->set('Cache-Control', 'no-cache, no-store, must-revalidate');
            $response->headers->set('Pragma', 'no-cache');
        }

        return $response;
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        // Dohvati slučajni inspirativni citat
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return [
            // zadrži sve roditeljske share-ane props
            ...parent::share($request),

            // naziv aplikacije
            'name' => config('app.name'),

            // inspirativni citat
            'quote' => [
                'message' => trim($message),
                'author' => trim($author),
            ],

            // trenutno ulogirani korisnik (ili null ako nije autentificiran)
            'auth' => [
                 'user' => Auth::check() ? [
                    'id'           => Auth::id(),
                    'username'     => Auth::user()->username,
                    'is_admin'     => Auth::user()->isAdmin(),
                    'bio'          => Auth::user()->bio ?? null,
                    'cosmic_color' => Auth::user()->cosmic_color ?? '#ff9900',
                    'twitter_url'    => Auth::user()->twitter_url,
                    'reddit_url'     => Auth::user()->reddit_url,
                    'member_since'   => Auth::user()->created_at->format('M Y'),
                ] : null,
            ],

             // ✅ LIGHT AS SEPARATE PHYSICS LAYER
            'light' => function () use ($request) {
                if (!$request->user()) return null;

                $service = app(LightService::class);

                return [
                    'user' => $service->calculateUser($request->user()),
                    'system' => $service->calculateSystem(),
                ];
            },

              // ✅ Notifications — lazy closures so DB only runs when needed
            'unreadNotificationsCount' => function () use ($request) {
                if (!$request->user()) return 0;
                return $request->user()->notifications()->whereNull('read_at')->count();
            },
 
            'recentNotifications' => function () use ($request) {
                if (!$request->user()) return [];
                return $request->user()->notifications()
                    ->orderBy('created_at', 'desc')
                    ->limit(5)
                    ->get();
            },

            'tasks' => function () use ($request) {
                if (!$request->user()) return null;

                $taskService = app(\App\Services\TaskService::class);

                // Handle daily login on every page load — TaskService prevents double-firing
                $taskService->handleDailyLogin($request->user());

                return $taskService->getUserTasks($request->user());
            },

            // Ziggy routes + trenutna adresa
            'ziggy' => fn (): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],

            // stanje sidebar-a iz kolačića
            'sidebarOpen' => $request->cookie('sidebar_state') === 'true',

            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'welcome_narrator' => fn () => $request->session()->get('welcome_narrator'),
            ],

        ];
    }
}
