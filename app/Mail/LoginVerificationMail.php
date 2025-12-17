<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class LoginVerificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $code;

    public $deviceName;

    public $ip;

    public function __construct($code, $deviceName = null, $ip = null)
    {
        $this->code = $code;
        $this->deviceName = $deviceName;
        $this->ip = $ip;
    }

    public function build()
    {
        // local image path included as requested
        // image is in public/images/lightverse.png
        $logoUrl = asset('images/lightverse.png');

        return $this->subject('Please verify your Lightverse login')
            ->view('emails.login_verification')
            ->with([
                'code' => $this->code,
                'deviceName' => $this->deviceName,
                'ip' => $this->ip,
                'logoUrl' => $logoUrl,
            ]);
    }
}
