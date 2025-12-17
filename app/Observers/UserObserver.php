<?php

namespace App\Observers;

use App\Models\TrustedDevice;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use App\Services\LightwebCoinService;

class UserObserver
{
    /**
     * Handle the User "created" event.
     */
    public function created(User $user): void
    {
         
    }

    /**
     * Handle the User "updated" event.
     */
    public function updated(User $user): void
    {
        // Detect if email was just verified
        if ($user->wasChanged('email_verified_at') && $user->email_verified_at !== null) {
            $this->handleEmailVerified($user);
        }
    }

    /**
     * Handle when user verifies their email
     */
    protected function handleEmailVerified(User $user): void
    {
        Log::info('EMAIL VERIFIED - Creating trusted device', [
            'user_id' => $user->id,
            'email' => $user->email,
        ]);

        // Get device info from session (stored when user visited verification page)
        $deviceFingerprint = session('device_fingerprint');
        $ip = request()->ip();
        $userAgent = request()->userAgent();

        // Extract device name from user agent
        $deviceName = $this->extractDeviceName($userAgent);

        // Only create trusted device if we have fingerprint
        if ($deviceFingerprint) {
            // Check if device already exists
            $existingDevice = TrustedDevice::where('user_id', $user->id)
                ->where('device_fingerprint', $deviceFingerprint)
                ->first();

            if (!$existingDevice) {
                TrustedDevice::create([
                    'user_id' => $user->id,
                    'device_fingerprint' => $deviceFingerprint,
                    'device_name' => $deviceName,
                    'ip' => $ip,
                    'user_agent' => $userAgent,
                    'last_seen_at' => Carbon::now(),
                ]);

                Log::info('TRUSTED DEVICE CREATED ON EMAIL VERIFICATION', [
                    'user_id' => $user->id,
                    'device_name' => $deviceName,
                    'ip' => $ip,
                    'fingerprint' => $deviceFingerprint,
                ]);
            } else {
                Log::info('TRUSTED DEVICE ALREADY EXISTS', [
                    'user_id' => $user->id,
                    'device_fingerprint' => $deviceFingerprint,
                ]);
            }
        } else {
            Log::warning('NO DEVICE FINGERPRINT - Cannot create trusted device', [
                'user_id' => $user->id,
            ]);
        }
    }

    /**
     * Extract device name from user agent
     */
    protected function extractDeviceName(string $userAgent): string
    {
        if (stripos($userAgent, 'mobile') !== false) {
            return 'Mobile';
        }
        if (stripos($userAgent, 'chrome') !== false) {
            return 'Chrome';
        }
        if (stripos($userAgent, 'firefox') !== false) {
            return 'Firefox';
        }
        if (stripos($userAgent, 'safari') !== false) {
            return 'Safari';
        }
        if (stripos($userAgent, 'edge') !== false) {
            return 'Edge';
        }

        return 'Browser';
    }

    /**
     * Handle the User "deleted" event.
     */
    public function deleted(User $user): void
    {
        //
    }

    /**
     * Handle the User "restored" event.
     */
    public function restored(User $user): void
    {
        //
    }

    /**
     * Handle the User "force deleted" event.
     */
    public function forceDeleted(User $user): void
    {
        //
    }
}
