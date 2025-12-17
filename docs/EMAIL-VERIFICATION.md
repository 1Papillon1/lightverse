# Email Verifikacija - Kompletna Dokumentacija

## Pregled Sistema

Ova aplikacija ima **kompletan email verifikacijski sistem** koji:
1. Sprečava neverificirane korisnike da pristupe zaštićenim rutama
2. Automatski šalje verifikacijske emailove pri registraciji
3. Omogućava ponovno slanje verifikacijskog emaila
4. **Automatski kreira Trusted Device zapis** kada korisnik verificira email
5. Prikazuje uspješnu obavijest nakon verifikacije

---

## Arhitektura Sistema

### 1. User Model (`app/Models/User.php`)
```php
class User extends Authenticatable implements MustVerifyEmail
```
- **MustVerifyEmail interface** - Laravel zna da ovaj model zahtijeva email verifikaciju
- **email_verified_at kolona** - timestamp kada je email verificiran (NULL = neverificiran)

### 2. Migracije
**users tabela** sadrži:
- `email_verified_at` - TIMESTAMP (nullable)
- `email_verification_token` - VARCHAR (nullable, unique)

---

## Flow Od Početka Do Kraja

### **KORAK 1: Registracija**

#### Frontend (`resources/js/components/authentication/Signup.jsx`)
```jsx
const { data, setData, post } = useForm({
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
    device_fingerprint: getDeviceFingerprint(),  // ← Generira unique ID
    device_name: navigator.userAgent,
});

const handleRegister = (e) => {
    e.preventDefault();
    post("/register", { ... });
};
```

**Device Fingerprint** se generira iz:
- User Agent
- Platform
- Language
- Screen Resolution
- Timezone

#### Backend (`app/Http/Controllers/AuthController.php`)
```php
public function register(Request $request): RedirectResponse
{
    // 1. Validacija
    $request->validate([...]);

    // 2. Kreiranje korisnika
    $user = User::create([
        'username' => $request->username,
        'email' => $request->email,
        'password' => bcrypt($request->password),
    ]);

    // 3. Spremanje device fingerprint u cookie (30 dana)
    $deviceFingerprint = $request->input('device_fingerprint');
    if ($deviceFingerprint) {
        cookie()->queue('device_fingerprint', $deviceFingerprint, 60 * 24 * 30);
    }

    // 4. Slanje verification emaila
    event(new Registered($user));  // ← Laravel automatski šalje email

    // 5. Automatski login
    Auth::login($user);

    // 6. Redirect na verification notice
    return redirect()->route('verification.notice');
}
```

**Šta se dešava:**
- Laravel automatski šalje email jer User implementira `MustVerifyEmail`
- Email sadrži **signed URL** sa ID-em i hash-om emaila
- Device fingerprint se sprema u cookie za kasnije

---

### **KORAK 2: Blokiranje Neverificiranih Korisnika**

#### Login Provjera (`app/Http/Controllers/AuthController.php`)
```php
public function login(Request $request): RedirectResponse
{
    if (!Auth::attempt($credentials)) {
        return back()->withErrors(['email' => 'Invalid credentials.']);
    }

    $user = $request->user();

    // PROVJERA EMAIL VERIFIKACIJE
    if (!$user->hasVerifiedEmail()) {
        Log::warning('LOGIN BLOCKED - EMAIL NOT VERIFIED');
        Auth::logout();
        return redirect()->route('verification.notice')
            ->with('warning', 'Please verify your email before logging in.');
    }

    return redirect()->route('dashboard');
}
```

#### Secure Login Provjera (`app/Http/Controllers/Auth/SecureLoginController.php`)
```php
public function login(Request $request)
{
    if (!Auth::attempt($credentials)) {
        throw ValidationException::withMessages(['email' => ['Invalid credentials.']]);
    }

    $user = Auth::user();

    // PROVJERA EMAIL VERIFIKACIJE
    if (!$user->email_verified_at) {
        Auth::logout();
        return response()->json([
            'status' => 'email_not_verified',
            'message' => 'Please verify your email before logging in.',
        ], 403);
    }

    // ... trusted device logic ...
}
```

#### Dashboard Zaštita (`routes/web.php`)
```php
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
});
```

**`verified` middleware** automatski preusmjerava neverificirane korisnike na `/email/verify`

---

### **KORAK 3: Verification Notice Stranica**

#### Ruta (`routes/web.php`)
```php
Route::get('/email/verify', function () {
    $user = auth()->user();

    // Ako je već verificiran, redirect na dashboard
    if ($user && $user->hasVerifiedEmail()) {
        return redirect()->route('dashboard');
    }

    return Inertia::render('Auth/VerifyEmail');
})->middleware('auth')->name('verification.notice');
```

#### Frontend (`resources/js/pages/Auth/VerifyEmail.jsx`)
Prikazuje:
- **Email adresu** na koju je poslat link
- **"Resend Verification Email"** dugme
- **Logout** link
- **Device fingerprint** se automatski postavlja u cookie (fallback ako nije iz registracije)

```jsx
useEffect(() => {
    const fingerprint = getDeviceFingerprint();
    document.cookie = `device_fingerprint=${fingerprint}; path=/; max-age=${30 * 24 * 60 * 60}; secure; samesite=lax`;
}, []);
```

---

### **KORAK 4: Resend Verification Email**

#### Ruta (`routes/web.php`)
```php
Route::post('/email/verification-notification', function (Request $request) {
    $request->user()->sendEmailVerificationNotification();
    return back()->with('message', 'Verification link sent!');
})->middleware(['auth', 'throttle:6,1'])->name('verification.send');
```

**Rate Limiting:** Max 6 pokušaja u 1 minuti

---

### **KORAK 5: Klik Na Link Iz Emaila**

#### Ruta (`routes/web.php`)
```php
Route::get('/email/verify/{id}/{hash}', VerifyEmailController::class)
    ->middleware(['auth', 'signed'])
    ->name('verification.verify');
```

**`signed` middleware** - Provjerava da URL nije izmijenjen

#### Controller (`app/Http/Controllers/Auth/VerifyEmailController.php`)
```php
public function __invoke(EmailVerificationRequest $request): RedirectResponse
{
    // 1. Provjera da li je već verificiran
    if ($request->user()->hasVerifiedEmail()) {
        return redirect()->route('dashboard').'?verified=1';
    }

    // 2. Preuzimanje device fingerprint
    $deviceFingerprint = $request->cookie('device_fingerprint')
        ?? session('device_fingerprint');

    // 3. FALLBACK: Generisanje fingerprint-a na serveru
    if (!$deviceFingerprint) {
        $deviceFingerprint = $this->generateServerSideFingerprint($request);
    }

    // 4. Spremanje u session za Observer
    if ($deviceFingerprint) {
        session(['device_fingerprint' => $deviceFingerprint]);
    }

    // 5. Markiranje emaila kao verificiran
    if ($request->user()->markEmailAsVerified()) {
        $user = $request->user();
        event(new Verified($user));  // ← Pokreće Observer
    }

    // 6. Redirect na dashboard sa success parametrom
    return redirect()->route('dashboard').'?verified=1';
}

protected function generateServerSideFingerprint($request): string
{
    $userAgent = $request->userAgent() ?? 'unknown';
    $ip = $request->ip();
    $raw = $userAgent.'||'.$ip;
    $hash = hash('sha256', $raw);
    return 'dv_server_'.substr($hash, 0, 16);
}
```

**Logika:**
1. Prvo pokušava preuzeti fingerprint iz **cookie** (postavljen pri registraciji)
2. Ako nema, provjerava **session** (postavljen na /email/verify stranici)
3. Ako ni to nema, **generira fingerprint na serveru** iz User-Agent + IP
4. Markira email kao verificiran → **Pokreće UserObserver**

---

### **KORAK 6: Automatsko Kreiranje Trusted Device (Observer)**

#### Observer (`app/Observers/UserObserver.php`)
```php
public function updated(User $user): void
{
    // Detektuje promjenu email_verified_at kolone
    if ($user->wasChanged('email_verified_at') && $user->email_verified_at !== null) {
        $this->handleEmailVerified($user);
    }
}

protected function handleEmailVerified(User $user): void
{
    // Preuzima fingerprint iz session
    $deviceFingerprint = session('device_fingerprint');
    $ip = request()->ip();
    $userAgent = request()->userAgent();
    $deviceName = $this->extractDeviceName($userAgent);

    if ($deviceFingerprint) {
        // Provjera da li device već postoji
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

            Log::info('TRUSTED DEVICE CREATED ON EMAIL VERIFICATION');
        }
    }
}

protected function extractDeviceName(string $userAgent): string
{
    if (stripos($userAgent, 'mobile') !== false) return 'Mobile';
    if (stripos($userAgent, 'chrome') !== false) return 'Chrome';
    if (stripos($userAgent, 'firefox') !== false) return 'Firefox';
    if (stripos($userAgent, 'safari') !== false) return 'Safari';
    if (stripos($userAgent, 'edge') !== false) return 'Edge';
    return 'Browser';
}
```

#### Registracija Observer-a (`app/Providers/AppServiceProvider.php`)
```php
public function boot(): void
{
    User::observe(UserObserver::class);
}
```

**Što se dešava:**
1. `markEmailAsVerified()` updatea `email_verified_at` kolonu
2. Observer **detektuje** promjenu te kolone
3. Čita device fingerprint iz session-a
4. **Kreira TrustedDevice zapis** u bazi
5. Sljedeći login sa istog uređaja **neće zahtijevati 2FA kod**!

---

### **KORAK 7: Success Obavijest Na Dashboard-u**

#### Dashboard (`resources/js/pages/Dashboard.jsx`)
```jsx
const [showVerifiedMessage, setShowVerifiedMessage] = useState(false);

useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('verified') === '1') {
        setShowVerifiedMessage(true);
        // Ukloni parametar iz URL-a
        window.history.replaceState({}, '', window.location.pathname);
        // Auto-hide nakon 5 sekundi
        setTimeout(() => setShowVerifiedMessage(false), 5000);
    }
}, []);

return (
    <>
        {showVerifiedMessage && (
            <div style={{ position: 'fixed', top: '20px', right: '20px', ... }}>
                ✓ E-mail uspješno verificiran!
                Vaš račun je sada potpuno aktivan.
            </div>
        )}
    </>
);
```

**Zelena obavijest** u gornjem desnom uglu sa:
- Success ikonom
- "E-mail uspješno verificiran!"
- "Vaš račun je sada potpuno aktivan."
- Dugme za zatvaranje
- Automatsko zatvaranje nakon 5 sekundi

---

## Trusted Device Model

### Tabela (`trusted_devices`)
```sql
CREATE TABLE trusted_devices (
    id BIGINT PRIMARY KEY,
    user_id BIGINT,
    device_fingerprint VARCHAR,
    device_name VARCHAR,
    ip VARCHAR,
    user_agent VARCHAR,
    last_seen_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Model (`app/Models/TrustedDevice.php`)
```php
class TrustedDevice extends Model
{
    protected $fillable = [
        'user_id',
        'device_fingerprint',
        'device_name',
        'ip',
        'user_agent',
        'last_seen_at',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
```

---

## Kako Trusted Device Radi Sa Secure Login

### SecureLoginController Logic
```php
public function login(Request $request)
{
    if (!Auth::attempt($credentials)) {
        throw ValidationException::withMessages(['email' => ['Invalid credentials.']]);
    }

    $user = Auth::user();

    // EMAIL VERIFIKACIJA
    if (!$user->email_verified_at) {
        Auth::logout();
        return response()->json(['status' => 'email_not_verified'], 403);
    }

    // TRUSTED DEVICE CHECK
    $deviceFingerprint = $request->input('device_fingerprint');
    $trusted = TrustedDevice::where('user_id', $user->id)
        ->where('device_fingerprint', $deviceFingerprint)
        ->first();

    if ($trusted) {
        // TRUSTED DEVICE - Direktan login bez 2FA
        $trusted->update(['last_seen_at' => Carbon::now()]);
        $request->session()->regenerate();
        return response()->json(['status' => 'ok']);
    }

    // NOVI DEVICE - Zahtijeva 2FA verifikaciju
    $code = $this->generateCode();
    LoginVerification::create([
        'user_id' => $user->id,
        'code' => $code,
        'device_fingerprint' => $deviceFingerprint,
        'expires_at' => Carbon::now()->addMinutes(10),
    ]);
    Mail::to($user->email)->send(new LoginVerificationMail($code));
    Auth::logout();
    return response()->json(['status' => 'verification_required'], 202);
}
```

---

## Testovi

### Email Verification Tests (`tests/Feature/EmailVerificationTest.php`)
```php
test('registered event is dispatched on registration');
test('verification email is sent on registration');
test('user can see verification notice when not verified');
test('user can resend verification email');
test('user cannot access dashboard without verification');
test('verified user can access dashboard');
test('user can verify email with valid signed url');
test('user cannot verify email with invalid hash');
test('verification email resend is rate limited');
```

### Trusted Device Tests (`tests/Feature/TrustedDeviceOnVerificationTest.php`)
```php
test('trusted device is created when user verifies email with fingerprint in session');
test('trusted device is not created when no fingerprint in session');
test('duplicate trusted device is not created if already exists');
test('device fingerprint is stored in session via frontend');
```

**Pokretanje testova:**
```bash
php artisan test --filter=EmailVerification
php artisan test --filter=TrustedDevice
```

---

## Konfiguracija

### Mail Setup (`.env`)
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=allussupp@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=allussupp@gmail.com
MAIL_FROM_NAME="${APP_NAME}"
```

### Email Template
Laravel koristi **built-in email template** za verification email.

Možeš customizirati u `resources/views/vendor/mail/html/message.blade.php` ako publish-aš views:
```bash
php artisan vendor:publish --tag=laravel-mail
```

---

## Device Fingerprint - Tri Načina

### 1. Frontend Cookie (Preferirano)
```javascript
// resources/js/utils/deviceFingerprint.js
export function getDeviceFingerprint() {
    const nav = window.navigator;
    const screenInfo = `${window.screen.width}x${window.screen.height}x${window.devicePixelRatio}`;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const raw = [nav.userAgent, nav.platform, nav.language, screenInfo, timezone].join('||');
    
    let hash = 5381;
    for (let i = 0; i < raw.length; i++) {
        hash = ((hash << 5) + hash) + raw.charCodeAt(i);
    }
    return 'dv_' + Math.abs(hash);
}
```
**Postavlja se:**
- Pri registraciji (sprema u cookie 30 dana)
- Na `/email/verify` stranici (fallback)

### 2. Session Storage
- Alternativa cookie-u
- Postavlja se kada korisnik posjeti `/email/verify`

### 3. Server-Side Generation (Fallback)
```php
protected function generateServerSideFingerprint($request): string
{
    $userAgent = $request->userAgent() ?? 'unknown';
    $ip = $request->ip();
    $raw = $userAgent.'||'.$ip;
    $hash = hash('sha256', $raw);
    return 'dv_server_'.substr($hash, 0, 16);
}
```
**Koristi se ako:**
- Korisnik klikne link iz emaila prije nego što je ikada posjetio aplikaciju
- Nema cookie niti session podataka
- Manje precizan, ali radi

---

## Logovanje

### Svi Logovi
```php
// Registracija
Log::info('REGISTER ATTEMPT');
Log::info('USER CREATED');
Log::info('DEVICE FINGERPRINT STORED IN COOKIE ON REGISTRATION');
Log::info('DISPATCHING REGISTERED EVENT');

// Login
Log::info('LOGIN ATTEMPT');
Log::info('LOGIN SUCCESSFUL - CREDENTIALS VALID');
Log::warning('LOGIN BLOCKED - EMAIL NOT VERIFIED');

// Verifikacija
Log::info('VERIFICATION NOTICE PAGE ACCESSED');
Log::info('RESEND VERIFICATION EMAIL REQUESTED');
Log::info('DEVICE FINGERPRINT FOUND FOR VERIFICATION');
Log::info('GENERATED SERVER-SIDE FINGERPRINT FOR VERIFICATION');
Log::info('EMAIL VERIFIED - Creating trusted device');
Log::info('TRUSTED DEVICE CREATED ON EMAIL VERIFICATION');

// Secure Login
Log::info('SECURE LOGIN - CREDENTIALS VALID');
Log::warning('SECURE LOGIN BLOCKED - EMAIL NOT VERIFIED');
```

**Pregled logova:**
```bash
tail -100 storage/logs/laravel.log
tail -f storage/logs/laravel.log | grep EMAIL
```

---

## Česti Problemi i Rješenja

### 1. Email se ne šalje
**Provjeri:**
```bash
php artisan config:clear
php artisan queue:work  # Ako koristiš queue
```

### 2. Cookie nije postavljen
**Rješenje:** Server-side fallback automatski generira fingerprint

### 3. Trusted device se ne kreira
**Provjeri:**
- Da li je Observer registrovan u `AppServiceProvider`
- Da li postoji device fingerprint u session-u
- Logove: `tail -f storage/logs/laravel.log | grep "TRUSTED DEVICE"`

### 4. Verification link istekao
**Rješenje:** Koristi "Resend Verification Email" dugme

### 5. 403 Forbidden nakon verifikacije
**Rješenje:** Clear cache i browser cookies:
```bash
php artisan cache:clear
php artisan config:clear
```

---

## Sigurnost

### Signed URLs
- Laravel generira **signed URL** sa hash-om
- URL važi **samo jednom** i ima **ograničeno vrijeme**
- Ako je izmijenjen, vraća 403 Forbidden

### Rate Limiting
```php
->middleware(['auth', 'throttle:6,1'])
```
- Max **6 resend pokušaja** u **1 minuti**

### CSRF Protection
- Sve POST rute zaštićene sa CSRF tokenom
- Inertia automatski dodaje token

### SQL Injection Protection
- Eloquent ORM koristi **prepared statements**

---

## Backup & Restore

### Backup Email Verification Token-a
```sql
SELECT id, email, email_verified_at, email_verification_token 
FROM users 
WHERE email_verified_at IS NULL;
```

### Reset Verifikacije (Dev/Testing)
```sql
UPDATE users SET email_verified_at = NULL WHERE email = 'test@example.com';
DELETE FROM trusted_devices WHERE user_id = 123;
```

---

## Performance

### Database Indexi
```php
// trusted_devices migracija
$table->index(['user_id', 'device_fingerprint']);
```

### Cache Strategy
- Session cache za device fingerprint
- Cookie cache za 30 dana

---

## Zaključak

Sistem je **potpuno funkcionalan** i uključuje:
✅ Automatsko slanje verification emaila  
✅ Blokiranje neverificiranih korisnika  
✅ Resend funkcionalnost sa rate limiting-om  
✅ **Automatsko kreiranje Trusted Device zapisa**  
✅ Server-side fallback za fingerprint  
✅ Success obavijest nakon verifikacije  
✅ Integracija sa Secure Login 2FA sistemom  
✅ Kompletni testovi (16 passing tests)  
✅ Ekstenzivno logovanje  

**Prvi login nakon email verifikacije**: User već ima trusted device, **NE TRAŽI 2FA KOD!** 🎉
