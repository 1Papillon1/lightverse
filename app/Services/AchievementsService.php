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

    $config = config("achievements.{$code}"); // Kraća sintaksa
    
    if (!$config) {
        Log::warning("Achievement {$code} not defined in config.");
        return false;
    }

    // Odredi tip svjetla iz konfiga, default je 'active'
    $lightType = $config['type'] ?? 'active';
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
            type: $lightType, // ✅ FROM CONFIG
            amount: $config['light'], // ✅ FROM CONFIG
            source: "achievement:{$code}",
            expiresAt: $lightType === 'active' ? now()->addDays(30) : null
        );

        return $achievement;
    }
}