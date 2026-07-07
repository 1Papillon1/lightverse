// components/Light/LightDisplay.jsx
import { useState, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { RootStoreContext } from '@/stores/RootStore';

const LightDisplay = observer(({ variant = 'nav' }) => {
  const { lightStore } = useContext(RootStoreContext);
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`light-display light-display--${variant}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="light-display__total">
        <span className="light-display__icon">✦</span>
        <span className="light-display__value">{lightStore.totalLight}</span>
      </div>

      {open && (
        <div className="light-display__breakdown">
          <div className="light-display__row">
            <span className="light-display__label">Core</span>
            <span className="light-display__amount">{lightStore.coreLight}</span>
          </div>
          <div className="light-display__row">
            <span className="light-display__label">Stable</span>
            <span className="light-display__amount">{lightStore.stableLight}</span>
          </div>
          <div className="light-display__row">
            <span className="light-display__label">Active</span>
            <span className="light-display__amount">{lightStore.activeLight}</span>
          </div>
        </div>
      )}
    </div>
  );
});

export default LightDisplay;