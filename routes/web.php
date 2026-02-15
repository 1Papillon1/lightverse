<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Api\UserAchievementController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ============================================
// 🔐 AUTHENTICATION ROUTES
// ============================================
Route::get('/login', fn () => Inertia::render('Authorization', ['mode' => 'login']))->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.submit');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

Route::get('/register', fn () => Inertia::render('Authorization', ['mode' => 'signup']))->name('register');
Route::post('/register', [AuthController::class, 'register'])->name('register.submit');

// ============================================
// 🌌 UNIVERSE / DASHBOARD ROUTES
// ============================================
Route::middleware(['auth'])->group(function () {
    
    // Universe view (shows both galaxies)
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // Galaxy view (shows star systems)
    Route::get('/galaxy/{galaxyId}', [DashboardController::class, 'galaxy'])->name('dashboard.galaxy');
    
    // System view (shows orbiting nodes)
    Route::get('/galaxy/{galaxyId}/{systemId}', [DashboardController::class, 'system'])->name('dashboard.system');
    
    // Node view (specific feature page)
    Route::get('/galaxy/{galaxyId}/{systemId}/{nodeId}', [DashboardController::class, 'node'])->name('dashboard.node');
});

// Redirect "/" to "/dashboard"
Route::get('/', function () {
    return auth()->check()
        ? redirect()->route('dashboard')
        : redirect()->route('login');
});

// ============================================
// 🎯 ACHIEVEMENTS API
// ============================================
Route::middleware(['auth'])->prefix('api')->group(function () {
    Route::get('/achievements', [UserAchievementController::class, 'index'])->name('api.achievements');
});

// ============================================
// 🔧 ADMIN ROUTES (Optional - for future)
// ============================================
Route::middleware(['auth', 'admin'])->prefix('admin')->group(function () {
    // Admin dashboard, achievement management, etc.
});