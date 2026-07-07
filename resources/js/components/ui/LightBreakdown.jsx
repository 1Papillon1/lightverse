// resources/js/components/ui/LightBreakdown.jsx

import React from 'react';

const LightBreakdown = ({ light, showTotal = true, compact = false }) => {
  const total  = light?.total  ?? 0;
  const core   = light?.core   ?? 0;
  const stable = light?.stable ?? 0;
  const active = light?.active ?? 0;

  return (
    <div className={`light-breakdown ${compact ? 'light-breakdown--compact' : ''}`}>
      {showTotal && (
        <div className="light-breakdown__total">
          <span className="light-breakdown__icon">✦</span>
          <span className="light-breakdown__number">{total}</span>
          <span className="light-breakdown__unit">Light</span>
        </div>
      )}
      <div className="light-breakdown__rows">
        <div className="light-breakdown__row">
          <span className="light-breakdown__label">Core</span>
          <span className="light-breakdown__value light-breakdown__value--core">{core}</span>
        </div>
        <div className="light-breakdown__row">
          <span className="light-breakdown__label">Stable</span>
          <span className="light-breakdown__value light-breakdown__value--stable">{stable}</span>
        </div>
        <div className="light-breakdown__row">
          <span className="light-breakdown__label">Active</span>
          <span className="light-breakdown__value light-breakdown__value--active">{active}</span>
        </div>
      </div>
    </div>
  );
};

export default LightBreakdown;