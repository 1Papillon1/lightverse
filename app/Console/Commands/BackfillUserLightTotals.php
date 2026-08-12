<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\LightService;
use Illuminate\Console\Command;

class BackfillUserLightTotals extends Command
{
    protected $signature = 'light:backfill-user-totals';
    protected $description = 'Jednokratno popravlja users.core_light/stable_light/active_light/total_light iz light_transactions ledgera (nakon LightService::award() bugfixa)';

    public function handle(LightService $lightService): int
    {
        $users = User::all();
        $bar = $this->output->createProgressBar($users->count());

        foreach ($users as $user) {
            $breakdown = $lightService->calculateUser($user);

            $user->update([
                'core_light'   => $breakdown['core'],
                'stable_light' => $breakdown['stable'],
                'active_light' => $breakdown['active'],
                'total_light'  => $breakdown['total'],
            ]);

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("Backfilled Light totals for {$users->count()} users.");

        return self::SUCCESS;
    }
}