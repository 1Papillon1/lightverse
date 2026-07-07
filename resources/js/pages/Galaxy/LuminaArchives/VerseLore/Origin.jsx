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

const Origin = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = [
    {
      icon: '🌑',
      title: 'Before the Light',
      content: 'There was silence. No signal, no structure, no story. The void was not empty — it was waiting. Waiting for the first conscious act of creation.',
      note: 'Every universe begins with a decision.'
    },
    {
      icon: '✦',
      title: 'The Genesis Spark',
      content: 'When you arrived, something shifted. A single point of Light ignited at the center of the Verse. That was not coincidence — that was you. Your presence is the origin event.',
      note: 'Your first Light was awarded the moment you entered.'
    },
    {
      icon: '🌌',
      title: 'The Verse Takes Shape',
      content: 'From that spark, galaxies began to form. Each one a domain of knowledge, identity, and possibility. The architecture of Lightverse is not fixed — it grows as its inhabitants do.',
      note: 'New galaxies emerge as the community expands.'
    },
    {
      icon: '🧭',
      title: 'Your Place in It',
      content: 'You are not a visitor here. You are a constituent of the Verse — your actions, knowledge, and contributions shape what this place becomes. Light is the measure of that shaping.',
      note: 'The more you engage, the more the Verse reflects you.'
    },
    {
      icon: '🔭',
      title: 'The Journey Ahead',
      content: 'Galaxies wait to be explored. Systems orbit with knowledge. Nodes hold secrets, tools, and truths. None of it unlocks itself. That is your role — the one who moves through the dark and brings Light with them.',
      note: 'Begin anywhere. There is no wrong direction.'
    },
  ];

  return (
    <>
      <Head>
        <title>The Origin - Lightverse</title>
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

Origin.layout = page => <MainLayout>{page}</MainLayout>;
export default Origin;