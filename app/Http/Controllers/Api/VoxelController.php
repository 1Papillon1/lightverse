<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Voxel;
use Illuminate\Http\Request;

class VoxelController extends Controller
{
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

        // Server je zadnja linija obrane - frontend limit je samo UX,
        // ovo sprječava da netko ručnim pozivom API-ja zaobiđe limit.
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
        $light = $user->total_light ?? 0; // Provjeri kako ti se točno zove polje/metoda za ukupno svjetlo

        if ($light <= 100) {
            return 50; // Tvoj početni limit
        }

        // Npr. nakon 100 Lighta, na svakih 5 novih Lighta dobiješ +1 blok
        return 50 + floor(($light - 100) / 5);
    }
}