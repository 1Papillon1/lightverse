<!doctype html>
<html>
  <body style="font-family: Arial;background:#07021a;color:#eee;padding:20px">

    <div style="max-width:600px;margin:0 auto;background:rgba(20,10,50,.7);
      padding:24px;border-radius:12px">

      <img src="{{ $logoUrl }}" width="90" style="margin-bottom:20px">

      <h2 style="margin-top:0;color:#fff">Welcome to Lightverse!</h2>

      <p style="font-size:15px">Please confirm your email to activate your account:</p>

      <a href="{{ $verificationUrl }}"
         style="background:#8a4bff;padding:12px 20px;color:white;text-decoration:none;
                border-radius:6px;display:inline-block;">
        Verify My Account
      </a>

      <p style="margin-top:20px;color:#aaa;font-size:13px">
        This verification link expires once used.  
        If you didn’t sign up, you can safely ignore this email.
      </p>
    </div>

  </body>
</html>