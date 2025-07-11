<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Http;


// Glavna stranica (About.jsx)
Route::get('/', function () {
    return Inertia::render('Overview');
})->name('overview');

Route::get('/test-api', function () {
    $response = Http::get('https://api.coinpaprika.com/v1/tickers?quotes=USD');

    return $response->body(); // Ili ->json() da vidiš JSON odmah
});

// Sitemap ruta
Route::get('/sitemap.xml', function () {
    $urls = [
        URL::to('/'),
        URL::to('/login'),
        URL::to('/signup'),
        URL::to('/dashboard'),
        URL::to('/settings'),
        URL::to('/wallet'),
    ];

    $xmlContent = view('sitemap', compact('urls'));

    return Response::make($xmlContent, 200)
        ->header('Content-Type', 'application/xml');
});


Route::get('/login', function () {
    return Inertia::render('Authorization', [
        'mode' => 'login',
    ]);
})->name('login');

Route::post('/login', [AuthController::class, 'login'])->name('login.submit');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
Route::post('/logout',   [AuthController::class, 'logout'])->name('logout');

// Signup ruta
Route::get('/signup', function () {
    return Inertia::render('Authorization', [
        'mode' => 'signup',
    ]);
})->name('signup');




Route::post('/register', [AuthController::class, 'register']);



// Grupa ruta koje zahtjevaju autentifikaciju  
/* Route::group(function () { */

// Dashboard (kao /dashboard)
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->name('dashboard');

// Markets lista (dropdown stavka) — ali renderira isti Dashboard
Route::get('/markets', function () {
    return Inertia::render('Dashboard');
})->name('markets');

Route::get('/markets/{symbol}', function ($symbol) {
    return Inertia::render('Dashboard', [
        'symbol' => $symbol,
    ]);
})->name('markets.symbol');





// Roadmap (dropdown stavka) / Overview
    Route::get('/about', function () {
        return Inertia::render('Overview', [
            'mode' => 'about',
        ]);
    })->name('about');

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

// Settings
Route::get('/settings', function () {
    return Inertia::render('Settings');
})->name('settings');

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

