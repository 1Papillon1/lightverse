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

const Galaxies = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = [
    {
      icon: '🌌',
      title: 'What is a Galaxy?',
      content: 'Galaxies are the great domains of Lightverse. Each one governs a distinct aspect of existence here — knowledge, identity, creation, exchange. They are not locations so much as orientations.',
      note: 'You can enter any galaxy from the Universe view.'
    },
    {
      icon: '📚',
      title: 'Lumina Archives',
      badge: 'Active',
      content: 'The galaxy of knowledge. Here you find the codices, lore, and learning paths that illuminate what Lightverse is and how to move through it. If you seek understanding, begin here.',
      note: 'You are inside Lumina Archives right now.'
    },
    {
      icon: '🪐',
      title: 'Identity Nebula',
      badge: 'Active',
      content: 'The galaxy of self. Your Light signature, your achievements, your reputation — all reside here. As you grow, this galaxy reflects who you are becoming within the Verse.',
      note: 'Visit to see your Light score and milestones.'
    },
    {
      icon: '🔮',
      title: 'Coming: The Forge',
      badge: 'Soon',
      content: 'A galaxy of creation. Where raw Light is shaped into artifacts, contributions, and structures that others can use. The Forge will open when the Verse reaches critical mass.',
      note: 'Planned for a future expansion.'
    },
    {
      icon: '⚡',
      title: 'Coming: The Exchange',
      badge: 'Soon',
      content: 'A galaxy of flow. Light moves between inhabitants, systems trade value, and the economy of the Verse becomes visible. The Exchange emerges when enough Light exists to circulate.',
      note: 'Planned for a future expansion.'
    },
    {
      icon: '🧭',
      title: 'Navigating Between Galaxies',
      content: 'From anywhere in the Verse, the breadcrumb trail at the top returns you to the Universe view. From there, galaxies are visible as gravitational clusters. Click any to enter.',
      note: 'The "Return to Galactic View" button also works from system and node levels.'
    },
  ];

  return (
    <>
      <Head>
        <title>The Galaxies - Lightverse</title>
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
              {slide.badge && (
                <div className={`lumina-codex__badge lumina-codex__badge--${slide.badge === 'Soon' ? 'soon' : 'active'}`}>
                  {slide.badge}
                </div>
              )}
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

Galaxies.layout = page => <MainLayout>{page}</MainLayout>;
export default Galaxies;