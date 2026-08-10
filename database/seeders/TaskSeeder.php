<?php

namespace Database\Seeders;

use App\Models\Task;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tasks = [
            // ── Daily ────────────────────────────────────────────────
            [
                'code'           => 'daily_login',
                'title'          => 'Daily Login',
                'description'    => 'Log in to Lightverse every day to earn Light.',
                'icon'           => '📅',
                'type'           => 'daily',
                'light_type'     => 'active',
                'light_reward'   => 1,
                'required_count' => 1,
            ],

            // ── Weekly streak ────────────────────────────────────────
            [
                'code'           => 'weekly_streak',
                'title'          => 'Weekly Streak',
                'description'    => 'Log in 7 days in a row.',
                'icon'           => '🔥',
                'type'           => 'weekly',
                'light_type'     => 'active',
                'light_reward'   => 5,
                'required_count' => 7,
            ],

            // ── Monthly streak ───────────────────────────────────────
            [
                'code'           => 'monthly_streak',
                'title'          => 'Monthly Streak',
                'description'    => 'Log in 30 days in a row.',
                'icon'           => '🌟',
                'type'           => 'monthly',
                'light_type'     => 'stable',
                'light_reward'   => 25,
                'required_count' => 30,
            ],

            // ── Progressive — visit all galaxies ─────────────────────
            [
                'code'           => 'visit_all_galaxies',
                'title'          => 'Explorer',
                'description'    => 'Visit all galaxies in the Verse.',
                'icon'           => '🌌',
                'type'           => 'progressive',
                'light_type'     => 'stable',
                'light_reward'   => 25,
                'required_count' => 5,
            ],

            // ── One-time — create profile ─────────────────────────────
            [
                'code'           => 'create_profile',
                'title'          => 'First Steps',
                'description'    => 'Complete your Light Signature profile.',
                'icon'           => '🚀',
                'type'           => 'one_time',
                'light_type'     => 'active',
                'light_reward'   => 10,
                'required_count' => 1,
            ],

            // ── One-time — read 10 guides ─────────────────────────────
            [
                'code'           => 'read_10_nodes',
                'title'          => 'Knowledge Seeker',
                'description'    => 'Read 10 knowledge nodes across the Verse.',
                'icon'           => '📚',
                'type'           => 'progressive',
                'light_type'     => 'active',
                'light_reward'   => 50,
                'required_count' => 10,
            ],
        ];

        foreach ($tasks as $task) {
            Task::updateOrCreate(['code' => $task['code']], $task);
        }
    }
}
