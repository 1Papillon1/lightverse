<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\LightTransaction;
use App\Models\SystemState;
use Carbon\Carbon;

class ReconcileExpiredLight extends Command
{
    protected $signature = 'light:reconcile-expired';
    protected $description = 'Remove expired active light from system totals';

    public function handle()
    {
        $expired = LightTransaction::where('type', 'active')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', Carbon::now())
            ->whereNull('reconciled_at')
            ->get();

        if ($expired->isEmpty()) {
            return;
        }

        $state = SystemState::first();

        foreach ($expired as $transaction) {
            $state->active_light -= $transaction->amount;
            $state->total_light -= $transaction->amount;

            $transaction->reconciled_at = Carbon::now();
            $transaction->save();
        }

        $state->save();
    }
}