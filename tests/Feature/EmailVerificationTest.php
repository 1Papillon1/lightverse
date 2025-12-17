<?php

use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;

test('registered event is dispatched on registration', function () {
    Event::fake();

    $response = $this->post('/register', [
        'username' => 'testuser',
        'email' => 'test@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    Event::assertDispatched(Registered::class);
    $response->assertRedirect(route('verification.notice'));
});

test('verification email is sent on registration', function () {
    Notification::fake();

    $response = $this->post('/register', [
        'username' => 'testuser',
        'email' => 'test@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $user = User::where('email', 'test@example.com')->first();

    Notification::assertSentTo($user, VerifyEmail::class);
});

test('user can see verification notice when not verified', function () {
    $user = User::factory()->create([
        'email_verified_at' => null,
    ]);

    $response = $this->actingAs($user)->get('/email/verify');

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page->component('Auth/VerifyEmail'));
});

test('user can resend verification email', function () {
    Notification::fake();

    $user = User::factory()->create([
        'email_verified_at' => null,
    ]);

    $response = $this->actingAs($user)
        ->post('/email/verification-notification');

    Notification::assertSentTo($user, VerifyEmail::class);
    $response->assertSessionHas('message', 'Verification link sent!');
});

test('user cannot access dashboard without verification', function () {
    $user = User::factory()->create([
        'email_verified_at' => null,
    ]);

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertRedirect('/email/verify');
});

test('verified user can access dashboard', function () {
    $user = User::factory()->create([
        'email_verified_at' => now(),
    ]);

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertSuccessful();
});

test('user can verify email with valid signed url', function () {
    $user = User::factory()->create([
        'email_verified_at' => null,
    ]);

    $verificationUrl = URL::temporarySignedRoute(
        'verification.verify',
        now()->addMinutes(60),
        ['id' => $user->id, 'hash' => sha1($user->email)]
    );

    $response = $this->actingAs($user)->get($verificationUrl);

    expect($user->fresh()->email_verified_at)->not->toBeNull();
    $response->assertRedirect(route('dashboard').'?verified=1');
});

test('user cannot verify email with invalid hash', function () {
    $user = User::factory()->create([
        'email_verified_at' => null,
    ]);

    $verificationUrl = URL::temporarySignedRoute(
        'verification.verify',
        now()->addMinutes(60),
        ['id' => $user->id, 'hash' => 'invalid-hash']
    );

    $response = $this->actingAs($user)->get($verificationUrl);

    expect($user->fresh()->email_verified_at)->toBeNull();
    $response->assertForbidden();
});

test('verification email resend is rate limited', function () {
    $user = User::factory()->create([
        'email_verified_at' => null,
    ]);

    // Make 6 requests (the throttle limit)
    for ($i = 0; $i < 6; $i++) {
        $this->actingAs($user)->post('/email/verification-notification');
    }

    // 7th request should be throttled
    $response = $this->actingAs($user)->post('/email/verification-notification');

    $response->assertStatus(429); // Too Many Requests
});
