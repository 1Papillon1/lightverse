<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Models\User;

class DashboardController extends Controller
{

    private function checkSystemMastery(User $user, string $systemId)
    {
        // Mapiranje sustava na njihove planete (Node-ove)
        // Napomena: ovo bi u budućnosti moglo ići u poseban universe.php config
        $masteryMap = [
            'light-codex' => ['explore_what_is_light', 'explore_earning', 'explore_economy'],
            'exchange'    => ['explore_what_is_money', 'explore_how_banks_work', 'explore_inflation'],
        ];

        if (!isset($masteryMap[$systemId])) return;

        $requirements = $masteryMap[$systemId];
        $unlockedCount = $user->achievements()->whereIn('code', $requirements)->count();

        if ($unlockedCount === count($requirements)) {
            $masteryCode = str_replace('-', '_', $systemId) . '_complete';
            app(\App\Services\AchievementsService::class)->unlock($user, $masteryCode);
        }
    }

    public function index(Request $request)
    {
        $this->logVisit($request, ['route' => 'dashboard.index', 'view' => 'universe']);

        return Inertia::render('Dashboard');
    }

    public function galaxy(Request $request, string $galaxyId)
    {
        $this->logVisit($request, [
            'route'  => 'dashboard.galaxy',
            'galaxy' => $galaxyId,
            'view'   => 'galaxy',
        ]);

        $this->awardExplorationAchievement($request->user(), $galaxyId);

        return Inertia::render('Dashboard', ['galaxy' => $galaxyId]);
    }

    public function system(Request $request, string $galaxyId, string $systemId)
    {
        $this->logVisit($request, [
            'route'  => 'dashboard.system',
            'galaxy' => $galaxyId,
            'system' => $systemId,
            'view'   => 'system',
        ]);

        $this->awardExplorationAchievement($request->user(), $systemId);

        return Inertia::render('Dashboard', [
            'galaxy' => $galaxyId,
            'system' => $systemId,
        ]);
    }

    public function node(Request $request, string $galaxyId, string $systemId, string $nodeId)
    {
        $user = $request->user(); // ✅ add this

         $this->awardExplorationAchievement($user, $galaxyId);
        $this->awardExplorationAchievement($user, $systemId);
        $this->awardExplorationAchievement($user, $nodeId);

        // 2. Provjera Mastery-a (je li sustav gotov?)
        $this->checkSystemMastery($user, $systemId);

        $this->logVisit($request, [
            'route'  => 'dashboard.node',
            'galaxy' => $galaxyId,
            'system' => $systemId,
            'node'   => $nodeId,
            'view'   => 'node',
        ]);

        $this->awardExplorationAchievement($user, $nodeId); // ✅ use $user directly now

        $component = $this->resolveNodeComponent($galaxyId, $systemId, $nodeId);

        Log::info('NODE COMPONENT RESOLVED', [
            'galaxy'    => $galaxyId,
            'system'    => $systemId,
            'node'      => $nodeId,
            'component' => $component,
        ]);

        $extraProps = [];
        if ($nodeId === 'build-area' && $galaxyId === 'forge') {
            $generator = \App\Models\Generator::where('user_id', $user->id)->first();
            $extraProps['generator'] = $generator ? [
                'state'           => $generator->state,
                'currentStage'    => $generator->current_stage,
                'stageStartedAt'  => $generator->stage_started_at?->toIso8601String(),
                'completedStages' => $generator->completed_stages ?? [],
            ] : null;
        }

        // ─── Signal: News feed nodes ──────────────────────────────────────
        if ($galaxyId === 'signal') {
            $signalService = app(\App\Services\SignalService::class);

            $extraProps['signals'] = match($nodeId) {
                'all-signals'        => $signalService->recent(50)->values()->toArray(),
                'by-source'          => $signalService->all()->groupBy('source_type')->toArray(),
                'markets-crypto'     => $signalService->forGalaxyRecent('crypto', 30)->values()->toArray(),
                'science-tech'       => $signalService->forGalaxyRecent('science', 30)->values()->toArray(),
                'politics-conflict'  => $signalService->forGalaxyRecent('politics', 30)->values()->toArray(),
                default              => [],
            };

            $extraProps['lastUpdated']      = $signalService->lastUpdated();
            $extraProps['sourceBreakdown']  = $signalService->sourceBreakdown();
        }


        return Inertia::render($component, array_merge([
            'galaxy' => $galaxyId,
            'system' => $systemId,
            'node'   => $nodeId,
        ], $extraProps));
    }

    private function resolveNodeComponent(string $galaxyId, string $systemId, string $nodeId): string
    {
        $galaxy = $this->kebabToPascal($galaxyId);
        $system = $this->kebabToPascal($systemId);
        $node   = $this->kebabToPascal($nodeId);

        return "Galaxy/{$galaxy}/{$system}/{$node}";
    }

    private function kebabToPascal(string $kebab): string
    {
        return str_replace(' ', '', ucwords(str_replace('-', ' ', $kebab)));
    }

    /**
     * Award exploration achievement from URL segment.
     * Convention: kebab-case segment → snake_case → "explore_{segment}"
     * e.g. "lumina-archives" → "explore_lumina_archives"
     *      "earning"         → "explore_earning"
     *      "knowledge"       → "explore_knowledge"
     */
    private function awardExplorationAchievement(?User $user, string $urlSegment): void
    {
        if (!$user) return;

        $code = 'explore_' . str_replace('-', '_', $urlSegment);

        $achievements = app(\App\Services\AchievementsService::class);

        if ($achievements->has($user, $code)) return;

        try {
            $achievements->unlock($user, $code);
            Log::info('EXPLORATION ACHIEVEMENT UNLOCKED', [
                'user_id' => $user->id,
                'code'    => $code,
                'segment' => $urlSegment,
            ]);
        } catch (\Throwable $e) {
            // Silently skip if code not in config — new routes won't break
            Log::warning('EXPLORATION ACHIEVEMENT SKIPPED', [
                'user_id' => $user->id,
                'code'    => $code,
                'reason'  => $e->getMessage(),
            ]);
        }
    }

    private function logVisit(Request $request, array $context = []): void
    {
        $user = $request->user();
        if ($user === null) return;

        Log::info('dashboard.visit', array_merge([
            'user' => [
                'id'       => $user->id,
                'username' => $user->username,
            ],
            'url' => $request->fullUrl(),
            'ip'  => $request->ip(),
        ], $context));
    }
}