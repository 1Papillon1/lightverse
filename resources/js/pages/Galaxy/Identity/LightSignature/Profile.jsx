// resources/js/Pages/Galaxy/Identity/LightSignature/Profile.jsx
import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import MainLayout from '@/MainLayout';
import UniverseBackdrop from '@/components/visuals/UniverseBackdrop';

// ─── Cosmic color presets ─────────────────────────────────────────────────────
const COSMIC_COLORS = [
  { value: '#ff9900', label: 'Solar'    },
  { value: '#9966ff', label: 'Lumina'   },
  { value: '#00ffcc', label: 'Signal'   },
  { value: '#ff3366', label: 'Nova'     },
  { value: '#00aaff', label: 'Glacial'  },
  { value: '#ffcc00', label: 'Stellar'  },
  { value: '#ff6600', label: 'Forge'    },
  { value: '#cc44ff', label: 'Nebula'   },
];

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = ({ username, color, size = 80 }) => {
  const initial = (username?.[0] ?? '?').toUpperCase();
  return (
    <div
      className="identity-avatar"
      style={{
        '--avatar-color': color,
        width: size,
        height: size,
        fontSize: size * 0.38,
      }}
    >
      <div className="identity-avatar__ring" />
      <div className="identity-avatar__inner">{initial}</div>
    </div>
  );
};

// ─── Light bar ────────────────────────────────────────────────────────────────
const LightBar = ({ label, value, total, color }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="identity-light-bar">
      <div className="identity-light-bar__header">
        <span className="identity-light-bar__label">{label}</span>
        <span className="identity-light-bar__value">{value}</span>
      </div>
      <div className="identity-light-bar__track">
        <div
          className="identity-light-bar__fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const Profile = () => {
  const { auth, light, flash } = usePage().props;

  const user         = auth?.user ?? {};
  const username     = user.username     ?? 'Unknown';
  const bio          = user.bio          ?? '';
  const cosmicColor  = user.cosmic_color ?? '#ff9900';
  const memberSince  = user.member_since ?? '';
  const twitterUrl   = user.twitter_url  ?? null;
  const redditUrl    = user.reddit_url   ?? null;

  const userLight = {
    total:  light?.user?.total  ?? 0,
    core:   light?.user?.core   ?? 0,
    stable: light?.user?.stable ?? 0,
    active: light?.user?.active ?? 0,
  };

  // ─── Edit state ─────────────────────────────────────────────────────────────
  const [editing, setEditing]         = useState(false);
  const [saving,  setSaving]          = useState(false);
  const [form,    setForm]            = useState({
    username:     username,
    bio:          bio,
    cosmic_color: cosmicColor,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: null }));
  };

  const handleSave = () => {
    setSaving(true);
    router.put('/profile', form, {
      preserveScroll: true,
      onSuccess: () => {
        setSaving(false);
        setEditing(false);
      },
      onError: (errs) => {
        setSaving(false);
        setErrors(errs ?? {});
      },
    });
  };

  const handleCancel = () => {
    setForm({ username, bio, cosmic_color: cosmicColor });
    setErrors({});
    setEditing(false);
  };

  const activeColor = editing ? form.cosmic_color : cosmicColor;

  return (
    <>
      <Head><title>Light Signature{/*  — {username} */}</title></Head>
      <UniverseBackdrop />

      <div className="identity-page">
        <div className="identity-card" style={{ '--cosmic': activeColor }}>

          {/* ── Header ─────────────────────────────────────────────────── */}
          <div className="identity-card__header">
            <Avatar username={editing ? form.username : username} color={activeColor} size={72} />

            <div className="identity-card__title-group">
              {editing ? (
                <input
                  className="identity-input identity-input--username"
                  value={form.username}
                  onChange={e => handleChange('username', e.target.value)}
                  maxLength={30}
                  placeholder="Username"
                  style={{ '--cosmic': activeColor }}
                />
              ) : (
                <h2 className="identity-card__username">{username}</h2>
              )}

              {editing ? (
                <textarea
                  className="identity-input identity-input--bio"
                  value={form.bio}
                  onChange={e => handleChange('bio', e.target.value)}
                  maxLength={120}
                  placeholder="Your signal to the Verse… (120 chars)"
                  rows={2}
                  style={{ '--cosmic': activeColor }}
                />
              ) : (
                <p className="identity-card__bio">
                  {bio || <span className="identity-card__bio--empty">No signal set yet.</span>}
                </p>
              )}

              <span className="identity-card__since">
                ✦ Member since {memberSince}
              </span>
            </div>

            {/* Edit / Save buttons */}
            <div className="identity-card__actions">
              {!editing ? (
                <button
                  className="identity-btn identity-btn--edit"
                  onClick={() => setEditing(true)}
                  style={{ '--cosmic': activeColor }}
                >
                  Edit
                </button>
              ) : (
                <>
                  <button
                    className="identity-btn identity-btn--save"
                    onClick={handleSave}
                    disabled={saving}
                    style={{ '--cosmic': activeColor }}
                  >
                    {saving ? '...' : 'Save'}
                  </button>
                  <button
                    className="identity-btn identity-btn--cancel"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ── Color picker (edit mode only) ──────────────────────────── */}
        {/*   {editing && (
            <div className="identity-card__colors">
              <span className="identity-card__colors-label">Cosmic color</span>
              <div className="identity-color-grid">
                {COSMIC_COLORS.map(c => (
                  <button
                    key={c.value}
                    className={`identity-color-swatch ${form.cosmic_color === c.value ? 'identity-color-swatch--active' : ''}`}
                    style={{ background: c.value }}
                    title={c.label}
                    onClick={() => handleChange('cosmic_color', c.value)}
                  />
                ))}
              </div>
            </div>
          )} */}

          {/* ── Error display ──────────────────────────────────────────── */}
       {/*    {errors && Object.keys(errors).length > 0 && (
            <div className="identity-card__errors">
              {Object.values(errors).map((e, i) => (
                <p key={i} className="identity-error">{e}</p>
              ))}
            </div>
          )} */}

          {/* ── Success flash ──────────────────────────────────────────── */}
          {flash?.success && (
            <div className="identity-card__flash">
              ✦ {flash.success}
            </div>
          )}

          {/* ── Divider ────────────────────────────────────────────────── */}
          <div className="identity-card__divider" />

          {/* ── Light breakdown ────────────────────────────────────────── */}
          <div className="identity-card__section">
            <h3 className="identity-card__section-title">Light Signature</h3>
            <div className="identity-light-total">
              <span className="identity-light-total__icon">✦</span>
              <span className="identity-light-total__value">{userLight.total}</span>
              <span className="identity-light-total__label">Total Light</span>
            </div>
            <div className="identity-light-bars">
              <LightBar label="Core"   value={userLight.core}   total={userLight.total} color="#ffffff" />
              <LightBar label="Stable" value={userLight.stable} total={userLight.total} color={activeColor} />
              <LightBar label="Active" value={userLight.active} total={userLight.total} color="#00ffcc" />
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

Profile.layout = page => <MainLayout>{page}</MainLayout>;
export default Profile;