// resources/js/Pages/Galaxy/Signal/LiveFeed/AllSignals.jsx
import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/MainLayout';
import UniverseBackdrop from '@/components/visuals/UniverseBackdrop';
import SignalCard from '@/components/signal/SignalCard';

const AllSignals = ({ signals = [], lastUpdated = null }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const sourceTypes = ['all', 'news', 'social'];

  const filtered = signals.filter(s => {
    const matchesType   = filter === 'all' || s.source_type === filter;
    const matchesSearch = !search || 
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.body?.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <>
      <Head>
        <title>All Signals — The Signal</title>
      </Head>
      <UniverseBackdrop />

      <div className="signal-feed">
        <div className="signal-feed__header">
          <div className="signal-feed__title-row">
            <h2 className="signal-feed__title">
              <span className="signal-feed__icon">📡</span>
              All Signals
            </h2>
            {lastUpdated && (
              <span className="signal-feed__updated">
                Updated {lastUpdated}
              </span>
            )}
          </div>

          <div className="signal-feed__controls">
            <input
              type="text"
              className="signal-feed__search"
              placeholder="Search signals..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className="signal-feed__filters">
              {sourceTypes.map(type => (
                <button
                  key={type}
                  className={`signal-feed__filter ${filter === type ? 'signal-feed__filter--active' : ''}`}
                  onClick={() => setFilter(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <p className="signal-feed__count">
            {filtered.length} signals from {new Set(signals.map(s => s.source_name)).size} sources
          </p>
        </div>

        <div className="signal-feed__list">
          {filtered.length === 0 && (
            <p className="signal-feed__empty">
              No signals match your search.
            </p>
          )}
          {filtered.map(signal => (
            <SignalCard key={signal.id} signal={signal} />
          ))}
        </div>
      </div>
    </>
  );
};

AllSignals.layout = page => <MainLayout>{page}</MainLayout>;
export default AllSignals;