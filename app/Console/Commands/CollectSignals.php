<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CollectSignals extends Command
{
    protected $signature   = 'signals:collect';
    protected $description = 'Run the Python signal collector';

    public function handle(): void
    {
        $scriptPath = base_path('scripts/collector/collector.py');
        $outputPath = storage_path('app/signals.json');

        $this->info('Running signal collector...');

        $command = "python3 {$scriptPath} 2>&1";
        exec($command, $output, $exitCode);

        if ($exitCode !== 0) {
            Log::error('Signal collector failed', ['output' => $output]);
            $this->error('Collector failed — check logs.');
            return;
        }

        // Move output to storage
        $generatedPath = base_path('scripts/collector/signals.json');
        if (file_exists($generatedPath)) {
            copy($generatedPath, $outputPath);
            unlink($generatedPath);
        }

        $this->info('Signals collected and stored at ' . $outputPath);
        Log::info('SIGNALS COLLECTED', ['exit_code' => $exitCode]);
    }
}
