<?php

namespace App\Observers;

use App\Models\TrustedDevice;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use App\Services\LightwebCoinService;

class UserObserver
{
    public function created(User $user): void
    {
        $this->createTrustedDevice($user, 'user_created');
    }

    protected function createTrustedDevice(User $user, string $reason): void
    {
        $ip = request()->ip();
        $userAgent = request()->userAgent();
        $deviceFingerprint = session('device_fingerprint');

        if (! $deviceFingerprint) {
            Log::warning('NO DEVICE FINGERPRINT - trusted device skipped', [
                'user_id' => $user->id,
                'reason' => $reason,
            ]);
            return;
        }

        $exists = TrustedDevice::where('user_id', $user->id)
            ->where('device_fingerprint', $deviceFingerprint)
            ->exists();

        if ($exists) {
            return;
        }

        TrustedDevice::create([
            'user_id' => $user->id,
            'device_fingerprint' => $deviceFingerprint,
            'device_name' => $this->extractDeviceName($userAgent),
            'ip' => $ip,
            'user_agent' => $userAgent,
            'last_seen_at' => Carbon::now(),
        ]);

        Log::info('TRUSTED DEVICE CREATED', [
            'user_id' => $user->id,
            'reason' => $reason,
            'ip' => $ip,
        ]);
    }

    protected function extractDeviceName(string $userAgent): string
    {
        return match (true) {
            stripos($userAgent, 'mobile') !== false => 'Mobile',
            stripos($userAgent, 'chrome') !== false => 'Chrome',
            stripos($userAgent, 'firefox') !== false => 'Firefox',
            stripos($userAgent, 'safari') !== false => 'Safari',
            stripos($userAgent, 'edge') !== false => 'Edge',
            default => 'Browser',
        };
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
