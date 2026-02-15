import React from "react";
import { usePage } from "@inertiajs/react";

const LightBadge = () => {
  const { light } = usePage().props;
  
  // ✅ Safe destructuring at top level
  if (!light?.user) return null;

  const { core, stable, active, total } = light.user;

  return (
    <div className="light-badge">
      {/* Main Light Display */}
      <div className="light-badge__total">
        <div className="light-badge__icon">💠</div>
        <div className="light-badge__amount">{total}</div>
      </div>

      {/* Detailed Breakdown (on hover) */}
      <div className="light-badge__details">
        <div className="light-badge__row">
          <span className="light-badge__label">Core</span>
          <span className="light-badge__value">{core}</span>
        </div>
        <div className="light-badge__row">
          <span className="light-badge__label">Stable</span>
          <span className="light-badge__value">{stable}</span>
        </div>
        <div className="light-badge__row">
          <span className="light-badge__label">Active</span>
          <span className="light-badge__value">{active}</span>
        </div>
      </div>
    </div>
  );
};

export default LightBadge;