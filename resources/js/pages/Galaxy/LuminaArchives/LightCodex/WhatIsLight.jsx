// resources/js/pages/Galaxy/LuminaArchives/LightCodex/WhatIsLight.jsx
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

const WhatIsLight = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = [
    {
      title: "What is Light?",
      icon: "💡",
      content: "Light is the fundamental currency of Lightverse - but it's not just a token or coin. Light represents your contribution, knowledge, and reputation within the cosmic ecosystem."
    },
    {
      title: "Contribution",
      icon: "🎯",
      content: "Every action you take that adds value to the Lightverse earns you Light. From completing achievements to sharing knowledge, your contributions matter."
    },
    {
      title: "Knowledge",
      icon: "🧠",
      content: "Learning, teaching, and sharing knowledge within the archives generates Light. The more you help others learn, the brighter you shine."
    },
    {
      title: "Reputation",
      icon: "⭐",
      content: "Your total Light accumulated becomes your Luminance Score - your cosmic reputation. It unlocks new galaxies, features, and opportunities."
    },
    {
      title: "Cannot Be Bought",
      icon: "🚫",
      content: "Light can only be earned through meaningful actions. There's no shortcut - your worth is determined by what you contribute, not what you spend."
    },
    {
      title: "Builds Legacy",
      icon: "✨",
      content: "Every point of Light you earn is a permanent record of your positive impact on the verse. Your legacy grows with every contribution."
    }
  ];

  return (
    <>
      <Head>
        <title>What is Light? - Lightverse</title>
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

WhatIsLight.layout = page => <MainLayout>{page}</MainLayout>;
export default WhatIsLight;