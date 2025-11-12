<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('Dashboard');
    }

    public function system(string $system)
    {
        return Inertia::render('Dashboard', ['system' => $system]);
    }

    public function node(string $system, string $node)
    {
        return Inertia::render('Dashboard', ['system' => $system, 'node' => $node]);
    }
}
