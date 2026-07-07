<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
 
class SetDefaultAvatarColors extends Command
{
    protected $signature   = 'users:set-default-avatar-colors';
    protected $description = 'Set default cosmic avatar color for users who have none';
 
    // Cosmic color palette — one assigned per user based on their ID
    protected array $cosmicColors = [
        '#ff9900', // amber — Identity Nebula
        '#9966ff', // purple — Lumina Archives
        '#00ccaa', // teal — Proving Grounds
        '#ff6644', // coral
        '#44aaff', // sky blue
        '#cc44ff', // violet
        '#ffcc00', // golden
        '#00ddbb', // mint
    ];
 
    public function handle(): void
    {
        $users = User::whereNull('cosmic_color')
            ->orWhere('cosmic_color', '')
            ->get();
 
        if ($users->isEmpty()) {
            $this->info('All users already have avatar colors.');
            return;
        }
 
        foreach ($users as $user) {
            $color = $this->cosmicColors[$user->id % count($this->cosmicColors)];
            $user->update(['cosmic_color' => $color]);
        }
 
        $this->info("Set avatar colors for {$users->count()} users.");
    }
}