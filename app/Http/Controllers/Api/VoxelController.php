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
            'limit' => $this->calculateLimit($user)
        ]);
    }

    private function calculateLimit($user)
    {
        $light = $user->total_light ?? 0; // Provjeri kako ti se točno zove polje/metoda za ukupno svjetlo

        if ($light <= 100) {
            return 20; // Tvoj početni limit
        }

        // Npr. nakon 100 Lighta, na svakih 5 novih Lighta dobiješ +1 blok
        return 20 + floor(($light - 100) / 5);
    }
}
