<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;


class RankingController extends Controller
{
    /**
     * GET /api/ranking
     *
     * Returns:
     *   leaderboard  — top 20 users by total_light
     *   my_rank      — current user's rank + total_light
     *   total_users  — total user count in the Verse
     */
    public function index(Request $request)
    {
        $user = $request->user();
 
        // ── Top 20 by total_light ─────────────────────────────────
        $leaderboard = User::orderByDesc('total_light')
            ->limit(20)
            ->get(['id', 'username', 'total_light', 'cosmic_color'])
            ->map(function ($u, $index) {
                return [
                    'id'          => $u->id,
                    'rank'        => $index + 1,
                    'username'    => $u->username,
                    'total_light' => (int) $u->total_light,
                    'cosmic_color'=> $u->cosmic_color ?? '#ff9900',
                ];
            });
 
        // ── Current user's rank ───────────────────────────────────
        // Count how many users have MORE light than this user
        $myRank = null;
        if ($user) {
            $position = User::where('total_light', '>', $user->total_light)->count() + 1;
            $myRank = [
                'rank'        => $position,
                'total_light' => (int) $user->total_light,
            ];
        }
 
        // ── Total users ───────────────────────────────────────────
        $totalUsers = User::count();
 
        return response()->json([
            'leaderboard'  => $leaderboard,
            'my_rank'      => $myRank,
            'total_users'  => $totalUsers,
        ]);
    }
}
