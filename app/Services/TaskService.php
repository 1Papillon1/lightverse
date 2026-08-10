<?php

namespace App\Services;

use App\Models\Task;
use App\Models\User;
use App\Models\UserTask;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class TaskService
{
    public function __construct(
        protected LightService        $light,
        protected NotificationService $notifications,
    ) {}

    // ─────────────────────────────────────────────────────────────────
    // DAILY LOGIN
    // ─────────────────────────────────────────────────────────────────

    public function handleDailyLogin(User $user): void
    {
        $task = Task::where('code', 'daily_login')->first();
        if (!$task) return;

        $userTask = $this->getOrCreate($user, $task);

        // Already claimed today
        if ($userTask->last_reset_at &&
            $userTask->last_reset_at->isToday()) {
            return;
        }

        // Award daily login Light
        $this->complete($user, $task, $userTask, 'Daily login');

        // Update streak tasks
        $this->incrementStreak($user, 'weekly_streak', 7);
        $this->incrementStreak($user, 'monthly_streak', 30);
    }

    // ─────────────────────────────────────────────────────────────────
    // PROGRESSIVE TASK PROGRESS
    // ─────────────────────────────────────────────────────────────────

    public function progress(User $user, string $taskCode): void
    {
        $task = Task::where('code', $taskCode)->where('active', true)->first();
        if (!$task) return;

        $userTask = $this->getOrCreate($user, $task);

        // Already completed one-time tasks
        if ($userTask->completed && $task->type === 'one_time') return;
        if ($userTask->completed && $task->type === 'progressive') return;

        $userTask->progress = min($userTask->progress + 1, $task->required_count);
        $userTask->save();

        $current = $userTask->progress;
        $total   = $task->required_count;

        if ($current < $total) {
            // Progress notification
            NotificationService::create(
                user:    $user,
                type:    'task_progress',
                title:   "{$task->icon} {$task->title}",
                message: "Progress: {$current}/{$total} — keep going!",
                metadata: [
                    'task_code' => $taskCode,
                    'progress'  => $current,
                    'total'     => $total,
                ]
            );
            return;
        }

        // Completed
        $this->complete($user, $task, $userTask, $task->title);
    }

    // ─────────────────────────────────────────────────────────────────
    // COMPLETE A TASK
    // ─────────────────────────────────────────────────────────────────

    private function complete(User $user, Task $task, UserTask $userTask, string $source): void
    {
        // Award Light
        $this->light->award(
            user:      $user,
            type:      $task->light_type,
            amount:    $task->light_reward,
            source:    "task:{$task->code}",
            expiresAt: $task->light_type === 'active'
                ? Carbon::now()->addDays(30)
                : null,
        );

        // Mark complete
        $userTask->completed    = true;
        $userTask->completed_at = now();
        $userTask->last_reset_at = now();
        $userTask->progress     = $task->required_count;
        $userTask->save();

        // Completion notification
        NotificationService::create(
            user:      $user,
            type:      'task_complete',
            title:     "✦ {$task->title} completed!",
            message:   "You earned +{$task->light_reward} Light.",
            metadata: [
                'task_code'    => $task->code,
                'light_amount' => $task->light_reward,
                'light_type'   => $task->light_type,
            ]
        );

        Log::info('TASK COMPLETED', [
            'user_id'   => $user->id,
            'task_code' => $task->code,
            'light'     => $task->light_reward,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────
    // STREAK HANDLING
    // ─────────────────────────────────────────────────────────────────

    private function incrementStreak(User $user, string $taskCode, int $required): void
    {
        $task = Task::where('code', $taskCode)->first();
        if (!$task) return;

        $userTask = $this->getOrCreate($user, $task);

        // Reset streak if missed a day
        if ($userTask->last_reset_at &&
            !$userTask->last_reset_at->isYesterday() &&
            !$userTask->last_reset_at->isToday()) {
            $userTask->progress  = 0;
            $userTask->completed = false;
            $userTask->save();
        }

        // Don't double count today
        if ($userTask->last_reset_at && $userTask->last_reset_at->isToday()) return;

        $userTask->progress = min($userTask->progress + 1, $required);
        $userTask->last_reset_at = now();
        $userTask->save();

        if ($userTask->progress >= $required && !$userTask->completed) {
            $this->complete($user, $task, $userTask, $task->title);

            // Reset for next cycle
            $userTask->completed = false;
            $userTask->progress  = 0;
            $userTask->save();
        } else {
            // Progress notification for streaks
            $current = $userTask->progress;
            NotificationService::create(
                user:    $user,
                type:    'task_progress',
                title:   "{$task->icon} {$task->title}",
                message: "Streak: {$current}/{$required} days",
                metadata: ['task_code' => $taskCode, 'progress' => $current, 'total' => $required]
            );
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────

    private function getOrCreate(User $user, Task $task): UserTask
    {
        return UserTask::firstOrCreate(
            ['user_id' => $user->id, 'task_id' => $task->id],
            ['progress' => 0, 'completed' => false]
        );
    }

    public function getUserTasks(User $user): array
    {
        $tasks    = Task::where('active', true)->get();
        $userTasks = UserTask::where('user_id', $user->id)
            ->whereIn('task_id', $tasks->pluck('id'))
            ->get()
            ->keyBy('task_id');

        return $tasks->map(function ($task) use ($userTasks) {
            $ut = $userTasks->get($task->id);
            return [
                'code'          => $task->code,
                'title'         => $task->title,
                'description'   => $task->description,
                'icon'          => $task->icon,
                'type'          => $task->type,
                'light_reward'  => $task->light_reward,
                'light_type'    => $task->light_type,
                'required_count'=> $task->required_count,
                'progress'      => $ut?->progress ?? 0,
                'completed'     => $ut?->completed ?? false,
                'completed_at'  => $ut?->completed_at,
            ];
        })->toArray();
    }
}