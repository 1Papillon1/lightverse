<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;

class VerifyEmailController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     */
    public function __invoke(EmailVerificationRequest $request): RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->intended(route('dashboard', absolute: false).'?verified=1');
        }

        // Get device fingerprint from cookie (stored by frontend when user visited any auth page)
        $deviceFingerprint = $request->cookie('device_fingerprint')
            ?? session('device_fingerprint');

        // If no fingerprint from frontend, generate one from server-side data
        if (!$deviceFingerprint) {
            $deviceFingerprint = $this->generateServerSideFingerprint($request);
            \Illuminate\Support\Facades\Log::info('GENERATED SERVER-SIDE FINGERPRINT FOR VERIFICATION', [
                'user_id' => $request->user()->id,
                'fingerprint' => $deviceFingerprint,
            ]);
        }

        if ($deviceFingerprint) {
            // Store in session so Observer can access it
            session(['device_fingerprint' => $deviceFingerprint]);

            \Illuminate\Support\Facades\Log::info('DEVICE FINGERPRINT FOUND FOR VERIFICATION', [
                'user_id' => $request->user()->id,
                'fingerprint' => $deviceFingerprint,
                'source' => $request->cookie('device_fingerprint') ? 'cookie' : 'server-generated',
            ]);
        } else {
            \Illuminate\Support\Facades\Log::warning('NO DEVICE FINGERPRINT IN COOKIE OR SESSION FOR VERIFICATION', [
                'user_id' => $request->user()->id,
                'cookies' => $request->cookies->all(),
            ]);
        }

        if ($request->user()->markEmailAsVerified()) {
            $user = $request->user();
            event(new Verified($user));

            // FIRST LOGIN COINS (correct place)
            try {
                $achievements = app(\App\Services\AchievementsService::class);
                $coins        = app(\App\Services\LightwebCoinService::class);

                if (! $achievements->has($user, 'first_login_spawn')) {
                    $coins->spawnFirstLoginDrops($user);
                    $achievements->unlock($user, 'first_login_spawn');

                    \Log::info('FIRST LOGIN COINS SPAWNED ON EMAIL VERIFICATION', [
                        'user_id' => $user->id
                    ]);
                }
            } catch (\Throwable $e) {
                \Log::error('FAILED TO SPAWN COINS ON EMAIL VERIFICATION', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        

        return redirect()->intended(route('dashboard', absolute: false).'?verified=1');
    }

    /**
     * Generate device fingerprint from server-side data
     */
    protected function generateServerSideFingerprint($request): string
    {
        $userAgent = $request->userAgent() ?? 'unknown';
        $ip = $request->ip();

        // Simple hash based on user agent + IP
        $raw = $userAgent.'||'.$ip;
        $hash = hash('sha256', $raw);

        return 'dv_server_'.substr($hash, 0, 16);
    }
}
