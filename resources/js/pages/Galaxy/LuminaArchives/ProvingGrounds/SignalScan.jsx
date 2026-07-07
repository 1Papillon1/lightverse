// resources/js/Pages/galaxy/lumina-archives/proving-grounds/SignalScan.jsx
// Route: /galaxy/lumina-archives/proving-grounds/signal-scan
// Props from Inertia: { user, light }
// Daily reset uses localStorage — no backend needed in v0.1

import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import MainLayout from '@/MainLayout';
import UniverseBackdrop from '@/components/visuals/UniverseBackdrop';
import LightToast from '@/components/ui/LightToast';
import { signalScanQuestions } from '@/config/trials';
import arrowForwardIcon from '@/assets/icons/arrow_forward.svg';

const STORAGE_KEY = 'signal_scan_state';
const QUESTIONS_PER_DAY = 3;
const LIGHT_PER_CORRECT = 5; // each correct = 5 Active Light, max 15/day

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getTodayKey = () => new Date().toISOString().slice(0, 10); // "2026-03-25"

const pickDailyQuestions = (dateKey) => {
  // Seed selection from date so same 3 questions show all day
  const seed = dateKey.replace(/-/g, '');
  const seedNum = parseInt(seed, 10);
  const pool = [...signalScanQuestions];
  const picked = [];
  let s = seedNum;
  while (picked.length < QUESTIONS_PER_DAY && pool.length > 0) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const idx = Math.abs(s) % pool.length;
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked;
};

const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const saveState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
};

// ─── Countdown to next reset ──────────────────────────────────────────────────

const useCountdown = () => {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(now.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const diff = tomorrow - now;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return remaining;
};

// ─── Completed screen ─────────────────────────────────────────────────────────

const ScanComplete = ({ correct, total, lightEarned }) => {
  const countdown = useCountdown();

  return (
    <section className="lumina-codex lumina-codex--teal">
      <div className="lumina-codex__projector lumina-codex__projector--teal" />
      <div
        className="lumina-codex__card lumina-codex__card--teal"
        style={{ transform: 'translate(-50%, -50%)', opacity: 1, pointerEvents: 'auto' }}
      >
        <div className="lumina-codex__core">
          <div className="lumina-codex__icon">📡</div>
          <h3>Signal received</h3>

          <div className="proving-trials__score">
            <span className="proving-trials__score-num">{correct}</span>
            <span className="proving-trials__score-sep">/</span>
            <span className="proving-trials__score-total">{total}</span>
          </div>

          {lightEarned > 0 && (
            <div className="proving-trials__reward-badge" style={{ marginBottom: '1rem' }}>
              +{lightEarned} Active Light
            </div>
          )}

          <p className="lumina-codex__note">
            The signal refreshes in
          </p>
          <div className="signal-scan__countdown">{countdown}</div>

          <p style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: '0.5rem' }}>
            Return tomorrow for a new transmission.
          </p>
        </div>
      </div>
    </section>
  );
};

// ─── Already done today ───────────────────────────────────────────────────────

const AlreadyScanned = ({ correct, total, lightEarned }) => {
  const countdown = useCountdown();

  return (
    <section className="lumina-codex lumina-codex--teal">
      <div className="lumina-codex__projector lumina-codex__projector--teal" />
      <div
        className="lumina-codex__card lumina-codex__card--teal"
        style={{ transform: 'translate(-50%, -50%)', opacity: 1, pointerEvents: 'auto' }}
      >
        <div className="lumina-codex__core">
          <div className="lumina-codex__icon">📡</div>
          <h3>Signal already logged</h3>
          <p>
            You completed today's scan — {correct}/{total} correct
            {lightEarned > 0 && `, earning +${lightEarned} Light`}.
          </p>
          <p className="lumina-codex__note">Next transmission in:</p>
          <div className="signal-scan__countdown">{countdown}</div>
        </div>
      </div>
    </section>
  );
};

// ─── Active scan ──────────────────────────────────────────────────────────────

const ActiveScan = ({ questions, onComplete }) => {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);

  const question = questions[current];
  const isLast = current === questions.length - 1;

  const handleSelect = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
  };

  const handleNext = () => {
    const newAnswers = [...answers, selected];
    if (isLast) {
      onComplete(newAnswers, questions);
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
            <span className="proving-trials__topic">Signal Scan</span>
            <span className="proving-trials__counter">
              {current + 1} / {questions.length}
            </span>
          </div>

          <div className="proving-trials__bar">
            <div
              className="proving-trials__bar-fill"
              style={{ width: `${((current + 1) / questions.length) * 100}%` }}
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

          <div className="lumina-codex__footer" style={{ marginTop: '1.25rem', justifyContent: 'flex-end' }}>
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

// ─── Intro screen ─────────────────────────────────────────────────────────────

const ScanIntro = ({ onBegin }) => (
  <section className="lumina-codex lumina-codex--teal">
    <div className="lumina-codex__projector lumina-codex__projector--teal" />
    <div
      className="lumina-codex__card lumina-codex__card--teal"
      style={{ transform: 'translate(-50%, -50%)', opacity: 1, pointerEvents: 'auto' }}
    >
      <div className="lumina-codex__core">
        <div className="lumina-codex__icon">📡</div>
        <h3>Signal Scan</h3>
        <p>
          Three questions. Once per day. Each correct answer earns{' '}
          <strong>+{LIGHT_PER_CORRECT} Active Light</strong>.
        </p>
        <p className="lumina-codex__note">
          Questions rotate daily. Stay consistent to maintain your Active Light.
        </p>
        <div className="lumina-codex__footer" style={{ marginTop: '1.5rem', justifyContent: 'center' }}>
          <button className="proving-trials__next" onClick={onBegin}>
            Begin scan
            <img src={arrowForwardIcon} className="section__icon" alt="Begin" />
          </button>
        </div>
      </div>
    </div>
  </section>
);

// ─── Main Page ─────────────────────────────────────────────────────────────

const SignalScan = () => {
  const todayKey = getTodayKey();
  const [view, setView] = useState('loading'); // loading | intro | scan | complete | done
  const [questions, setQuestions] = useState([]);
  const [scanResult, setScanResult] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const state = loadState();
    const dailyQs = pickDailyQuestions(todayKey);
    setQuestions(dailyQs);

    if (state && state.dateKey === todayKey) {
      setScanResult({ correct: state.correct, total: state.total, lightEarned: state.lightEarned });
      setView('done');
    } else {
      setView('intro');
    }
  }, []);

  const showToast = (amount) => {
    setToast(amount);
    setTimeout(() => setToast(null), 3000);
  };

  const handleComplete = (answers, qs) => {
    const correct = answers.filter((ans, i) => ans === qs[i].correct).length;
    const lightEarned = correct * LIGHT_PER_CORRECT;

    saveState({ dateKey: todayKey, correct, total: qs.length, lightEarned });
    setScanResult({ correct, total: qs.length, lightEarned });
    setView('complete');

    if (lightEarned > 0) {
      router.post('/api/light/award', {
        source: 'signal_scan',
        type: 'active',
        amount: lightEarned,
      }, { preserveState: true, preserveScroll: true });

      showToast(lightEarned);
    }
  };

  return (
    <>
      <Head>
        <title>Signal Scan — Proving Grounds</title>
      </Head>
      <UniverseBackdrop />

      {view === 'loading' && null}
      {view === 'intro' && <ScanIntro onBegin={() => setView('scan')} />}
      {view === 'scan' && <ActiveScan questions={questions} onComplete={handleComplete} />}
      {view === 'complete' && (
        <ScanComplete
          correct={scanResult.correct}
          total={scanResult.total}
          lightEarned={scanResult.lightEarned}
        />
      )}
      {view === 'done' && (
        <AlreadyScanned
          correct={scanResult.correct}
          total={scanResult.total}
          lightEarned={scanResult.lightEarned}
        />
      )}

      {toast !== null && <LightToast amount={toast} />}
    </>
  );
};

SignalScan.layout = page => <MainLayout>{page}</MainLayout>;
export default SignalScan;