<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $this->logVisit($request, ['route' => 'dashboard.index']);

        return Inertia::render('Dashboard');
    }

    public function system(Request $request, string $system)
    {
        $this->logVisit($request, ['route' => 'dashboard.system', 'system' => $system]);

        return Inertia::render('Dashboard', ['system' => $system]);
    }

    public function node(Request $request, string $system, string $node)
    {
        $this->logVisit($request, ['route' => 'dashboard.node', 'system' => $system, 'node' => $node]);

        return Inertia::render('Dashboard', ['system' => $system, 'node' => $node]);
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
                'email' => $user->email,
            ],
            'url' => $request->fullUrl(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ], $context));
    }
}
