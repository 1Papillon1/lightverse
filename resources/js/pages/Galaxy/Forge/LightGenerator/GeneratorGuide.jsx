// resources/js/Pages/Galaxy/Forge/LightGenerator/GeneratorGuide.jsx
// Route: /galaxy/forge/light-generator/generator-guide
// No Inertia props needed — static lore content

import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/MainLayout';
import UniverseBackdrop from '@/components/visuals/UniverseBackdrop';
import arrowBackIcon from '@/assets/icons/arrow_back.svg';
import arrowForwardIcon from '@/assets/icons/arrow_forward.svg';

const slideStyle = (index, activeIndex) => {
  const offset = (index - activeIndex) * 340;
  return {
    transform: `translate(-50%, -50%) translateX(${offset}px)`,
    opacity: index === activeIndex ? 1 : 0,
    pointerEvents: index === activeIndex ? 'auto' : 'none',
  };
};

const GeneratorGuide = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = [
    {
      icon: '⚙',
      title: 'The Light Generator',
      content: 'Deep within The Forge, certain structures can be assembled from nothing but patience and intention. The Light Generator is the first of these — a device that converts sustained effort into a concentrated burst of Active Light.',
      note: 'Completion awards 87 Active Light in a single moment.',
    },
    {
      icon: '🏗',
      title: 'Five Stages',
      content: 'Construction is divided into five stages. Each one must be completed in sequence. Some require only time. One requires something more direct — your energy, applied manually to the core.',
      note: 'Stages cannot be skipped. Each builds on the last.',
    },
    {
      icon: '📖',
      title: 'Stage 1 — Foundation',
      content: 'Before anything can be built, the schematics must be understood. Visit the Lumina Archives to retrieve the manual. Once read, the foundation timer begins — two hours of structural alignment.',
      note: 'The gate will open once you have visited the Archive node.',
    },
    {
      icon: '⚡',
      title: 'Stage 2 — Core Ignition',
      content: 'The generator core cannot be started by machine. It requires direct energy input. A charge meter will appear — fill it before it fades. Press the ignition key as fast as you can. You have thirty seconds.',
      note: 'On desktop: Spacebar. On mobile: the ignition button.',
    },
    {
      icon: '⏳',
      title: 'Stages 3, 4, 5',
      content: 'Calibration takes six hours. Resonance takes eight. Final Convergence takes four. Each stage completes on its own — return when the time has passed, and advance to the next. The generator does not wait indefinitely.',
      note: 'You must manually advance each stage when it completes.',
    },
    {
      icon: '✦',
      title: 'Completion',
      content: 'When all five stages are done, the generator is complete. The Light it has accumulated is released into your signature in a single transfer. It is Active Light — it will remain for thirty days before fading.',
      note: 'Stay active to maintain your Light. The Verse rewards those who return.',
    },
  ];

  return (
    <>
      <Head>
        <title>Forge Manual — Light Generator</title>
      </Head>
      <UniverseBackdrop />

      <section className="lumina-codex lumina-codex--forge">
        <div className="lumina-codex__projector lumina-codex__projector--forge" />

        {slides.map((slide, i) => (
          <div
            key={i}
            className="lumina-codex__card lumina-codex__card--forge"
            style={slideStyle(i, activeIndex)}
          >
            <div className="lumina-codex__core">
              <div className="lumina-codex__icon">{slide.icon}</div>
              <h3>{slide.title}</h3>
              <p>{slide.content}</p>
              {slide.note && (
                <p className="lumina-codex__note">{slide.note}</p>
              )}
              <div className="lumina-codex__footer">
                <span className="slide-indicator">{i + 1} / {slides.length}</span>
              </div>
            </div>
          </div>
        ))}

        <div className="lumina-codex__controls">
          <button
            className="section__button section__button--back"
            disabled={activeIndex === 0}
            onClick={() => setActiveIndex(i => i - 1)}
          >
            <img src={arrowBackIcon} className="section__icon" alt="Previous" />
          </button>
          <button
            className="section__button section__button--forward"
            disabled={activeIndex === slides.length - 1}
            onClick={() => setActiveIndex(i => i + 1)}
          >
            <img src={arrowForwardIcon} className="section__icon" alt="Next" />
          </button>
        </div>
      </section>
    </>
  );
};

GeneratorGuide.layout = page => <MainLayout>{page}</MainLayout>;
export default GeneratorGuide;