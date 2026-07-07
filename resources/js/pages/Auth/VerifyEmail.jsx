import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import MainLayout from '@/MainLayout';
import { getDeviceFingerprint } from '@/utils/deviceFingerprint';
import AuthLayout from '@/components/layout/AuthLayout';


export default function VerifyEmail() {
    const { auth, message } = usePage().props;
    const [sending, setSending] = useState(false);
    const [serverMessage, setServerMessage] = useState(message || null);

    // Store device fingerprint in cookie on mount
    useEffect(() => {
        const fingerprint = getDeviceFingerprint();

        // Store in cookie for 30 days
        document.cookie = `device_fingerprint=${fingerprint}; path=/; max-age=${30 * 24 * 60 * 60}; secure; samesite=lax`;

        console.log('Device fingerprint stored in cookie:', fingerprint);
    }, []);

    const handleResendVerification = () => {
        setSending(true);

        router.post(route('verification.send'), {}, {
            preserveScroll: true,
            onSuccess: (page) => {
                setSending(false);
                setServerMessage(page.props.flash?.message || 'Verification link sent! Check your email.');
            },
            onError: (errors) => {
                setSending(false);
                setServerMessage('Failed to send verification email. Please try again.');
            },
        });
    };

    return (
        <>
            <Head title="Verify Email" />

            <div className="overlay overlay--auth">
                <div className="overlay__content">
                    <h1 className="overlay__title">Verify Your Email Address</h1>

                    <p className="overlay__text">
                        Before proceeding, please check your email for a verification link.
                        {auth?.user?.email && (
                            <span style={{ display: 'block', marginTop: '0.5rem', color: '#fff' }}>
                                We sent it to: <strong>{auth.user.email}</strong>
                            </span>
                        )}
                    </p>

                    {/* SERVER MESSAGE */}
                    {serverMessage && (
                        <div className="auth-message auth-message--success" style={{ marginBottom: '1.5rem' }}>
                            {serverMessage}
                        </div>
                    )}

                    <div className="form__group">
                        <button
                            onClick={handleResendVerification}
                            disabled={sending}
                            className="button"
                            type="button"
                        >
                            {sending ? 'Sending...' : 'Resend Verification Email'}
                        </button>
                    </div>

                    <div className="overlay__footer">
                        <div className="auth__switch">
                            <a href="#" onClick={(e) => { e.preventDefault(); router.post(route('logout')); }}>
                                Logout
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

VerifyEmail.layout = (page) => <AuthLayout>{page}</AuthLayout>;
