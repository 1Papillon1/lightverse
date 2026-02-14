<?php

namespace App\Services;

use App\Models\User;
use App\Models\SystemState;
use Carbon\Carbon;

class LightService
{

    public function calculateUser(User $user): array
    {
        $core = $user->lightTransactions()
            ->where('type', 'core')
            ->sum('amount');

        $stable = $user->lightTransactions()
            ->where('type', 'stable')
            ->sum('amount');

        $active = $user->lightTransactions()
            ->where('type', 'active')
            ->where(function ($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>', Carbon::now());
            })
            ->sum('amount');

        return [
            'core' => $core,
            'stable' => $stable,
            'active' => $active,
            'total' => $core + $stable + $active
        ];
    }

    public function calculateSystem(): array
    {
        $state = SystemState::first();

        return [
            'core' => $state->core_light,
            'stable' => $state->stable_light,
            'active' => $state->active_light,
            'total' => $state->total_light,
            'stabilizing' => $state->stabilizing
        ];
    }

    public function award(User $user, string $type, int $amount, ?string $source = null, ?Carbon $expiresAt = null): void
    {
        $user->lightTransactions()->create([
            'type' => $type,
            'amount' => $amount,
            'source' => $source,
            'expires_at' => $expiresAt,
        ]);

        $this->updateSystemTotals($type, $amount);
    }

    private function updateSystemTotals(string $type, int $amount): void
    {
        $state = SystemState::first();

        if ($type === 'core') {
            $state->core_light += $amount;
        }

        if ($type === 'stable') {
            $state->stable_light += $amount;
        }

        if ($type === 'active') {
            $state->active_light += $amount;
        }

        $state->total_light += $amount;
        $state->save();
    }

    

}

