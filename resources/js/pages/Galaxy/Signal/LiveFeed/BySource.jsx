// resources/js/Pages/Galaxy/Signal/LiveFeed/BySource.jsx
import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/MainLayout';
import UniverseBackdrop from '@/components/visuals/UniverseBackdrop';
import SignalCard from '@/components/signal/SignalCard';

const SOURCE_TYPE_LABELS = {
  news:   { label: 'News',   icon: '📰' },
  social: { label: 'Social', icon: '💬' },
};

const BySource = ({ signals = {}, lastUpdated = null }) => {
  const [activeType, setActiveType] = useState(
    Object.keys(signals)[0] ?? 'news'
  );

  const types = Object.keys(signals);
  const activeSignals = signals[activeType] ?? [];

  return (
    <>
      <Head>
        <title>By Source — The Signal</title>
      </Head>
      <UniverseBackdrop />

      <div className="signal-feed">
        <div className="signal-feed__header">
          <div className="signal-feed__title-row">
            <h2 className="signal-feed__title">
              <span className="signal-feed__icon">🗂️</span>
              By Source
            </h2>
            {lastUpdated && (
              <span className="signal-feed__updated">Updated {lastUpdated}</span>
            )}
          </div>

          <div className="signal-feed__filters">
            {types.map(type => (
              <button
                key={type}
                className={`signal-feed__filter ${activeType === type ? 'signal-feed__filter--active' : ''}`}
                onClick={() => setActiveType(type)}
              >
                {SOURCE_TYPE_LABELS[type]?.icon} {SOURCE_TYPE_LABELS[type]?.label ?? type}
                <span style={{ marginLeft: '0.4rem', opacity: 0.5 }}>
                  ({signals[type]?.length ?? 0})
                </span>
              </button>
            ))}
          </div>

          <p className="signal-feed__count">
            {activeSignals.length} signals of type "{activeType}"
          </p>
        </div>

        <div className="signal-feed__list">
          {activeSignals.map(signal => (
            <SignalCard key={signal.id} signal={signal} />
          ))}
        </div>
      </div>
    </>
  );
};

BySource.layout = page => <MainLayout>{page}</MainLayout>;
export default BySource;