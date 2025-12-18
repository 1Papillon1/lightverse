<?php 

namespace App\Services;

use App\Models\LightwebCoinDrop;
use App\Models\User;
use App\Models\UserBalance;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class LightwebCoinService
{

    // utils
     protected function generateCoordinates(): array
    {
        return [
            'x' => rand(-30, 30),
            'y' => rand(2, 8),
            'z' => rand(-20, 20),
        ];
    }

    protected function generateRotation(): array
        {
            return [
                'x' => rand(0, 628) / 100, // 0 → 2π
                'y' => rand(0, 628) / 100,
                'z' => rand(0, 628) / 100,
            ];
        }


    /**
     * Spawn ONE coin
     */
   public function spawnDrop(User $user, string $reason, string $location)
{
    $coords = $this->generateCoordinates();
    $rotation = $this->generateRotation();

    return LightwebCoinDrop::create([
        'user_id'        => $user->id,
        'reason'         => $reason,

        // Position
        'x'              => $coords['x'],
        'y'              => $coords['y'],
        'z'              => $coords['z'],

        // 🔁 Rotation (PERSISTED)
        'rot_x'          => $rotation['x'],
        'rot_y'          => $rotation['y'],
        'rot_z'          => $rotation['z'],

        'spawn_location' => $location,
        'expires_at'     => now()->addHours(24),
        'claimed'        => false,
    ]);
}

    /**
     * Spawn many coins (loop)
     */
    public function spawnMultiple(User $user, int $count, string $reason, string $location)
    {
        $drops = [];

        for ($i = 0; $i < $count; $i++) {
            $drops[] = $this->spawnDrop($user, $reason, $location);
        }

        return $drops;
    }

    /**
     * Claim coin
     */
    public function claimDrop(User $user, LightwebCoinDrop $drop)
    {
        if ($drop->claimed) return false;
        if ($drop->user_id !== $user->id) return false;
        if ($drop->isExpired()) return false;

        DB::transaction(function () use ($user, $drop) {
            $drop->update([
                'claimed' => true,
                'claimed_at' => now()
            ]);

            $this->addBalance($user, 1);
        });

        return true;
    }

    public function addBalance(User $user, int $amount)
    {
        $balance = UserBalance::firstOrCreate(
            ['user_id' => $user->id],
            ['balance' => 0]
        );

        $balance->increment('balance', $amount);
        return $balance;
    }

   

    /**
     * FIRST LOGIN REWARD = exactly 5 coins
     */
    public function spawnFirstLoginDrops(User $user)
    {
        $locations = [
            'page:overview.about',
            'page:overview.roadmap',
            'page:overview.social',
            'system:markets',
            'system:overview',
        ];

        $drops = [];

        foreach ($locations as $loc) {
            $drops[] = $this->spawnDrop(
                user: $user,
                reason: 'first_login_reward',
                location: $loc
            );
        }

        return $drops;
    }
}
