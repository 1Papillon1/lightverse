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

const Guide = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = [
    {
      icon: '📡',
      title: 'Transmission: Cosmic Cartographer',
      content: 'You are receiving this from somewhere between the Lumina Archives and the edge of the known Verse. Consider this your orientation — not a manual, but a map drawn in words.',
      note: 'The Verse rewards those who explore it.'
    },
    {
      icon: '🗺️',
      title: 'The Structure of the Verse',
      content: 'Lightverse is organized in three layers. The Universe holds all galaxies. Each galaxy contains star systems. Each star system orbits with nodes — these are the places where things actually happen.',
      note: 'Universe → Galaxy → System → Node'
    },
    {
      icon: '✦',
      title: 'How Light Works',
      content: 'Light is earned by doing — visiting, reading, contributing, achieving. It accumulates in three forms: Core Light is permanent, Stable Light is earned through sustained action, Active Light is temporary and must be renewed.',
      note: 'Check your Light balance in the top navigation.'
    },
    {
      icon: '🏆',
      title: 'Achievements',
      content: 'Every meaningful action in the Verse unlocks an achievement. Achievements are not just records — they are the primary source of Active Light. The more you explore, the more the Verse rewards you.',
      note: 'View your achievements via the account menu top right.'
    },
    {
      icon: '🔭',
      title: 'How to Navigate',
      content: 'The breadcrumb trail at the top shows exactly where you are. Click any level to return to it. The return buttons at the bottom right bring you back to the system or galaxy view from a node.',
      note: 'You can never get lost — the trail always leads back.'
    },
    {
      icon: '🌱',
      title: 'Where to Begin',
      content: 'If you are new: read the Light Codex, explore your Identity Nebula, unlock your first achievements. If you are returning: check what has changed, contribute to the Archives, grow your Luminance.',
      note: 'There is always something new in the Verse.'
    },
  ];

  return (
    <>
      <Head>
        <title>Cosmic Guide - Lightverse</title>
      </Head>
      <UniverseBackdrop />

      <section className="lumina-codex">
        <div className="lumina-codex__projector" />

        {slides.map((slide, i) => (
          <div
            key={i}
            className="lumina-codex__card"
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

Guide.layout = page => <MainLayout>{page}</MainLayout>;
export default Guide;