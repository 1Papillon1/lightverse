// resources/js/Pages/Galaxy/Signal/WorldEvents/PoliticsConflict.jsx
import React from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/MainLayout';
import UniverseBackdrop from '@/components/visuals/UniverseBackdrop';
import SignalCard from '@/components/signal/SignalCard';

const PoliticsConflict = ({ signals = [], lastUpdated = null }) => (
  <>
    <Head>
      <title>Politics & World — The Signal</title>
    </Head>
    <UniverseBackdrop />

    <div className="signal-feed">
      <div className="signal-feed__header">
        <div className="signal-feed__title-row">
          <h2 className="signal-feed__title">
            <span className="signal-feed__icon">🌐</span>
            Politics & World
          </h2>
          {lastUpdated && (
            <span className="signal-feed__updated">Updated {lastUpdated}</span>
          )}
        </div>
        <p className="signal-feed__count">
          {signals.length} signals — BBC, Al Jazeera, Reuters and world sources
        </p>
      </div>

      <div className="signal-feed__list">
        {signals.map(signal => (
          <SignalCard key={signal.id} signal={signal} />
        ))}
      </div>
    </div>
  </>
);

PoliticsConflict.layout = page => <MainLayout>{page}</MainLayout>;
export default PoliticsConflict;