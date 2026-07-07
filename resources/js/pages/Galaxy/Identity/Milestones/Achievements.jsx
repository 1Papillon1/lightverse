// resources/js/Pages/Galaxy/Identity/Milestones/Achievements.jsx
import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import MainLayout from '@/MainLayout';
import UniverseBackdrop from '@/components/visuals/UniverseBackdrop';
import AchievementCard from '@/components/ui/AchievementCard';
import { TrophyIcon } from '@/components/ui/AchievementCard';



const Achievements = () => {
  const { auth } = usePage().props;
  const cosmicColor = auth?.user?.cosmic_color ?? '#ff9900';

  const [allAchievements, setAllAchievements]   = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [activeCategory, setActiveCategory]     = useState('all');
  const [view, setView]                         = useState('unlocked'); // 'unlocked' | 'all'

  useEffect(() => {
    fetch('/api/achievements', { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
      .then(r => r.json())
      .then(data => {
        // API returns user's unlocked achievements with pivot data
        setUserAchievements(data?.data ?? data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Build unlocked ID set + pivot map
  const unlockedMap = new Map(
    userAchievements.map(a => [a.id, a.pivot?.unlocked_at ?? a.unlocked_at ?? null])
  );

  // Filter by category + view
  const source = view === 'unlocked' ? userAchievements : allAchievements;
  const filtered = activeCategory === 'all'
    ? source
    : source.filter(a => a.category === activeCategory);

  const unlockedCount = userAchievements.length;
  const totalLight    = userAchievements.reduce((s, a) => s + (a.light_reward ?? 0), 0);

  return (
    <>
      <Head><title>Achievements — Lightverse</title></Head>
      <UniverseBackdrop />

      <section className="ach-page">

        {/* Projector beam */}
        <div className="ach-page__projector" style={{ '--acolor': cosmicColor }} />

        {/* Panel */}
        <div className="ach-page__panel">

          {/* Header */}
          <div className="ach-page__header">
            <div className="ach-page__header-icon" style={{ color: cosmicColor }}>
              <TrophyIcon size={20} />
            </div>
            <div>
              <h2 className="ach-page__title" style={{ '--cosmic': cosmicColor }}>
                Achievements
              </h2>
              <p className="ach-page__subtitle">
                {loading ? '…' : `${unlockedCount} unlocked · ${totalLight.toLocaleString()} Light earned`}
              </p>
            </div>
          </div>

          {/* View toggle */}
          <div className="ach-page__toggle">
            {['unlocked', 'all'].map(v => (
              <button
                key={v}
                className={`ach-page__toggle-btn ${view === v ? 'is-active' : ''}`}
                style={{ '--cosmic': cosmicColor }}
                onClick={() => setView(v)}
              >
                {v === 'unlocked' ? `Unlocked (${unlockedCount})` : 'All'}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <div className="ach-page__cats">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                className={`ach-page__cat ${activeCategory === cat.id ? 'is-active' : ''}`}
                style={{ '--ccolor': cat.color }}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="ach-page__grid">
            {loading ? (
              <div className="ach-page__empty">Loading achievements…</div>
            ) : filtered.length === 0 ? (
              <div className="ach-page__empty">
                {view === 'unlocked'
                  ? 'No achievements unlocked yet. Start exploring the Verse.'
                  : 'No achievements in this category.'}
              </div>
            ) : (
              filtered.map(a => (
                <AchievementCard
                  key={a.id}
                  achievement={a}
                  isUnlocked={unlockedMap.has(a.id) || view === 'unlocked'}
                  unlockedAt={unlockedMap.get(a.id)}
                />
              ))
            )}
          </div>

        </div>

      </section>

   
    </>
  );
};

Achievements.layout = page => <MainLayout>{page}</MainLayout>;
export default Achievements;