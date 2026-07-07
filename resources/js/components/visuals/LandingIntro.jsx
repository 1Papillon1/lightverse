// resources/js/components/visuals/LandingIntro.jsx
import React, { useEffect, useState } from 'react';

const LandingIntro = ({ onComplete }) => {
  const [phase, setPhase] = useState('spark');
  // phases: 'spark' → 'explode' → 'reveal' → 'done'
  // Note: GENESIS label lives in UniverseScene — not duplicated here

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('explode'), 1800);
    const t2 = setTimeout(() => setPhase('reveal'),  3500);
    const t3 = setTimeout(() => setPhase('done'),    5500);
    const t4 = setTimeout(() => onComplete?.(),      5800);

    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, []);

  if (phase === 'done') return null;

  return (
    <div className={`landing-intro landing-intro--${phase}`}>
      {/* Black overlay — fades away on explode */}
      <div className="landing-intro__fade" />

      {/* Light core — grows from nothing */}
      <div className="landing-intro__spark" />

      {/* Shockwave ring — fires on explode */}
      {(phase === 'explode' || phase === 'reveal') && (
        <div className="landing-intro__ring" />
      )}
    </div>
  );
};

export default LandingIntro;