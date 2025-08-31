<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Http;




Route::get('/test-api', function () {
    $response = Http::get('https://api.coinpaprika.com/v1/tickers?quotes=USD');

    return $response->body(); // Ili ->json() da vidiš JSON odmah
});

// Sitemap ruta
Route::get('/sitemap.xml', function () {
    $urls = [
        URL::to('/'),
        URL::to('/dashboard'),
        URL::to('/wallet'),
        URL::to('/ai'),
        URL::to('/markets'),
        URL::to('/roadmap'),
        URL::to('/contracts'),
    ];

    $xmlContent = view('sitemap', compact('urls'));

    return Response::make($xmlContent, 200)
        ->header('Content-Type', 'application/xml');
});


// Authentication routes
Route::post('/login', [AuthController::class, 'login'])->name('login.submit');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
Route::post('/logout',   [AuthController::class, 'logout'])->name('logout');

Route::post('/register', [AuthController::class, 'register']);


 


// Dashboard (kao /dashboard)
// Only one dashboard route
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->name('dashboard');

// Redirect "/" to "/dashboard"
Route::get('/', function () {
    return redirect()->route('dashboard');
});

// Markets lista (dropdown stavka) — ali renderira isti Dashboard
Route::get('/markets', function () {
    return Inertia::render('Markets', [
        'mode' => 'markets',
    ]);
})->name('markets');

Route::get('/markets/{symbol}', function ($symbol) {
    return Inertia::render('Markets', [
        'mode' => 'markets',
    ], [
        'symbol' => $symbol,
    ]);
})->name('markets.symbol');



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



// Roadmap (dropdown stavka) / Overview
    /* Route::get('/about', function () {
        return Inertia::render('Overview', [
            'mode' => 'about',
        ]);
    })->name('about'); */

    // roadmap opens about
    Route::get('/roadmap', function () {
        return Inertia::render('Overview', [
            'mode' => 'about',
        ]);
    })->name('about');
// Roadmap (dropdown stavka) / Overview




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

