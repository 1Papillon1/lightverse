<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Lightverse - Login Verification</title>
    <style>
      body { font-family: Arial, Helvetica, sans-serif; color:#eae7ff; background:#07021a; }
      .card { max-width:600px; margin:20px auto; padding:24px; border-radius:12px; background:linear-gradient(180deg, rgba(20,6,50,0.8), rgba(10,3,30,0.6)); }
      .logo { width:80px; height:auto; display:block; margin-bottom:18px; }
      .code { font-size:32px; letter-spacing:6px; color:#f1e8ff; padding:12px 16px; background: rgba(255,255,255,0.03); border-radius:8px; display:inline-block; }
      .muted { color:#b9aee6; font-size:13px; }
    </style>
  </head>
  <body>
    <div class="card">
      <img class="logo" src="{{ $logoUrl }}" alt="Lightverse logo" />
      <h2 style="margin:0 0 6px 0; color:#fff">Verify your login</h2>
      <p class="muted">We detected a login from a new device/location.</p>
      <p>Enter the code below to continue:</p>
      <div class="code">{{ $code }}</div>

      <p class="muted" style="margin-top:12px">
        Device: {{ $deviceName ?? 'Unknown' }} · IP: {{ $ip ?? 'Unknown' }}<br/>
        This code expires in 10 minutes.
      </p>

      <p style="margin-top:18px; color:#cfc7ff">If this wasn't you, consider changing your password immediately.</p>
    </div>
  </body>
</html>
