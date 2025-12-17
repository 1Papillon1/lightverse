<?php

use App\Http\Controllers\Auth\SecureLoginController;
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Http\Controllers\LightwebCoinController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use App\Models\LightwebCoinDrop;

use Inertia\Inertia;

Route::get('/test-api', function () {
    $response = Http::get('https://api.coinpaprika.com/v1/tickers?quotes=USD');

    return $response->body(); // Ili ->json() da vidiš JSON odmah
});

Route::middleware('auth')->get('/logs', function () {
    return redirect()->route('log-viewer.index');
})->name('logs.index');

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
Route::get('/login', fn () => Inertia::render('Authorization', ['mode' => 'login']))->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.submit');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

Route::get('/register', fn () => Inertia::render('Authorization', ['mode' => 'signup']))->name('register');
Route::post('/register', [AuthController::class, 'register'])->name('register.submit');

Route::get('/email/verify', function () {
    $user = auth()->user();

    \Illuminate\Support\Facades\Log::info('VERIFICATION NOTICE PAGE ACCESSED', [
        'user_id' => $user?->id,
        'email' => $user?->email,
        'is_verified' => $user?->hasVerifiedEmail(),
        'ip' => request()->ip(),
    ]);

    // Ako je već verificiran, redirect na dashboard
    if ($user && $user->hasVerifiedEmail()) {
        \Illuminate\Support\Facades\Log::info('ALREADY VERIFIED - REDIRECTING TO DASHBOARD', ['user_id' => $user->id]);
        return redirect()->route('dashboard');
    }

    return Inertia::render('Auth/VerifyEmail');
})->middleware('auth')->name('verification.notice');

Route::get('/email/verify/{id}/{hash}', VerifyEmailController::class)
    ->middleware(['auth', 'signed'])
    ->name('verification.verify');


Route::middleware(['auth'])->prefix('lightcoins')->group(function () {
    Route::get('/drops', [LightwebCoinController::class, 'index']);
    Route::post('/claim/{drop}', [LightwebCoinController::class, 'claim']);
    Route::get('/balance', [LightwebCoinController::class, 'balance']);


});


Route::post('/email/verification-store-fingerprint', function (\Illuminate\Http\Request $request) {
    $fingerprint = $request->input('device_fingerprint');
    if ($fingerprint) {
        session(['device_fingerprint' => $fingerprint]);
        \Illuminate\Support\Facades\Log::info('DEVICE FINGERPRINT STORED IN SESSION', [
            'user_id' => $request->user()->id,
            'fingerprint' => $fingerprint,
        ]);
    }
    return response()->json(['status' => 'ok']);
})->middleware('auth')->name('verification.store-fingerprint');

Route::post('/email/verification-notification', function (\Illuminate\Http\Request $request) {
    \Illuminate\Support\Facades\Log::info('RESEND VERIFICATION EMAIL REQUESTED', [
        'user_id' => $request->user()->id,
        'email' => $request->user()->email,
        'ip' => $request->ip(),
    ]);

    try {
        $request->user()->sendEmailVerificationNotification();
        \Illuminate\Support\Facades\Log::info('VERIFICATION EMAIL SENT SUCCESSFULLY', [
            'user_id' => $request->user()->id,
            'email' => $request->user()->email,
        ]);
        return back()->with('message', 'Verification link sent!');
    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error('FAILED TO SEND VERIFICATION EMAIL', [
            'user_id' => $request->user()->id,
            'email' => $request->user()->email,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);
        return back()->with('error', 'Failed to send email. Please try again.');
    }
})->middleware(['auth', 'throttle:6,1'])
    ->name('verification.send');// Security Login
Route::post('/secure-login', [SecureLoginController::class, 'login'])->name('secure.login')->middleware('throttle:10,1');
Route::post('/secure-verify', [SecureLoginController::class, 'verifyCode'])->middleware('throttle:20,1');

// Dashboard (kao /dashboard)
// Only one dashboard route
Route::middleware(['auth', 'verified'])->prefix('dashboard')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/{system}', [DashboardController::class, 'system'])->name('dashboard.system');
    Route::get('/{system}/{node}', [DashboardController::class, 'node'])->name('dashboard.node');
});

// Redirect "/" to "/dashboard"
Route::get('/', function () {
    return auth()->check()
        ? redirect()->route('dashboard')
        : redirect()->route('login');
});

// 🪐 MARKETS STAR SYSTEM
Route::prefix('markets')->group(function () {
    // System center (the star itself — when you zoom into it)
    Route::get('/', fn () => Inertia::render('Markets', [
        'mode' => 'system',
    ]))->name('markets.system');

    // Planets (subroutes of the Markets system)
    Route::get('/overview', fn () => Inertia::render('Markets', [
        'mode' => 'overview',
    ]))->name('markets.overview');

    Route::get('/compare', fn () => Inertia::render('Markets', [
        'mode' => 'compare',
    ]))->name('markets.compare');

    Route::get('/watchlist', fn () => Inertia::render('Markets', [
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
