<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\AljmasDevice;
use App\Models\AljmasLocation;


class AljmasLocationController extends Controller
{
      /**
     * Return all locations with locked/unlocked state for this device.
     * Only returns coords + basic info — full story only revealed on unlock.
     */
    public function index(Request $request): JsonResponse
    {
        $device = AljmasDevice::where('device_uuid', $request->header('X-Device-UUID'))->firstOrFail();
        $unlockedIds = $device->unlockedLocationIds();
 
        $locations = AljmasLocation::orderBy('order')->get()->map(function (AljmasLocation $loc) use ($unlockedIds) {
            $unlocked = in_array($loc->id, $unlockedIds);
 
            $data = [
                'id'           => $loc->id,
                'order'        => $loc->order,
                'name'         => $unlocked ? $loc->name : null,   // hide name until found
                'dialect_name' => $unlocked ? $loc->dialect_name : null,
                'lat'          => $loc->lat,
                'lng'          => $loc->lng,
                'radius_meters'=> $loc->radius_meters,
                'is_final'     => $loc->is_final,
                'unlocked'     => $unlocked,
                'image_url'    => $unlocked ? $loc->image_url : null,
            ];
 
            // If unlocked, include the full story and clue
            if ($unlocked) {
                $data['dialect_story']   = $loc->dialect_story;
                $data['historical_note'] = $loc->historical_note;
                $data['clue_text']       = $loc->clue_text;
                $data['audio_url']       = $loc->audio_url;
            }
 
            return $data;
        });
 
        return response()->json(['locations' => $locations]);
    }
 
    /**
     * Attempt to unlock a location based on GPS coordinates.
     * Server-side validation — never trust the client alone.
     */
    public function unlock(Request $request, AljmasLocation $location): JsonResponse
    {
        $request->validate([
            'lat' => 'required|numeric|between:-90,90',
            'lng' => 'required|numeric|between:-180,180',
        ]);
 
        $device = AljmasDevice::where('device_uuid', $request->header('X-Device-UUID'))->firstOrFail();
 
        // Already unlocked? Return success silently
        if (in_array($location->id, $device->unlockedLocationIds())) {
            return response()->json([
                'success'  => true,
                'already_unlocked' => true,
                'location' => $this->fullLocationData($location),
            ]);
        }
 
        // Server-side GPS proximity check
        $distance = $this->haversineMeters(
            $request->lat, $request->lng,
            $location->lat, $location->lng
        );
 
        if ($distance > $location->radius_meters) {
            return response()->json([
                'success'  => false,
                'message'  => 'Not close enough.',
                'distance' => round($distance),
                'required' => $location->radius_meters,
            ], 403);
        }
 
        // Unlock it
        $device->locations()->attach($location->id, [
            'unlocked_at' => now(),
        ]);
 
        return response()->json([
            'success'  => true,
            'location' => $this->fullLocationData($location),
        ]);
    }
 
    /**
     * Get full details for an already-unlocked location.
     */
    public function show(Request $request, AljmasLocation $location): JsonResponse
    {
        $device = AljmasDevice::where('device_uuid', $request->header('X-Device-UUID'))->firstOrFail();
 
        if (!in_array($location->id, $device->unlockedLocationIds())) {
            return response()->json(['message' => 'Location not unlocked yet.'], 403);
        }
 
        return response()->json(['location' => $this->fullLocationData($location)]);
    }
 
    // --- Helpers ---
 
    private function fullLocationData(AljmasLocation $location): array
    {
        return [
            'id'             => $location->id,
            'order'          => $location->order,
            'name'           => $location->name,
            'dialect_name'   => $location->dialect_name,
            'lat'            => $location->lat,
            'lng'            => $location->lng,
            'dialect_story'  => $location->dialect_story,
            'historical_note'=> $location->historical_note,
            'clue_text'      => $location->clue_text,
            'audio_url'      => $location->audio_url,
            'image_url'      => $location->image_url,
            'is_final'       => $location->is_final,
        ];
    }
 
    /**
     * Haversine formula — returns distance in meters between two GPS points.
     */
    private function haversineMeters(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371000; // meters
 
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
 
        $a = sin($dLat / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;
 
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
 
        return $earthRadius * $c;
    }
}
