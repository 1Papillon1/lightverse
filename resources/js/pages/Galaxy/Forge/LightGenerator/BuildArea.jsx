// resources/js/Pages/Galaxy/Forge/LightGenerator/BuildArea.jsx
// Route: /galaxy/forge/light-generator/build-area
// Inertia props: { generator: { state, currentStage, stageStartedAt, completedStages[] } | null }

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Head, router } from '@inertiajs/react';
import MainLayout from '@/MainLayout';
import UniverseBackdrop from '@/components/visuals/UniverseBackdrop';
import LightToast from '@/components/ui/LightToast';
import { generatorConfig } from '@/config/forge';
import GeneratorModel from '@/components/visuals/GeneratorModel';

// ─── DEV TESTING ─────────────────────────────────────────────────────────────
const DEV_MODE = false;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDuration = (hours) => {
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours === 1) return '1h';
  return `${hours}h`;
};

const formatCountdown = (msRemaining) => {
  if (msRemaining <= 0) return '00:00:00';
  const h = Math.floor(msRemaining / 3600000);
  const m = Math.floor((msRemaining % 3600000) / 60000);
  const s = Math.floor((msRemaining % 60000) / 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const getStageConfig = (stageNumber) =>
  generatorConfig.stages.find(s => s.id === stageNumber);

// ─── Stage dots ───────────────────────────────────────────────────────────────

const StageDots = ({ currentStage, completedStages, totalStages }) => (
  <div className="forge-build__dots">
    {Array.from({ length: totalStages }, (_, i) => {
      const stageNum  = i + 1;
      const stage     = getStageConfig(stageNum);
      const completed = completedStages.includes(stage.key);
      const active    = stageNum === currentStage;
      return (
        <div
          key={stageNum}
          className={[
            'forge-build__dot',
            completed ? 'forge-build__dot--done'   : '',
            active    ? 'forge-build__dot--active' : '',
          ].join(' ')}
          title={stage.name}
        />
      );
    })}
  </div>
);

// ─── STAGE 0: Inactive ────────────────────────────────────────────────────────

const InactiveView = ({ onBegin }) => (
  <div className="forge-build__card">
    <div className="forge-build__card-inner">
      <div className="forge-build__icon">⚙</div>
      <h3 className="forge-build__title">Light Generator</h3>
      <p className="forge-build__desc">{generatorConfig.description}</p>

      <div className="forge-build__meta">
        <span>5 stages</span>
        <span className="forge-build__meta-sep">·</span>
        <span>~20 hours</span>
        <span className="forge-build__meta-sep">·</span>
        <span className="forge-build__meta-reward">+{generatorConfig.completionLight} Light</span>
      </div>

      <div className="forge-build__stage-list">
        {generatorConfig.stages.map(s => (
          <div key={s.id} className="forge-build__stage-row">
            <span className="forge-build__stage-num">{s.id}</span>
            <span className="forge-build__stage-name">{s.name}</span>
            <span className="forge-build__stage-dur">
              {s.mechanic === 'charge' ? 'Manual' :
               s.mechanic === 'gate'   ? `${formatDuration(s.durationHours)} + gate` :
               formatDuration(s.durationHours)}
            </span>
          </div>
        ))}
      </div>

      <button className="forge-build__btn forge-build__btn--primary" onClick={onBegin}>
        Begin construction
      </button>
    </div>
  </div>
);

// ─── STAGE 1: Foundation ──────────────────────────────────────────────────────

const GateStageView = ({ stage, completedStages, onGatePassed, onTimerBegin, generatorState, stageStartedAt }) => {
  const gatePassed  = completedStages.includes('foundation-gate');
  const timerActive = generatorState === 'active';
  const stageDone   = completedStages.includes('foundation');
  const [remaining, setRemaining] = useState(null);
  const [timerDone, setTimerDone] = useState(false);

  useEffect(() => {
    if (!timerActive || !stageStartedAt) return;
    const endTime = new Date(stageStartedAt).getTime() + stage.durationHours * 3600 * 1000;
    const tick = () => {
      const left = endTime - Date.now();
      if (left <= 0) { setRemaining(0); setTimerDone(true); }
      else setRemaining(left);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timerActive, stageStartedAt]);

  return (
    <div className="forge-build__card">
      <div className="forge-build__card-inner">
        <StageDots currentStage={1} completedStages={completedStages} totalStages={5} />
        <span className="forge-build__stage-badge">Stage 1</span>
        <h3 className="forge-build__title">Foundation</h3>
        <p className="forge-build__desc">{stage.lore}</p>

        {!gatePassed && (
          <div className="forge-build__gate">
            <p>Retrieve the schematics from the archive before you begin.</p>
            <a href={stage.gateNode} className="forge-build__gate-link" onClick={onGatePassed}>
              ↗ {stage.gateNodeLabel}
            </a>
            <p className="forge-build__note">Return here after reading.</p>
          </div>
        )}

        {gatePassed && !timerActive && !timerDone && !stageDone && (
          <button className="forge-build__btn forge-build__btn--primary" onClick={onTimerBegin}>
            Lay the foundation
          </button>
        )}

        {timerActive && remaining !== null && !timerDone && (
          <div className="forge-build__timer">
            <div className="forge-build__countdown">{formatCountdown(remaining)}</div>
            <p className="forge-build__note">Foundation setting…</p>
          </div>
        )}

        {(timerDone || (generatorState === 'waiting' && stageDone)) && (
          <div className="forge-build__status">
            <span className="forge-build__status-icon">◈</span>
            <p>Foundation complete. Proceed to Core Ignition.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── STAGE 2: Core Ignition ───────────────────────────────────────────────────

const CHARGE_DECAY_RATE = generatorConfig.stages[1].decayRate;
const CHARGE_RATE       = generatorConfig.stages[1].chargeRate;
const TIME_LIMIT_MS     = generatorConfig.stages[1].timeLimit * 1000;

const ChargeStageView = ({ completedStages, onChargeComplete }) => {
  const alreadyDone             = completedStages.includes('core-ignition');
  const [phase, setPhase]       = useState(alreadyDone ? 'done' : 'intro');
  const [fill, setFill]         = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_MS);
  const [pressCount, setPressCount] = useState(0);

  const fillRef     = useRef(0);
  const timeRef     = useRef(TIME_LIMIT_MS);
  const activeRef   = useRef(false);
  const animRef     = useRef(null);
  const lastTickRef = useRef(null);

  const startCharge = useCallback(() => {
    fillRef.current     = 0;
    timeRef.current     = TIME_LIMIT_MS;
    activeRef.current   = true;
    lastTickRef.current = performance.now();
    setFill(0);
    setTimeLeft(TIME_LIMIT_MS);
    setPressCount(0);
    setPhase('active');
  }, []);

  useEffect(() => {
    if (phase !== 'active') return;
    const tick = (now) => {
      const delta = (now - (lastTickRef.current || now)) / 1000;
      lastTickRef.current  = now;
      timeRef.current     -= delta * 1000;
      fillRef.current      = Math.max(0, fillRef.current - CHARGE_DECAY_RATE * delta);
      if (fillRef.current >= 99) {
        activeRef.current = false;
        setFill(100);
        setPhase('success');
        onChargeComplete(true);
        return;
      }
      if (timeRef.current <= 0) {
        activeRef.current = false;
        setPhase('fail');
        return;
      }
      setFill(Math.round(fillRef.current));
      setTimeLeft(Math.max(0, Math.round(timeRef.current)));
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'active') return;
    const onKey = (e) => {
      if ((e.code === 'Space' || e.key === ' ') && activeRef.current) {
        e.preventDefault();
        fillRef.current = Math.min(100, fillRef.current + CHARGE_RATE);
        setPressCount(c => c + 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase]);

  const handleMobilePress = () => {
    if (phase === 'active' && activeRef.current) {
      fillRef.current = Math.min(100, fillRef.current + CHARGE_RATE);
      setPressCount(c => c + 1);
    }
  };

  return (
    <div className="forge-build__card">
      <div className="forge-build__card-inner">
        <StageDots currentStage={2} completedStages={completedStages} totalStages={5} />
        <span className="forge-build__stage-badge">Stage 2</span>
        <h3 className="forge-build__title">Core Ignition</h3>

        {(phase === 'done' || alreadyDone) && (
          <div className="forge-build__status">
            <span style={{ color: '#ffaa00' }}>✦</span>
            <p>Core ignited. Calibration underway.</p>
          </div>
        )}

        {phase === 'intro' && (
          <>
            <p className="forge-build__desc">{getStageConfig(2).lore}</p>
            <p className="forge-build__note">
              Fill the charge meter. Press <kbd className="forge-build__kbd">Space</kbd> as fast as you can — 30 seconds.
            </p>
            <button className="forge-build__btn forge-build__btn--ignite" onClick={startCharge}>
              ⚡ Begin ignition
            </button>
          </>
        )}

        {phase === 'active' && (
          <div className="forge-build__charge-arena">
            <div className="forge-build__charge-timer">{(timeLeft / 1000).toFixed(1)}s</div>
            <div className="forge-build__charge-row">
              <div className="forge-build__charge-meter">
                <div className="forge-build__charge-fill" style={{ height: `${fill}%` }} />
                <div className="forge-build__charge-target" />
              </div>
              <div className="forge-build__charge-right">
                <span className="forge-build__charge-pct">{fill}%</span>
                <button
                  className="forge-build__charge-btn"
                  onPointerDown={handleMobilePress}
                  aria-label="Charge"
                >
                  ⚡
                </button>
                <p className="forge-build__note">{pressCount} pulses</p>
              </div>
            </div>
            <p className="forge-build__note forge-build__note--hint">Spacebar to charge</p>
          </div>
        )}

        {phase === 'success' && (
          <div className="forge-build__status forge-build__status--win">
            <span style={{ color: '#ffaa00', fontSize: '1.4rem' }}>✦</span>
            <p>Core ignited.</p>
          </div>
        )}

        {phase === 'fail' && (
          <div className="forge-build__status forge-build__status--fail">
            <p>The core went cold. You reached {fill}%.</p>
            <button className="forge-build__btn forge-build__btn--secondary" onClick={startCharge}>
              Retry ignition
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── STAGES 3–5: Timer stages ─────────────────────────────────────────────────

const TimerStageView = ({ stage, stageNumber, completedStages, generatorState, stageStartedAt, onBegin, onAdvance, isLast, lightAmount }) => {
  const isActive  = generatorState === 'active';
  const isWaiting = generatorState === 'waiting';
  const isDone    = completedStages.includes(stage.key);
  const [remaining, setRemaining] = useState(null);
  const [timerDone, setTimerDone] = useState(false);

  useEffect(() => {
    if (!isActive || !stageStartedAt) return;
    const endTime = new Date(stageStartedAt).getTime() + stage.durationHours * 3600 * 1000;
    const tick = () => {
      const left = endTime - Date.now();
      if (left <= 0) { setRemaining(0); setTimerDone(true); }
      else setRemaining(left);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isActive, stageStartedAt]);

  return (
    <div className="forge-build__card">
      <div className="forge-build__card-inner">
        <StageDots currentStage={stageNumber} completedStages={completedStages} totalStages={5} />
        <span className="forge-build__stage-badge">Stage {stageNumber}</span>
        <h3 className="forge-build__title">{stage.name}</h3>
        <p className="forge-build__desc">{stage.lore}</p>

        {!isActive && !isDone && !isWaiting && (
          <button className="forge-build__btn forge-build__btn--primary" onClick={onBegin}>
            Begin {stage.name.toLowerCase()}
          </button>
        )}

        {isActive && remaining !== null && !timerDone && (
          <div className="forge-build__timer">
            <div className="forge-build__countdown">{formatCountdown(remaining)}</div>
            <p className="forge-build__note">{stage.name} in progress…</p>
          </div>
        )}

        {(timerDone || isWaiting) && !isDone && (
          <div className="forge-build__status">
            <span className="forge-build__status-icon">◈</span>
            <p>{stage.completionLabel}</p>
            {isLast ? (
              <button className="forge-build__btn forge-build__btn--collect" onClick={onAdvance}>
                ✦ Collect {lightAmount} Light
              </button>
            ) : (
              <button className="forge-build__btn forge-build__btn--primary" onClick={onAdvance}>
                Next stage
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Complete ─────────────────────────────────────────────────────────────────

const CompleteView = ({ lightAmount }) => (
  <div className="forge-build__card forge-build__card--complete">
    <div className="forge-build__card-inner">
      <div className="forge-build__icon forge-build__icon--lit">✦</div>
      <h3 className="forge-build__title">Generator complete</h3>
      <p className="forge-build__desc">
        The structure holds. Light has been added to your signature.
      </p>
      <div className="forge-build__reward-badge">+{lightAmount} Active Light</div>
      <p className="forge-build__note" style={{ opacity: 0.4, marginTop: '0.5rem' }}>
        A new generator can be started when this one has served its purpose.
      </p>
    </div>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────

const BuildArea = ({ generator = null }) => {
  const [localGenerator, setLocalGenerator] = useState(generator || {
    state: 'inactive',
    currentStage: 1,
    stageStartedAt: null,
    completedStages: [],
  });
  const [toast, setToast] = useState(null);

  const showToast = (amount) => {
    setToast(amount);
    setTimeout(() => setToast(null), 3500);
  };

  const postStageAction = (action, extraData = {}) => {
    router.post('/api/generator/action', { action, ...extraData }, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: (page) => {
        if (page.props.generator) setLocalGenerator(page.props.generator);
      },
    });
  };

  const handleBeginConstruction = () => {
    postStageAction('begin');
    setLocalGenerator(g => ({ ...g, state: 'waiting', currentStage: 1 }));
  };

  const handleGatePassed = () => {
    postStageAction('gate_passed');
    setLocalGenerator(g => ({
      ...g,
      completedStages: [...new Set([...g.completedStages, 'foundation-gate'])],
    }));
  };

  const handleTimerBegin = (stageKey) => {
    postStageAction('stage_begin', { stage: stageKey });
    setLocalGenerator(g => ({
      ...g,
      state: 'active',
      stageStartedAt: new Date().toISOString(),
    }));
  };

  const handleChargeComplete = (success) => {
    if (!success) return;
    postStageAction('charge_complete');
    setLocalGenerator(g => ({
      ...g,
      completedStages: [...new Set([...g.completedStages, 'core-ignition'])],
      currentStage: 3,
      state: 'waiting',
      stageStartedAt: null,
    }));
  };

  const handleAdvance = (nextStage, completedKey) => {
    const isLast = nextStage > 5;
    postStageAction(isLast ? 'complete' : 'stage_advance', { nextStage, completed: completedKey });
    if (isLast) {
      setLocalGenerator(g => ({
        ...g,
        state: 'complete',
        completedStages: [...new Set([...g.completedStages, completedKey])],
      }));
      showToast(generatorConfig.completionLight);
    } else {
      setLocalGenerator(g => ({
        ...g,
        currentStage: nextStage,
        state: 'waiting',
        stageStartedAt: null,
        completedStages: [...new Set([...g.completedStages, completedKey])],
      }));
    }
  };

  // ─── DEV helpers ────────────────────────────────────────────────────────────
  const devSkipStage = () => {
    const { currentStage } = localGenerator;
    const stageConf = getStageConfig(currentStage);
    if (!stageConf) return;
    if (currentStage === 1) {
      setLocalGenerator(g => ({
        ...g,
        completedStages: [...new Set([...g.completedStages, 'foundation-gate', 'foundation'])],
        currentStage: 2, state: 'waiting', stageStartedAt: null,
      }));
    } else if (currentStage === 2) {
      setLocalGenerator(g => ({
        ...g,
        completedStages: [...new Set([...g.completedStages, 'core-ignition'])],
        currentStage: 3, state: 'waiting', stageStartedAt: null,
      }));
    } else if (currentStage >= 3 && currentStage <= 4) {
      setLocalGenerator(g => ({
        ...g,
        completedStages: [...new Set([...g.completedStages, stageConf.key])],
        currentStage: currentStage + 1, state: 'waiting', stageStartedAt: null,
      }));
    } else if (currentStage === 5) {
      setLocalGenerator(g => ({
        ...g,
        completedStages: [...new Set([...g.completedStages, stageConf.key])],
        state: 'complete',
      }));
      showToast(generatorConfig.completionLight);
    }
  };

  const devReset = () => setLocalGenerator({
    state: 'inactive', currentStage: 1, stageStartedAt: null, completedStages: [],
  });

  const { state, currentStage, stageStartedAt, completedStages } = localGenerator;
  const isComplete = state === 'complete';

  const renderStage = () => {
    if (state === 'complete') return <CompleteView lightAmount={generatorConfig.completionLight} />;
    if (state === 'inactive') return <InactiveView onBegin={handleBeginConstruction} />;
    switch (currentStage) {
      case 1:
        return (
          <GateStageView
            stage={getStageConfig(1)}
            completedStages={completedStages}
            generatorState={state}
            stageStartedAt={stageStartedAt}
            onGatePassed={handleGatePassed}
            onTimerBegin={() => handleTimerBegin('foundation')}
          />
        );
      case 2:
        return (
          <ChargeStageView
            completedStages={completedStages}
            generatorState={state}
            onChargeComplete={handleChargeComplete}
          />
        );
      case 3: case 4: case 5: {
        const stageConf = getStageConfig(currentStage);
        return (
          <TimerStageView
            stage={stageConf}
            stageNumber={currentStage}
            completedStages={completedStages}
            generatorState={state}
            stageStartedAt={stageStartedAt}
            onBegin={() => handleTimerBegin(stageConf.key)}
            onAdvance={() => handleAdvance(currentStage + 1, stageConf.key)}
            isLast={currentStage === 5}
            lightAmount={generatorConfig.completionLight}
          />
        );
      }
      default: return null;
    }
  };

  return (
    <>
      <Head><title>Build Area — Light Generator</title></Head>

      <UniverseBackdrop>
        <GeneratorModel isComplete={isComplete} />
      </UniverseBackdrop>

      <div className="forge-build__overlay">
        {renderStage()}
      </div>

      {DEV_MODE && state !== 'inactive' && (
        <div className="forge-build__dev-bar">
          <button className="forge-build__dev-btn forge-build__dev-btn--skip" onClick={devSkipStage}>
            ⚡ Skip stage {currentStage}
          </button>
          <button className="forge-build__dev-btn forge-build__dev-btn--reset" onClick={devReset}>
            ↺ Reset
          </button>
        </div>
      )}

      {toast !== null && <LightToast amount={toast} />}
    </>
  );
};

BuildArea.layout = page => <MainLayout>{page}</MainLayout>;
export default BuildArea;