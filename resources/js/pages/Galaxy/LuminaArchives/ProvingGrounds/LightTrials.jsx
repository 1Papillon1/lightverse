// resources/js/Pages/galaxy/lumina-archives/proving-grounds/LightTrials.jsx
// Route: /galaxy/lumina-archives/proving-grounds/light-trials
// Props from Inertia: { user, light, completedTrials: string[] }

import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import MainLayout from '@/MainLayout';
import UniverseBackdrop from '@/components/visuals/UniverseBackdrop';
import LightToast from '@/components/ui/LightToast';
import { trialsConfig } from '@/config/trials';
import arrowBackIcon from '@/assets/icons/arrow_back.svg';
import arrowForwardIcon from '@/assets/icons/arrow_forward.svg';

// ─── Trial Selector (entry screen) ───────────────────────────────────────────

const TrialSelector = ({ completedTrials, onSelect }) => {
  const topics = Object.entries(trialsConfig);

  return (
    <section className="lumina-codex lumina-codex--teal">
      <div className="lumina-codex__projector lumina-codex__projector--teal" />

      <div
        className="lumina-codex__card lumina-codex__card--teal lumina-codex__card--selector"
        style={{ transform: 'translate(-50%, -50%)', opacity: 1, pointerEvents: 'auto' }}
      >
        <div className="lumina-codex__core">
          <div className="lumina-codex__icon">⚡</div>
          <h3>Light Trials</h3>
          <p className="lumina-codex__note" style={{ marginBottom: '1.5rem' }}>
            Prove your understanding. Pass a trial to earn Active Light.
            Each trial is drawn from the Light Codex nodes.
          </p>

          <div className="proving-trials__list">
            {topics.map(([key, trial]) => {
              const done = completedTrials?.includes(key);
              return (
                <button
                  key={key}
                  className={`proving-trials__item ${done ? 'proving-trials__item--done' : ''}`}
                  onClick={() => !done && onSelect(key)}
                  disabled={done}
                >
                  <span className="proving-trials__item-icon">{done ? '✦' : '◈'}</span>
                  <span className="proving-trials__item-label">{trial.topic}</span>
                  <span className="proving-trials__item-reward">
                    {done ? 'Completed' : `+${trial.light} Light`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── Active Trial (quiz screen) ───────────────────────────────────────────────

const ActiveTrial = ({ trialKey, onComplete, onBack }) => {
  const trial = trialsConfig[trialKey];
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [phase, setPhase] = useState('question'); // question | result

  const question = trial.questions[current];
  const isLast = current === trial.questions.length - 1;

  const handleSelect = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
  };

  const handleNext = () => {
    const newAnswers = [...answers, selected];

    if (isLast) {
      const correct = newAnswers.filter(
        (ans, i) => ans === trial.questions[i].correct
      ).length;
      onComplete(trialKey, correct, trial.passMark, trial.light, newAnswers);
    } else {
      setAnswers(newAnswers);
      setSelected(null);
      setCurrent(c => c + 1);
    }
  };

  const optionClass = (idx) => {
    let base = 'proving-trials__option';
    if (selected === null) return base;
    if (idx === question.correct) return `${base} proving-trials__option--correct`;
    if (idx === selected && selected !== question.correct) return `${base} proving-trials__option--wrong`;
    return `${base} proving-trials__option--dimmed`;
  };

  return (
    <section className="lumina-codex lumina-codex--teal">
      <div className="lumina-codex__projector lumina-codex__projector--teal" />

      <div
        className="lumina-codex__card lumina-codex__card--teal"
        style={{ transform: 'translate(-50%, -50%)', opacity: 1, pointerEvents: 'auto' }}
      >
        <div className="lumina-codex__core">
          <div className="proving-trials__progress">
            <span className="proving-trials__topic">{trial.topic}</span>
            <span className="proving-trials__counter">
              {current + 1} / {trial.questions.length}
            </span>
          </div>

          <div className="proving-trials__bar">
            <div
              className="proving-trials__bar-fill"
              style={{ width: `${((current + 1) / trial.questions.length) * 100}%` }}
            />
          </div>

          <p className="proving-trials__question">{question.text}</p>

          <div className="proving-trials__options">
            {question.options.map((opt, idx) => (
              <button
                key={idx}
                className={optionClass(idx)}
                onClick={() => handleSelect(idx)}
              >
                <span className="proving-trials__opt-marker">
                  {String.fromCharCode(65 + idx)}
                </span>
                {opt}
              </button>
            ))}
          </div>

          <div className="lumina-codex__footer" style={{ marginTop: '1.25rem' }}>
            <button
              className="section__button section__button--back"
              onClick={onBack}
            >
              <img src={arrowBackIcon} className="section__icon" alt="Back" />
            </button>
            <button
              className="proving-trials__next"
              disabled={selected === null}
              onClick={handleNext}
            >
              {isLast ? 'Submit' : 'Next'}
              <img src={arrowForwardIcon} className="section__icon" alt="Next" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── Result Screen ─────────────────────────────────────────────────────────

const TrialResult = ({ trialKey, correct, total, passed, lightAwarded, onRetry, onBack }) => {
  const trial = trialsConfig[trialKey];

  return (
    <section className="lumina-codex lumina-codex--teal">
      <div className="lumina-codex__projector lumina-codex__projector--teal" />

      <div
        className="lumina-codex__card lumina-codex__card--teal"
        style={{ transform: 'translate(-50%, -50%)', opacity: 1, pointerEvents: 'auto' }}
      >
        <div className="lumina-codex__core">
          <div className="lumina-codex__icon">{passed ? '✦' : '◈'}</div>
          <h3>{passed ? 'Trial Complete' : 'Not Yet'}</h3>

          <div className="proving-trials__score">
            <span className="proving-trials__score-num">{correct}</span>
            <span className="proving-trials__score-sep">/</span>
            <span className="proving-trials__score-total">{total}</span>
          </div>

          {passed ? (
            <>
              <p>
                You passed the <strong>{trial.topic}</strong> trial.
                Active Light has been added to your signature.
              </p>
              <div className="proving-trials__reward-badge">
                +{lightAwarded} Active Light
              </div>
            </>
          ) : (
            <p>
              You need at least {trial.passMark} correct to pass.
              Return to the <strong>{trial.topic}</strong> node and review,
              then try again.
            </p>
          )}

          <div className="lumina-codex__footer" style={{ marginTop: '1.5rem', justifyContent: 'center', gap: '0.75rem' }}>
            {!passed && (
              <button className="proving-trials__next" onClick={onRetry}>
                Retry
              </button>
            )}
            <button className="proving-trials__next proving-trials__next--ghost" onClick={onBack}>
              All Trials
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────

const LightTrials = ({ completedTrials = [] }) => {
  const [view, setView] = useState('selector'); // selector | trial | result
  const [activeTrial, setActiveTrial] = useState(null);
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState(null);
  const [localCompleted, setLocalCompleted] = useState(completedTrials);

  const showToast = (amount) => {
    setToast(amount);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSelect = (key) => {
    setActiveTrial(key);
    setView('trial');
  };

  const handleComplete = (key, correct, passMark, lightAmount, answers) => {
    const passed = correct >= passMark;
    setResult({ key, correct, total: trialsConfig[key].questions.length, passed, lightAmount });
    setView('result');

    if (passed) {
      // Fire Inertia POST to award Light
      router.post('/api/light/award', {
        source: `trial:${key}`,
        type: 'active',
        amount: lightAmount,
      }, { preserveState: true, preserveScroll: true });

      setLocalCompleted(prev => [...prev, key]);
      showToast(lightAmount);
    }
  };

  const handleRetry = () => {
    setView('trial');
    setResult(null);
  };

  const handleBack = () => {
    setView('selector');
    setActiveTrial(null);
    setResult(null);
  };

  return (
    <>
      <Head>
        <title>Light Trials — Proving Grounds</title>
      </Head>
      <UniverseBackdrop />

      {view === 'selector' && (
        <TrialSelector
          completedTrials={localCompleted}
          onSelect={handleSelect}
        />
      )}

      {view === 'trial' && activeTrial && (
        <ActiveTrial
          trialKey={activeTrial}
          onComplete={handleComplete}
          onBack={handleBack}
        />
      )}

      {view === 'result' && result && (
        <TrialResult
          trialKey={result.key}
          correct={result.correct}
          total={result.total}
          passed={result.passed}
          lightAwarded={result.lightAmount}
          onRetry={handleRetry}
          onBack={handleBack}
        />
      )}

      {toast !== null && <LightToast amount={toast} />}
    </>
  );
};

LightTrials.layout = page => <MainLayout>{page}</MainLayout>;
export default LightTrials;