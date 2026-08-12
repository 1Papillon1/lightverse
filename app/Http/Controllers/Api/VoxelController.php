<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Voxel;
use App\Services\LightService;
use Illuminate\Http\Request;

class VoxelController extends Controller
{
    public function __construct(private LightService $light)
    {
    }

    public function show(string $planetId)
    {
        $user = auth()->user();
        $voxelData = Voxel::where('user_id', $user->id)
            ->where('planet_id', $planetId)
            ->first();

        return response()->json([
            'data'  => $voxelData ? $voxelData->data : [],
            'limit' => $this->calculateLimit($user),
        ]);
    }

    public function save(Request $request, string $planetId)
    {
        $user = auth()->user();

        $validated = $request->validate([
            'data'     => ['required', 'array'],
            'data.*.x' => ['required', 'numeric'],
            'data.*.y' => ['required', 'numeric'],
            'data.*.z' => ['required', 'numeric'],
        ]);

        $limit = $this->calculateLimit($user);

        if (count($validated['data']) > $limit) {
            return response()->json([
                'message' => 'Broj blokova prelazi dopušteni limit.',
                'limit'   => $limit,
            ], 422);
        }

        $voxel = Voxel::updateOrCreate(
            ['user_id' => $user->id, 'planet_id' => $planetId],
            ['data' => $validated['data']]
        );

        return response()->json([
            'data'  => $voxel->data,
            'limit' => $limit,
        ]);
    }

    private function calculateLimit($user)
    {
        // VAŽNO: NE čitamo $user->total_light direktno - taj stupac se nikad ne
        // ažurira kroz LightService::award() (koji upisuje samo u light_transactions
        // ledger + SystemState). Ledger je izvor istine, uključujući expire logiku
        // za Active Light, pa limit mora pratiti isti izračun kao i HandleInertiaRequests.
        $light = $this->light->calculateUser($user)['total'];

        if ($light <= 100) {
            return 20; // Tvoj početni limit
        }

        // Npr. nakon 100 Lighta, na svakih 5 novih Lighta dobiješ +1 blok
        return 20 + floor(($light - 100) / 5);
    }
}