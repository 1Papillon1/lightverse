<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class UserAchievementController extends Controller
{
     public function index(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'achievements' => $user->achievements->map(fn ($a) => [
                'id' => $a->id,
                'code' => $a->code,
                'name' => $a->name,
                'category' => $a->category,
                'data' => $a->data, // icon, rarity, description, etc
                'unlocked_at' => $a->pivot->unlocked_at,
            ])
        ]);
    }
}
