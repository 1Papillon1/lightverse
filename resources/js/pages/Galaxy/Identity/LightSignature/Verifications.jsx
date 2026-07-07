// resources/js/Pages/Galaxy/Identity/LightSignature/Verifications.jsx
import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import MainLayout from '@/MainLayout';
import UniverseBackdrop from '@/components/visuals/UniverseBackdrop';

const SOCIAL_PLATFORMS = [
  {
    key:         'twitter_url',
    label:       'Twitter / X',
    icon:        '𝕏',
    placeholder: 'https://twitter.com/yourhandle',
    prefix:      'twitter.com/',
  },
  {
    key:         'reddit_url',
    label:       'Reddit',
    icon:        '◈',
    placeholder: 'https://reddit.com/u/yourhandle',
    prefix:      'reddit.com/u/',
  },
];

const Verifications = () => {
  const { auth, flash } = usePage().props;
  const user        = auth?.user ?? {};
  const cosmicColor = user.cosmic_color ?? '#ff9900';

  const [form, setForm]     = useState({
    twitter_url: user.twitter_url ?? '',
    reddit_url:  user.reddit_url  ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSave = () => {
    setSaving(true);
    router.put('/profile', form, {
      preserveScroll: true,
      onSuccess: () => { setSaving(false); },
      onError:   (e) => { setSaving(false); setErrors(e); },
    });
  };

  return (
    <>
      <Head><title>Verifications — Lightverse</title></Head>
      <UniverseBackdrop />

      <div className="identity-page">
        <div className="identity-card" style={{ '--cosmic': cosmicColor }}>

          <div className="identity-card__header">
            <div className="identity-card__title-group">
              <h2 className="identity-card__username">Verifications</h2>
              <p className="identity-card__bio">
                Connect your presence across the web.
              </p>
            </div>
          </div>

          <div className="identity-card__divider" />

          <div className="identity-card__section">
            <h3 className="identity-card__section-title">Social Links</h3>

            {SOCIAL_PLATFORMS.map(platform => (
               
              <div key={platform.key} className="identity-social-row">
                <div className="identity-social-row__icon"
                  style={{ color: cosmicColor }}>
                  {platform.icon}
                </div>
               
                <div className="identity-social-row__content">
                  <label className="identity-social-row__label">
                    {platform.label}
                  </label>
                  <input
                    className="identity-input identity-input--social"
                    type="url"
                    value={form[platform.key]}
                    onChange={e => setForm(f => ({
                      ...f,
                      [platform.key]: e.target.value
                    }))}
                    placeholder={platform.placeholder}
                    style={{ '--cosmic': cosmicColor }}
                  />
                  {errors[platform.key] && (
                    <p className="identity-error">{errors[platform.key]}</p>
                  )}
                  {form[platform.key] && (
                    <a
                      href={form[platform.key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="identity-social-row__link"
                      style={{ color: cosmicColor }}
                    >
                      ↗ Visit profile
                    </a>
                  )}
                </div>
               

               
              </div>
               
            ))}
          </div>

          {flash?.success && (
            <div className="identity-card__flash">✦ {flash.success}</div>
          )}

          <div className="identity-card__footer">
            <button
              className="identity-btn identity-btn--save"
              onClick={handleSave}
              disabled={saving}
              style={{ '--cosmic': cosmicColor }}
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

Verifications.layout = page => <MainLayout>{page}</MainLayout>;
export default Verifications;