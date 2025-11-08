<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Http;





Route::get('/test-api', function () {
    $response = Http::get('https://api.coinpaprika.com/v1/tickers?quotes=USD');

    return $response->body(); // Ili ->json() da vidiš JSON odmah
});

// Sitemap ruta
Route::get('/sitemap.xml', function () {
    // List your important routes here
    $urls = [
        URL::to('/'),
        URL::to('/dashboard'),
        URL::to('/wallet'),
        URL::to('/wallet/view'),
        URL::to('/wallet/connect'),
        URL::to('/ai'),
        URL::to('/markets'),
        URL::to('/contracts'),
        URL::to('/roadmap'),
        URL::to('/watchlist'),
    ];

    // Add dynamic markets (optional)
    $symbols = ['BTC', 'ETH', 'AVAX', 'SOL']; // Example
    foreach ($symbols as $symbol) {
        $urls[] = URL::to("/markets/{$symbol}");
    }

    return response()
        ->view('sitemap', compact('urls'))
        ->header('Content-Type', 'application/xml');
});


// Authentication routes
Route::post('/login', [AuthController::class, 'login'])->name('login.submit');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
Route::post('/logout',   [AuthController::class, 'logout'])->name('logout');

Route::post('/register', [AuthController::class, 'register']);


 


// Dashboard (kao /dashboard)
// Only one dashboard route
Route::prefix('dashboard')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/{system}', [DashboardController::class, 'system'])->name('dashboard.system');
    Route::get('/{system}/{node}', [DashboardController::class, 'node'])->name('dashboard.node');
});

// Redirect "/" to "/dashboard"
Route::get('/', function () {
    return redirect()->route('dashboard');
});

// 🪐 MARKETS STAR SYSTEM
Route::prefix('markets')->group(function () {
    // System center (the star itself — when you zoom into it)
    Route::get('/', fn() => Inertia::render('Markets', [
        'mode' => 'system',
    ]))->name('markets.system');

    // Planets (subroutes of the Markets system)
    Route::get('/overview', fn() => Inertia::render('Markets', [
        'mode' => 'overview',
    ]))->name('markets.overview');

    Route::get('/compare', fn() => Inertia::render('Markets', [
        'mode' => 'compare',
    ]))->name('markets.compare');

    Route::get('/watchlist', fn() => Inertia::render('Markets', [
        'mode' => 'watchlist',
    ]))->name('markets.watchlist');

    // Deep-level detail (specific token planet)
    Route::get('/token/{symbol}', function ($symbol) {
        return Inertia::render('Markets', [
            'mode' => 'detail',
            'symbol' => $symbol,
        ]);
    })->name('markets.token');
});


// Contracts
Route::get('/contracts', function () {
    return Inertia::render('Contracts', [
        'mode' => 'contracts',
    ]);
})->name('contracts');

// Wzkr AI
Route::get('/ai', function () {
    return Inertia::render('Ai', [
        'mode' => 'ai',
    ]);
})->name('ai');



// 🪐 OVERVIEW STAR SYSTEM
Route::prefix('overview')->group(function () {
    // Star system center — when you zoom into the Overview star
    Route::get('/', function () {
        return Inertia::render('Overview', [
            'mode' => 'system', // Default planet view
        ]);
    })->name('overview.system');

    // Planet 1 — About
    Route::get('/about', function () {
        return Inertia::render('Overview', [
            'mode' => 'about',
        ]);
    })->name('overview.about');

    // Planet 2 — Roadmap
    Route::get('/roadmap', function () {
        return Inertia::render('Overview', [
            'mode' => 'roadmap',
        ]);
    })->name('overview.roadmap');

    // Planet 3 — News
    Route::get('/news', function () {
        return Inertia::render('Overview', [
            'mode' => 'news',
        ]);
    })->name('overview.news');

    // Planet 4 — Social
    Route::get('/social', function () {
        return Inertia::render('Overview', [
            'mode' => 'social',
        ]);
    })->name('overview.social');
});





// Watchlist (dropdown stavka)
Route::get('/watchlist', function () {
    return Inertia::render('Watchlist');
})->name('watchlist');


// Wallet glavno
Route::get('/wallet', function () {
    return Inertia::render('Wallet');
})->name('wallet');

// Wallet → View
Route::get('/wallet/view', function () {
    return Inertia::render('WalletView');
})->name('wallet.view');

// Wallet → Connect
Route::get('/wallet/connect', function () {
    return Inertia::render('WalletConnect');
})->name('wallet.connect');

/* }); */

