<?php

namespace App\Services;

use App\Models\Achievement;
use App\Models\User;
use App\Services\LightwebCoinService;
use App\Services\LightService;

class AchievementsService
{

    //! Inject LightService for potential reward logic

    protected LightService $light;

    public function __construct(LightService $light)
    {
        $this->light = $light;
    }




    //! Check if user has achievement

    public function has(User $user, string $code): bool
    {
        return $user->achievements()->where('code', $code)->exists();
    }

    public function unlock(User $user, string $code, array $data = [])
    {
        if ($this->has($user, $code)) {
            return false;
        }

        // Create achievement definition if missing
        $achievement = Achievement::firstOrCreate(
            ['code' => $code],
            [
                'data' => $data
            ]
        );

        // Unlock for user
        $user->achievements()->attach($achievement->id, [
            'unlocked_at' => now()
        ]);

        // === REWARD SPAWN LOGIC ===
        $coins = app(LightwebCoinService::class);

        switch ($code) {

            // Add 5 cryptos → reward 5 coins
            case 'crypto_add_5':
                $coins->spawnMultiple(
                    user: $user,
                    count: 5,
                    reason: 'achievement:crypto_add_5',
                    location: 'dashboard(system)'
                );
                break;

            // Page visit achievements (reward = 5 coins)
            /* case 'visit_about':
                $coins->spawnMultiple($user, 5, 'achievement:visit_about', 'page:overview.about');
                break;

            case 'visit_roadmap':
                $coins->spawnMultiple($user, 5, 'achievement:visit_roadmap', 'page:overview.roadmap');
                break;

            case 'visit_social':
                $coins->spawnMultiple($user, 5, 'achievement:visit_social', 'page:overview.social');
                break; */

            // First login → no reward here (reward handled in AuthController)
            case 'first_login_spawn':
                break;
        }

        return $achievement;
    }
}
