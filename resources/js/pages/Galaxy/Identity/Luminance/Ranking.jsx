// resources/js/Pages/Galaxy/Identity/Luminance/Ranking.jsx
import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import MainLayout from '@/MainLayout';
import UniverseBackdrop from '@/components/visuals/UniverseBackdrop';

// ── Icons ─────────────────────────────────────────────────────────
const CrownIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M2 20h20v2H2v-2zm2-3l3-9 5 4 5-4 3 9H4zm8-11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
  </svg>
);

const LockIcon = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const LightIcon = ({ size = 11 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

// ── Rank medal colors ─────────────────────────────────────────────
const RANK_STYLES = {
  1: { color: '#FFD700', glow: 'rgba(255,215,0,0.6)',   label: 'Genesis'   },
  2: { color: '#C0C0C0', glow: 'rgba(192,192,192,0.4)', label: 'Luminary'  },
  3: { color: '#CD7F32', glow: 'rgba(205,127,50,0.4)',  label: 'Stellar'   },
};

// ── Obfuscate username for locked rows ────────────────────────────
function obfuscate(name = '') {
  if (!name) return '???';
  const first = name[0];
  const rest  = name.slice(1).replace(/[a-zA-Z0-9]/g, '*');
  return first + rest;
}

// ── Format light number ───────────────────────────────────────────
function fmtLight(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

// ── Single row ────────────────────────────────────────────────────
function RankRow({ entry, isCurrentUser, isLocked, cosmicColor, animDelay }) {
  const rankStyle = RANK_STYLES[entry.rank] ?? null;
  const rowColor  = isCurrentUser
    ? cosmicColor
    : rankStyle?.color ?? 'rgba(255,255,255,0.5)';

  return (
    <div
      className={`rank-row
        ${isCurrentUser ? 'is-me'     : ''}
        ${isLocked      ? 'is-locked' : ''}
        ${entry.rank <= 3 ? 'is-top3' : ''}
      `}
      style={{
        '--rcolor': rowColor,
        '--rglow':  rankStyle?.glow ?? 'transparent',
        animationDelay: `${animDelay}ms`,
      }}
    >
      {/* Rank number */}
      <div className="rank-row__pos">
        {entry.rank <= 3
          ? <span className="rank-row__crown"><CrownIcon size={12} /></span>
          : null
        }
        <span className="rank-row__num">#{entry.rank}</span>
      </div>

      {/* Avatar dot */}
      <div className="rank-row__avatar" style={{ background: rowColor, boxShadow: `0 0 8px ${rowColor}` }}>
        {isLocked
          ? <LockIcon size={10} />
          : (entry.username?.[0] ?? '?').toUpperCase()
        }
      </div>

      {/* Username */}
      <div className="rank-row__name">
        {isLocked
          ? <span className="rank-row__hidden">{obfuscate(entry.username)}</span>
          : <span>{entry.username}{isCurrentUser && <span className="rank-row__you"> YOU</span>}</span>
        }
        {rankStyle && !isLocked && (
          <span className="rank-row__label">{rankStyle.label}</span>
        )}
      </div>

      {/* Light score */}
      <div className="rank-row__light">
        {isLocked ? (
          <span className="rank-row__hidden">●●●●</span>
        ) : (
          <>
            <LightIcon size={11} />
            <span>{fmtLight(entry.total_light)}</span>
          </>
        )}
      </div>

      {/* Top3 glow bar */}
      {entry.rank <= 3 && !isLocked && (
        <div className="rank-row__bar" style={{ background: rowColor }} />
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
const Ranking = () => {
  const { auth, light } = usePage().props;
  const cosmicColor = auth?.user?.cosmic_color ?? '#ff9900';
  const currentUser = auth?.user ?? {};
  const myLight     = light?.user?.total ?? 0;

  const [entries,   setEntries]   = useState([]);
  const [myRank,    setMyRank]    = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    fetch('/api/ranking', { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
      .then(r => r.json())
      .then(data => {
        setEntries(data.leaderboard   ?? []);
        setMyRank(data.my_rank        ?? null);
        setTotalUsers(data.total_users ?? 0);
        setLoading(false);
      })
      .catch(() => {
        // Fallback mock so UI is never blank during development
        setEntries(MOCK_ENTRIES);
        setMyRank({ rank: 42, total_light: myLight });
        setTotalUsers(142);
        setLoading(false);
      });
  }, []);

  // Decide visibility rules:
  // Ranks 1–10  → fully visible
  // Ranks 11–20 → name + score locked
  // Current user row always visible regardless of rank
  const VISIBLE_LIMIT = 10;
  const LOCKED_LIMIT  = 20;

  const visibleEntries = entries.slice(0, LOCKED_LIMIT);

  // Is current user already in the visible list?
  const myRankInList = myRank && myRank.rank <= LOCKED_LIMIT;

  return (
    <>
      <Head>
        <title>Ranking — Lightverse</title>
        <meta name="description" content="The Lightverse cosmic leaderboard — see who shines brightest in the Verse." />
      </Head>
      <UniverseBackdrop />

      <section className="ranking-page">

        {/* Projector beam */}
        <div className="ranking-page__projector" style={{ '--pcolor': cosmicColor }} />

        {/* Holographic panel */}
        <div className="ranking-page__panel">

          {/* Header */}
          <div className="ranking-page__header">
            <div className="ranking-page__header-icon" style={{ color: cosmicColor }}>
              <CrownIcon size={18} />
            </div>
            <div>
              <h2 className="ranking-page__title" style={{ '--cosmic': cosmicColor }}>
                Cosmic Ranking
              </h2>
              <p className="ranking-page__subtitle">
                {loading ? '…' : `${totalUsers.toLocaleString()} explorers in the Verse`}
              </p>
            </div>
          </div>

          {/* My rank callout — always visible */}
          {myRank && (
            <div className="ranking-page__myrank" style={{ '--cosmic': cosmicColor }}>
              <div className="ranking-page__myrank-label">Your position</div>
              <div className="ranking-page__myrank-val">
                <span>#{myRank.rank}</span>
                <span className="ranking-page__myrank-of">of {totalUsers.toLocaleString()}</span>
              </div>
              <div className="ranking-page__myrank-light">
                <LightIcon size={11} />
                <span>{fmtLight(myRank.total_light ?? myLight)} Light</span>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="ranking-page__table">

            {/* Column headers */}
            <div className="ranking-page__cols">
              <span>Rank</span>
              <span>Explorer</span>
              <span>Light</span>
            </div>

            {/* Rows */}
            {loading ? (
              <div className="ranking-page__empty">Scanning the Verse…</div>
            ) : (
              <>
                {visibleEntries.map((entry, i) => {
                  const isMe     = entry.id === currentUser.id;
                  const isLocked = entry.rank > VISIBLE_LIMIT && !isMe;
                  return (
                    <RankRow
                      key={entry.id ?? entry.rank}
                      entry={entry}
                      isCurrentUser={isMe}
                      isLocked={isLocked}
                      cosmicColor={cosmicColor}
                      animDelay={i * 40}
                    />
                  );
                })}

                {/* If user is outside top 20, show their row pinned at bottom */}
                {myRank && !myRankInList && (
                  <>
                    <div className="ranking-page__ellipsis">· · ·</div>
                    <RankRow
                      entry={{
                        id:          currentUser.id,
                        rank:        myRank.rank,
                        username:    currentUser.username,
                        total_light: myRank.total_light ?? myLight,
                      }}
                      isCurrentUser={true}
                      isLocked={false}
                      cosmicColor={cosmicColor}
                      animDelay={0}
                    />
                  </>
                )}

                {/* Lock hint */}
                <div className="ranking-page__lock-hint">
                  <LockIcon size={11} />
                  <span>Ranks 11–20 unlock as you climb the Verse</span>
                </div>
              </>
            )}
          </div>

        </div>

      </section>
    </>
  );
};

// ── Mock data (used when API not ready) ───────────────────────────
const MOCK_ENTRIES = Array.from({ length: 20 }, (_, i) => ({
  id:          i + 1,
  rank:        i + 1,
  username:    ['TinPapucic','NebulaPilot','VoidWalker','StarForger','LightSeeker',
                'CosmicEcho','QuantumDrift','ArcLight','ZeroGravity','PhotonRider',
                'DarkMatter','EventHorizon','GravityWell','SolarFlare','RedShift',
                'NeutronStar','PulsarX','CosmicRay','BlackHoleB','WhiteDwarf'][i],
  total_light: Math.floor(5000 - i * 220 + Math.random() * 80),
  cosmic_color: ['#ff9900','#00ffcc','#9966ff','#ff4466','#00aaff',
                 '#ffee00','#ff66cc','#44ffaa','#ff6622','#aaffff',
                 '#ff9900','#00ffcc','#9966ff','#ff4466','#00aaff',
                 '#ffee00','#ff66cc','#44ffaa','#ff6622','#aaffff'][i],
}));

Ranking.layout = page => <MainLayout>{page}</MainLayout>;
export default Ranking;