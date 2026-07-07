import React, { useState } from 'react';
import { formatDate } from '@/utils/formatDate';

// ── Category definitions ──────────────────────────────────────────
const CATEGORIES = [
  { id: 'all',         label: 'All',         color: '#ffffff' },
  { id: 'exploration', label: 'Explorer',    color: '#00ffcc' },
  { id: 'knowledge',   label: 'Knowledge',   color: '#9966ff' },
  { id: 'forge',       label: 'Forge',       color: '#ff8800' },
  { id: 'signal',      label: 'Signal',      color: '#00ccff' },
  { id: 'identity',    label: 'Identity',    color: '#ff9900' },
  { id: 'social',      label: 'Social',      color: '#ff4488' },
];

// ── Icons ─────────────────────────────────────────────────────────
export const TrophyIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="8 21 12 17 16 21"/><line x1="12" y1="17" x2="12" y2="11"/>
    <path d="M7 4H4a2 2 0 0 0-2 2v1a5 5 0 0 0 5 5h.2"/>
    <path d="M17 4h3a2 2 0 0 1 2 2v1a5 5 0 0 1-5 5h-.2"/>
    <rect x="7" y="2" width="10" height="9" rx="2"/>
  </svg>
);

export const LockIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

export const StarIcon = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);


// ── Single achievement card ───────────────────────────────────────
function AchievementCard({ achievement, isUnlocked, unlockedAt }) {
  const [flipped, setFlipped] = useState(false);
  const color = CATEGORIES.find(c => c.id === achievement.category)?.color ?? '#ffffff';

  return (
    <div
      className={`ach-card ${isUnlocked ? 'is-unlocked' : 'is-locked'} ${flipped ? 'is-flipped' : ''}`}
      style={{ '--acolor': color }}
      onClick={() => isUnlocked && setFlipped(f => !f)}
      title={!isUnlocked ? 'Not yet unlocked' : 'Click for details'}
    >
      <div className="ach-card__inner">

        {/* FRONT */}
        <div className="ach-card__front">
          <div className="ach-card__glow" />
          <div className="ach-card__icon">
            {isUnlocked
              ? <span>{achievement.icon ?? '🏆'}</span>
              : <LockIcon size={20} />
            }
          </div>
          <div className="ach-card__name">{achievement.name}</div>
          {isUnlocked && (
            <div className="ach-card__reward">
              <StarIcon size={10} />
              <span>{achievement.light_reward ?? 0} Light</span>
            </div>
          )}
          {!isUnlocked && (
            <div className="ach-card__locked-label">Locked</div>
          )}
        </div>

        {/* BACK (only rendered when unlocked) */}
        {isUnlocked && (
          <div className="ach-card__back">
            <div className="ach-card__back-icon">{achievement.icon ?? '🏆'}</div>
            <div className="ach-card__back-name">{achievement.name}</div>
            <p className="ach-card__back-desc">{achievement.description}</p>
            <div className="ach-card__back-meta">
              <span>+{achievement.light_reward ?? 0} Light</span>
              {unlockedAt && <span>{formatDate(unlockedAt)}</span>}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default AchievementCard;
