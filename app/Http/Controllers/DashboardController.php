<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Universe view (shows both galaxies)
     */
    public function index(Request $request)
    {
        $this->logVisit($request, ['route' => 'dashboard.index', 'view' => 'universe']);

        return Inertia::render('Dashboard');
    }

    /**
     * Galaxy view (shows star systems within a galaxy)
     * Route: /galaxy/{galaxyId}
     */
    public function galaxy(Request $request, string $galaxyId)
    {
        $this->logVisit($request, [
            'route' => 'dashboard.galaxy',
            'galaxy' => $galaxyId,
            'view' => 'galaxy'
        ]);

        return Inertia::render('Dashboard', [
            'galaxy' => $galaxyId
        ]);
    }

    /**
     * System view (shows nodes orbiting a star)
     * Route: /galaxy/{galaxyId}/{systemId}
     */
    public function system(Request $request, string $galaxyId, string $systemId)
    {
        $this->logVisit($request, [
            'route' => 'dashboard.system',
            'galaxy' => $galaxyId,
            'system' => $systemId,
            'view' => 'system'
        ]);

        return Inertia::render('Dashboard', [
            'galaxy' => $galaxyId,
            'system' => $systemId
        ]);
    }

    /**
     * Node view (specific feature page)
     * Route: /galaxy/{galaxyId}/{systemId}/{nodeId}
     */
    public function node(Request $request, string $galaxyId, string $systemId, string $nodeId)
    {
        $this->logVisit($request, [
            'route' => 'dashboard.node',
            'galaxy' => $galaxyId,
            'system' => $systemId,
            'node' => $nodeId,
            'view' => 'node'
        ]);

        // ✅ AWARD EXPLORATION ACHIEVEMENTS
        $this->awardExplorationAchievement($request->user(), $nodeId);

        return Inertia::render('Dashboard', [
            'galaxy' => $galaxyId,
            'system' => $systemId,
            'node' => $nodeId
        ]);
    }

    /**
     * Award exploration achievements based on node visited
     */
    private function awardExplorationAchievement($user, string $nodeId): void
    {
        if (!$user) return;

        $achievements = app(\App\Services\AchievementsService::class);

        // Map node IDs to achievement codes
        $achievementMap = [
            'view' => 'visit_profile',
            'roadmap' => 'visit_roadmap',
            'list' => 'visit_achievements',
            // Add more mappings as needed
        ];

        $achievementCode = $achievementMap[$nodeId] ?? null;

        if ($achievementCode && !$achievements->has($user, $achievementCode)) {
            try {
                $achievements->unlock($user, $achievementCode);
                Log::info('EXPLORATION ACHIEVEMENT UNLOCKED', [
                    'user_id' => $user->id,
                    'achievement' => $achievementCode,
                    'node' => $nodeId
                ]);
            } catch (\Throwable $e) {
                Log::error('FAILED TO UNLOCK EXPLORATION ACHIEVEMENT', [
                    'user_id' => $user->id,
                    'achievement' => $achievementCode,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }

    private function logVisit(Request $request, array $context = []): void
    {
        $user = $request->user();

        if ($user === null) {
            return;
        }

        Log::info('dashboard.visit', array_merge([
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
            ],
            'url' => $request->fullUrl(),
            'ip' => $request->ip(),
        ], $context));
    }
}