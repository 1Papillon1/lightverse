<?php

namespace App\Http\Controllers;


use App\Models\LightwebCoinDrop;
use App\Services\LightwebCoinService;
use Illuminate\Http\Request;
use Inertia\Inertia;


class LightwebCoinController extends Controller
{
     public function index(Request $request)
{
    $user = $request->user();

    $drops = LightwebCoinDrop::where('user_id', $user->id)
        ->where('claimed', false)
        ->where(function ($q) {
            $q->whereNull('expires_at')
              ->orWhere('expires_at', '>', now());
        })
        ->get();

    return response()->json($drops);
}
   public function claim(Request $request, LightwebCoinDrop $drop, LightwebCoinService $service)
    {
        if ($drop->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $result = $service->claimDrop($request->user(), $drop);

        if (!$result) {
            return response()->json(['error' => 'Cannot claim drop'], 400);
        }

        return response()->json([
            'success' => true,
            'new_balance' => $request->user()->balance->balance ?? 0
        ]);
    }

    public function dropsForLocation(Request $request)
        {
            $location = $request->query('location');
            $user = $request->user();

            return $user->coinDrops()
                ->where('claimed', false)
                ->where('spawn_location', $location)
                ->get();
        }


    public function balance(Request $request)
        {
            return response()->json([
                'balance' => $request->user()->balance->balance ?? 0
            ]);
        }

}
