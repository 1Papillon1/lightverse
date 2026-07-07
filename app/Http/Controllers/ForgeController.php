<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Models\Generator;
use App\Services\LightService;

class ForgeController extends Controller
{
    // ─── GET /galaxy/forge/light-generator ───────────────────────────────────
    //
    // Renders the LightGenerator page.
    // Passes the user's current generator state as Inertia props.

   

    // ─── POST /api/generator/action ──────────────────────────────────────────
    //
    // Single endpoint for all generator state transitions.
    // Actions: begin | gate_passed | stage_begin | charge_complete |
    //          stage_advance | complete

    public function action(Request $request, LightService $lightService)
    {
        $user   = $request->user();
        $action = $request->input('action');

        $generator = Generator::firstOrCreate(
            ['user_id' => $user->id],
            [
                'state'            => 'inactive',
                'current_stage'    => 1,
                'stage_started_at' => null,
                'completed_stages' => [],
            ]
        );

        match ($action) {

            // User clicks "Begin construction" on the inactive screen
            'begin' => $generator->fill([
                'state'         => 'waiting',
                'current_stage' => 1,
            ]),

            // User visited the manual node (gate for Stage 1)
            'gate_passed' => $generator->fill([
                'completed_stages' => array_unique(
                    array_merge($generator->completed_stages ?? [], ['foundation-gate'])
                ),
            ]),

            // User clicks to start a timed stage
            'stage_begin' => $generator->fill([
                'state'            => 'active',
                'stage_started_at' => now(),
            ]),

            // Spacebar charge completed (Stage 2)
            'charge_complete' => $generator->fill([
                'state'            => 'waiting',
                'current_stage'    => 3,
                'stage_started_at' => null,
                'completed_stages' => array_unique(
                    array_merge($generator->completed_stages ?? [], ['core-ignition'])
                ),
            ]),

            // User advances from one waiting stage to the next
            'stage_advance' => (function () use ($generator, $request) {
                $completed = $request->input('completed');
                $next      = (int) $request->input('nextStage', $generator->current_stage + 1);

                $generator->fill([
                    'state'            => 'waiting',
                    'current_stage'    => $next,
                    'stage_started_at' => null,
                    'completed_stages' => array_unique(
                        array_merge($generator->completed_stages ?? [], array_filter([$completed]))
                    ),
                ]);
            })(),

            // Final stage complete — award Light
            'complete' => (function () use ($generator, $request, $user, $lightService) {
                $completed = $request->input('completed');

                $generator->fill([
                    'state'            => 'complete',
                    'stage_started_at' => null,
                    'completed_stages' => array_unique(
                        array_merge($generator->completed_stages ?? [], array_filter([$completed]))
                    ),
                ]);

                // Award the completion Light
                $lightService->award(
                    user:      $user,
                    type:      'active',
                    amount:    87, // matches generatorConfig.completionLight
                    source:    'generator:complete',
                    expiresAt: now()->addDays(30),
                );

                Log::info('GENERATOR COMPLETE', [
                    'user_id' => $user->id,
                    'light'   => 87,
                ]);
            })(),

            default => null,
        };

        $generator->save();

        return back()->with('generator', [
            'state'           => $generator->state,
            'currentStage'    => $generator->current_stage,
            'stageStartedAt'  => $generator->stage_started_at?->toIso8601String(),
            'completedStages' => $generator->completed_stages ?? [],
        ]);
    }

    // ─── POST /api/light/award ────────────────────────────────────────────────
    //
    // Generic Light award endpoint used by Proving Grounds (Trials, Signal Scan).
    // Validates source prefix so it cannot be abused for arbitrary amounts.

    public function awardLight(Request $request, LightService $lightService)
    {
        $request->validate([
            'source' => ['required', 'string', 'max:80'],
            'type'   => ['required', 'in:active,stable,core'],
            'amount' => ['required', 'integer', 'min:1', 'max:100'],
        ]);

        $allowedSources = ['trial:', 'signal_scan', 'generator:'];
        $source         = $request->input('source');

        $allowed = collect($allowedSources)->contains(
            fn ($prefix) => str_starts_with($source, $prefix) || $source === $prefix
        );

        if (!$allowed) {
            return response()->json(['error' => 'Invalid source'], 422);
        }

        $lightService->award(
            user:      $request->user(),
            type:      $request->input('type'),
            amount:    $request->input('amount'),
            source:    $source,
            expiresAt: $request->input('type') === 'active' ? now()->addDays(30) : null,
        );

        return response()->json(['ok' => true]);
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private function awardExplorationAchievement($user, string $urlSegment): void
    {
        if (!$user) return;

        $code         = 'explore_' . str_replace('-', '_', $urlSegment);
        $achievements = app(\App\Services\AchievementsService::class);

        if ($achievements->has($user, $code)) return;

        try {
            $achievements->unlock($user, $code);
        } catch (\Throwable $e) {
            Log::warning('FORGE ACHIEVEMENT SKIPPED', [
                'user_id' => $user->id,
                'code'    => $code,
                'reason'  => $e->getMessage(),
            ]);
        }
    }
}