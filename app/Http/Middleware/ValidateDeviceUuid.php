<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\AljmasDevice;

class ValidateDeviceUuid 
{
        public function handle(Request $request, Closure $next): Response
    {
        $uuid = $request->header('X-Device-UUID');
 
        if (!$uuid || !preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $uuid)) {
            return response()->json(['message' => 'Missing or invalid X-Device-UUID header.'], 401);
        }
 
        if (!AljmasDevice::where('device_uuid', $uuid)->exists()) {
            return response()->json(['message' => 'Device not registered.'], 401);
        }
 
        return $next($request);
    }
}
