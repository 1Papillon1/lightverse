<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Voxel;
use Illuminate\Http\Request;

class VoxelController extends Controller
{
    
    public function show(string $planetId)
    {
        $voxelData = Voxel::where('user_id', auth()->id())
            ->where('planet_id', $planetId)
            ->first();

        return response()->json([
            'data' => $voxelData ? $voxelData->data : []
        ]);
    }

    public function save(Request $request, string $planetId)
    {
        $request->validate(['data' => 'required|array']);

        $voxel = Voxel::updateOrCreate(
            ['user_id' => auth()->id(), 'planet_id' => $planetId],
            ['data' => $request->input('data')]
        );

        return response()->json(['ok' => true]);
    }
}
