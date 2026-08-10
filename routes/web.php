<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Api\UserAchievementController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\ForgeController;
use Illuminate\Http\Request;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProfileController;
use Inertia\Inertia;


// ============================================
// 🗺 SITEMAP ROUTE
// ============================================
Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('sitemap');


// ============================================
// 🌐 LANDING PAGE (Public or redirect if authenticated)
// ============================================
Route::get('/', function () {
    return auth()->check() 
        ? redirect()->route('dashboard')
        : Inertia::render('Landing');
})->name('home');

Route::get('/za-tebe', function () {
    return response()->file(resource_path('js/pages/Easter/index.html'));
})->name('easter');

// ============================================
// 🔐 AUTHENTICATION ROUTES (Guest only)
// ============================================
Route::middleware(['guest'])->group(function () {
    Route::get('/login', fn () => Inertia::render('Authorization', ['mode' => 'login']))
        ->name('login');
    
    Route::get('/register', fn () => Inertia::render('Authorization', ['mode' => 'signup']))
        ->name('register');
});

// Auth POST routes (no guest middleware needed)
Route::post('/login', [AuthController::class, 'login'])->name('login.submit');
Route::post('/register', [AuthController::class, 'register'])->name('register.submit');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');





// ============================================
// 🌌 UNIVERSE / DASHBOARD ROUTES
// ============================================
Route::middleware(['auth'])->group(function () {

Route::get('/api/light', function (Request $request) {
    return response()->json(
        app(\App\Services\LightService::class)->calculateUser($request->user())
    );
})->name('api.light');
    
    // Universe view (shows both galaxies)
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // Galaxy view (shows star systems)
    Route::get('/galaxy/{galaxyId}', [DashboardController::class, 'galaxy'])->name('dashboard.galaxy');
    
    // System view (shows orbiting nodes)
    Route::get('/galaxy/{galaxyId}/{systemId}', [DashboardController::class, 'system'])->name('dashboard.system');
    
    // Node view (specific feature page)
    Route::get('/galaxy/{galaxyId}/{systemId}/{nodeId}', [DashboardController::class, 'node'])->name('dashboard.node');
});

// ============================================
// 🔥 THE FORGE — Direct-node routes
// (Forge has no star system layer — generator
//  lives directly under the galaxy)
// ============================================
Route::middleware(['auth'])->group(function () {
 
  
 
    // Generator state actions (POST)
    Route::post('/api/generator/action', [ForgeController::class, 'action'])
        ->name('api.generator.action');
 
    // Light award endpoint (used by Proving Grounds + Forge)
    Route::post('/api/light/award', [ForgeController::class, 'awardLight'])
        ->name('api.light.award');
 
});


// Redirect "/" to "/dashboard"

/* Route::get('/', function () {
    return auth()->check()
        ? redirect()->route('dashboard')
        : redirect()->route('login');
}); */

Route::middleware('auth')->group(function () {
    // Mark as read
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead'])
        ->name('notifications.read');
    
    // Mark all as read
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])
        ->name('notifications.markAllRead');
    
    // Delete notification
    Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy'])
        ->name('notifications.destroy');
    
    // View all (optional separate page)
    Route::get('/notifications', [NotificationController::class, 'index'])
        ->name('notifications.index');
});

// ============================================
// Notifications API (for fetching notifications via AJAX)
// ============================================
Route::get('/api/notifications', function (Request $request) {
    $notifications = $request->user()
        ->notifications()
        ->orderBy('created_at', 'desc')
        ->limit(50)
        ->get()
        ->map(fn($n) => [
            'id'         => $n->id,
            'type'       => $n->type,
            'title'      => $n->title,
            'message'    => $n->message,
            'action_url' => $n->action_url,
            'metadata'   => $n->metadata,
            'read_at'    => $n->read_at,
            'created_at' => $n->created_at,
        ]);

    return response()->json([
        'notifications' => $notifications,
        'unread_count'  => $notifications->filter(fn($n) => !$n['read_at'])->count(),
    ]);
})->middleware('auth');

// ============================================
// 👤 PROFILE ROUTE
// ============================================
Route::middleware(['auth'])->group(function () {
    Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');
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





// ============================================
// 📱 DEVICE API ROUTES (for Aljmas mobile app
// ============================================
// Aljmaš Discovery App
Route::prefix('aljmasapphidden')
    ->withoutMiddleware([
        HandleInertiaRequests::class,
        \App\Http\Middleware\HandleAppearance::class,
        \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
    ])
    ->group(function () {
        Route::post('/device/register', [App\Http\Controllers\AljmasDeviceController::class, 'register']);

        Route::middleware('device.uuid')
            ->withoutMiddleware([
                HandleInertiaRequests::class,
                \App\Http\Middleware\HandleAppearance::class,
                \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            ])
            ->group(function () {
                Route::get('/progress', [App\Http\Controllers\AljmasDeviceController::class, 'progress']);
                Route::get('/locations', [App\Http\Controllers\AljmasLocationController::class, 'index']);
                Route::get('/locations/{location}', [App\Http\Controllers\AljmasLocationController::class, 'show']);
                Route::post('/locations/{location}/unlock', [App\Http\Controllers\AljmasLocationController::class, 'unlock']);
            });
    });