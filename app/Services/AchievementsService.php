<?php

namespace App\Services;

use App\Models\Achievement;
use App\Models\User;
use Carbon\Carbon;

class AchievementsService
{
    protected LightService $light;

    public function __construct(LightService $light)
    {
        $this->light = $light;
    }

    public function has(User $user, string $code): bool
    {
        return $user->achievements()->where('code', $code)->exists();
    }

    public function unlock(User $user, string $code, array $data = [])
    {
        if ($this->has($user, $code)) {
            return false;
        }

        // ✅ GET CONFIG
        $config = config('achievements')[$code] ?? null; 
        
        if (!$config) {
            throw new \Exception("Achievement {$code} not defined in config");
        }

        // Merge data
        $achievementData = array_merge($config['data'] ?? [], $data);

        // Create achievement
        $achievement = Achievement::firstOrCreate(
            ['code' => $code],
            [
                'name' => $config['name'],
                'category' => $config['category'],
                'data' => $achievementData
            ]
        );

        // Unlock for user
        $user->achievements()->attach($achievement->id, [
            'unlocked_at' => now()
        ]);

        // ✅ AWARD LIGHT FROM CONFIG
        $this->light->award(
            user: $user,
            type: 'active',
            amount: $config['light'], // ✅ FROM CONFIG
            source: "achievement:{$code}",
            expiresAt: Carbon::now()->addDays(30)
        );

        return $achievement;
    }
}