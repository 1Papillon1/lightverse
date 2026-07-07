<?php

use App\Models\TrustedDevice;
use App\Models\User;
use Illuminate\Support\Facades\URL;

test('trusted device is created when user verifies email with fingerprint in session', function () {
    $user = User::factory()->unverified()->create();

    $deviceFingerprint = 'dv_123456789';

    // Login and store fingerprint in session
    $this->actingAs($user);
    session(['device_fingerprint' => $deviceFingerprint]);

    // Verify email
    $verificationUrl = URL::temporarySignedRoute(
        'verification.verify',
        now()->addMinutes(60),
        ['id' => $user->id, 'hash' => sha1($user->email)]
    );

    $response = $this->get($verificationUrl);

    $response->assertRedirect(route('dashboard').'?verified=1');

    // Check that user is verified
    expect($user->fresh()->hasVerifiedEmail())->toBeTrue();

    // Check that trusted device was created
    expect(TrustedDevice::where('user_id', $user->id)->count())->toBe(1);

    $device = TrustedDevice::where('user_id', $user->id)->first();
    expect($device->device_fingerprint)->toBe($deviceFingerprint);
});

test('trusted device is not created when no fingerprint in session', function () {
    $user = User::factory()->unverified()->create();

    $this->actingAs($user);
    // No fingerprint in session

    // Verify email
    $verificationUrl = URL::temporarySignedRoute(
        'verification.verify',
        now()->addMinutes(60),
        ['id' => $user->id, 'hash' => sha1($user->email)]
    );

    $response = $this->get($verificationUrl);

    $response->assertRedirect(route('dashboard').'?verified=1');

    // Check that user is verified
    expect($user->fresh()->hasVerifiedEmail())->toBeTrue();

    // Check that no trusted device was created
    expect(TrustedDevice::where('user_id', $user->id)->count())->toBe(0);
});

test('duplicate trusted device is not created if already exists', function () {
    $user = User::factory()->unverified()->create();

    $deviceFingerprint = 'dv_123456789';

    // Create existing trusted device
    TrustedDevice::create([
        'user_id' => $user->id,
        'device_fingerprint' => $deviceFingerprint,
        'device_name' => 'Chrome',
        'ip' => '127.0.0.1',
        'user_agent' => 'Mozilla/5.0',
        'last_seen_at' => now(),
    ]);

    $this->actingAs($user);
    session(['device_fingerprint' => $deviceFingerprint]);

    // Verify email
    $verificationUrl = URL::temporarySignedRoute(
        'verification.verify',
        now()->addMinutes(60),
        ['id' => $user->id, 'hash' => sha1($user->email)]
    );

    $response = $this->get($verificationUrl);

    $response->assertRedirect(route('dashboard').'?verified=1');

    // Check that still only one trusted device exists
    expect(TrustedDevice::where('user_id', $user->id)->count())->toBe(1);
});

test('device fingerprint is stored in session via frontend', function () {
    $user = User::factory()->unverified()->create();

    $this->actingAs($user);

    $fingerprint = 'dv_987654321';

    $response = $this->post(route('verification.store-fingerprint'), [
        'device_fingerprint' => $fingerprint,
    ]);

    $response->assertJson(['status' => 'ok']);

    expect(session('device_fingerprint'))->toBe($fingerprint);
});
