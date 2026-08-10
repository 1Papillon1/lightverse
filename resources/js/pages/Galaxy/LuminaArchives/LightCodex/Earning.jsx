// resources/js/pages/Galaxy/LuminaArchives/LightCodex/Earning.jsx
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

const Earning = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = [
    {
      title: "Complete Achievements",
      icon: "🏆",
      lightValue: "5-100 Light",
      content: "Every achievement you unlock rewards you with Light. From simple exploration milestones to complex challenges.",
      examples: [
        "First Steps: Create profile → 10 Light",
        "Explorer: Visit all galaxies → 25 Light",
        "Knowledge Seeker: Read 10 guides → 50 Light"
      ]
    },
    {
      title: "Explore the Verse",
      icon: "🌌",
      lightValue: "2-10 Light",
      content: "Navigate through galaxies, star systems, and nodes. Each new location you discover rewards you with exploration Light.",
      examples: [
        "First Galaxy Visit → 5 Light",
        "System Discovery → 3 Light",
        "Node Exploration → 2 Light"
      ]
    },
    /* {
      title: "Share Knowledge",
      icon: "📚",
      lightValue: "10-50 Light",
      content: "Contribute guides, tutorials, or insights to the Lumina Archives. Quality contributions are rewarded generously.",
      examples: [
        "Write a Guide → 20-50 Light",
        "Create Tutorial → 30-75 Light",
        "Share Insights → 10-25 Light"
      ]
    }, */
    {
      title: "Daily Engagement",
      icon: "📅",
      lightValue: "1-5 Light/day",
      content: "Consistent presence in the Lightverse is rewarded. Log in daily, check updates, and stay connected.",
      examples: [
        "Daily Login → 1 Light",
        "Weekly Streak → 5 Light bonus",
        "Monthly Streak → 25 Light bonus"
      ]
    },
   /*  {
      title: "Help Others",
      icon: "🤝",
      lightValue: "5-20 Light",
      content: "Answer questions, provide support, and contribute to the community. Helping others grow earns you Light.",
      examples: [
        "Answer Question → 5 Light",
        "Helpful Comment → 2-10 Light",
        "Mentor New Users → 15-20 Light"
      ]
    }, */
   /*  {
      title: "Light Multipliers",
      icon: "✨",
      lightValue: "×1.5 - ×2.0",
      content: "Certain actions multiply your Light earnings. First-time bonuses, streaks, and quality contributions boost your rewards.",
      examples: [
        "First Time Bonus → ×1.5",
        "7-Day Streak → ×2.0",
        "Quality Bonus → ×1.25"
      ]
    } */
  ];

  return (
    <>
      <Head>
        <title>Earning Light - Lightverse</title>
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
              <div className="lumina-codex__badge">{slide.lightValue}</div>
              <p>{slide.content}</p>
              <ul className="lumina-codex__examples">
                {slide.examples.map((ex, idx) => (
                  <li key={idx}>{ex}</li>
                ))}
              </ul>
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

Earning.layout = page => <MainLayout>{page}</MainLayout>;
export default Earning;