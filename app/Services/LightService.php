<?php

namespace App\Services;

use App\Models\User;
use App\Models\SystemState;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class LightService
{
    /**
     * Calculate user's Light breakdown (live, iz ledgera - izvor istine).
     */
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

    /**
     * Calculate system-wide Light totals
     */
    public function calculateSystem(): array
    {
        $state = SystemState::first();

        return [
            'core' => $state->core_light ?? 0,
            'stable' => $state->stable_light ?? 0,
            'active' => $state->active_light ?? 0,
            'total' => $state->total_light ?? 0,
            'stabilizing' => $state->stabilizing ?? false
        ];
    }

    /**
     * Award Light to a user
     */
    public function award(User $user, string $type, int $amount, ?string $source = null, ?Carbon $expiresAt = null): void
    {
        // ✅ VALIDATION
        if (!in_array($type, ['core', 'stable', 'active'])) {
            throw new \InvalidArgumentException("Invalid light type: {$type}");
        }

        if ($amount <= 0) {
            throw new \InvalidArgumentException("Light amount must be positive");
        }

        if ($type === 'active' && !$expiresAt) {
            throw new \InvalidArgumentException("Active light requires expires_at");
        }

        if ($type !== 'active' && $expiresAt) {
            throw new \InvalidArgumentException("Only active light can have expires_at");
        }

        DB::transaction(function () use ($user, $type, $amount, $source, $expiresAt) {
            $user->lightTransactions()->create([
                'type' => $type,
                'amount' => $amount,
                'source' => $source,
                'expires_at' => $expiresAt,
            ]);

            $this->updateSystemTotals($type, $amount);
            $this->updateUserTotals($user, $type, $amount);
        });
    }

    /**
     * Reconcile (ukloni) istekli Active Light - poziva ga ReconcileExpiredLight command.
     * Ovdje mora simetrično oduzeti i sa SystemState i s User cache stupaca -
     * inače se ponavlja ista greška u suprotnom smjeru (stupci ostaju previsoki zauvijek).
     */
    public function reconcileExpired(\App\Models\LightTransaction $transaction): void
    {
        DB::transaction(function () use ($transaction) {
            $transaction->update(['reconciled_at' => now()]);

            $state = SystemState::first();
            if ($state) {
                $state->active_light -= $transaction->amount;
                $state->total_light -= $transaction->amount;
                $state->save();
            }

            $user = $transaction->user;
            $user->decrement('active_light', $transaction->amount);
            $user->decrement('total_light', $transaction->amount);
        });
    }

    /**
     * Update system-wide Light totals
     */
    private function updateSystemTotals(string $type, int $amount): void
    {
        $state = SystemState::firstOrCreate(
            ['id' => 1],
            [
                'core_light' => 0,
                'stable_light' => 0,
                'active_light' => 0,
                'total_light' => 0,
                'stabilizing' => false,
            ]
        );

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

    /**
     * Update user's cached Light columns (core_light/stable_light/active_light/total_light).
     * Ovo je jedini razlog zašto ti stupci uopće postoje - brzo sortiranje na
     * RankingController leaderboardu bez live SUM() preko cijele light_transactions
     * tablice za svakog usera. Ledger (light_transactions) ostaje izvor istine;
     * ovi stupci su isključivo denormalizirani cache za performanse.
     */
    private function updateUserTotals(User $user, string $type, int $amount): void
    {
        $column = "{$type}_light"; // core_light / stable_light / active_light

        $user->increment($column, $amount);
        $user->increment('total_light', $amount);
    }
}