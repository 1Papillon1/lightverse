<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\AljmasDevice;
use App\Models\AljmasLocation;

class AljmasDeviceController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'device_uuid' => 'required|uuid',
        ]);

        $device = AljmasDevice::firstOrCreate(
            ['device_uuid' => $request->device_uuid],
        );

        return response()->json([
            'device_id'   => $device->id,
            'device_uuid' => $device->device_uuid,
            'created'     => $device->wasRecentlyCreated,
        ]);
    }

    public function progress(Request $request): JsonResponse
    {
        $device = AljmasDevice::where('device_uuid', $request->header('X-Device-UUID'))->firstOrFail();

        $unlocked = $device->locations()
            ->orderBy('aljmas_locations.order')
            ->get(['aljmas_locations.id', 'aljmas_locations.name', 'aljmas_locations.dialect_name',
                   'aljmas_locations.order', 'aljmas_locations.is_final',
                   'aljmas_device_locations.unlocked_at']);

        $totalLocations = AljmasLocation::count();

        return response()->json([
            'unlocked_count'     => $unlocked->count(),
            'total_count'        => $totalLocations,
            'completed'          => $unlocked->where('is_final', true)->count() > 0,
            'unlocked_locations' => $unlocked,
        ]);
    }
}