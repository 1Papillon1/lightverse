<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\LightTransaction;
use App\Services\LightService;
use Carbon\Carbon;

class ReconcileExpiredLight extends Command
{
    protected $signature = 'light:reconcile-expired';
    protected $description = 'Remove expired active light from system totals and affected users';

    public function handle(LightService $lightService)
    {
        $expired = LightTransaction::where('type', 'active')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', Carbon::now())
            ->whereNull('reconciled_at')
            ->get();

        if ($expired->isEmpty()) {
            return;
        }

        foreach ($expired as $transaction) {
            // reconcileExpired() radi sve u jednoj DB transakciji:
            // - označi transaction kao reconciled
            // - oduzme sa SystemState (active_light, total_light)
            // - oduzme s usera (active_light, total_light) <- ovo je prije nedostajalo,
            //   pa su users.active_light/total_light ostajali trajno previsoki nakon isteka
            $lightService->reconcileExpired($transaction);
        }
    }
}