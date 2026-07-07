// resources/js/pages/Galaxy/LuminaArchives/LightCodex/Economy.jsx
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

const Economy = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = [
    {
      title: "Light Economy",
      icon: "💰",
      content: "A reputation-based system where value is created through contribution, not speculation. Light cannot be bought, sold, or transferred - only earned."
    },
    {
      title: "Non-Transferable",
      icon: "🔒",
      content: "Light is permanently tied to your identity. It cannot be sold, gifted, or transferred to others. Your Light is YOUR achievement."
    },
    {
      title: "Meritocratic",
      icon: "⚖️",
      content: "Your Light reflects your actual contributions, not your wealth or connections. Everyone starts equal."
    },
    {
      title: "Tier: Spark",
      icon: "✨",
      tierRange: "0-100 Light",
      content: "New explorers beginning their journey. Access to Identity Nexus and Lumina Archives."
    },
    {
      title: "Tier: Gleam",
      icon: "💫",
      tierRange: "101-500 Light",
      content: "Active contributors with growing influence. Unlocks contribution tools and community forums."
    },
    {
      title: "Tier: Radiance",
      icon: "🌟",
      tierRange: "501-2,000 Light",
      content: "Established members with significant impact. Grants voting rights and mentor status."
    },
    {
      title: "Tier: Luminance",
      icon: "💎",
      tierRange: "2,001-10,000 Light",
      content: "Leaders and major contributors. Access to premium galaxies and leadership roles."
    },
    {
      title: "Tier: Beacon",
      icon: "🔆",
      tierRange: "10,001+ Light",
      content: "Legendary figures who shaped the verse. Exclusive features, legacy creation, and governance participation."
    },
    {
      title: "Anti-Gaming",
      icon: "🛡️",
      content: "The system prevents exploitation through diminishing returns, quality assessment, and manual review. Quality over quantity always wins."
    },
    {
      title: "Sustainable Growth",
      icon: "📈",
      content: "Unlike crypto inflation, Light rewards decrease as the verse matures. Every Light point represents real value added to the ecosystem."
    }
  ];

  return (
    <>
      <Head>
        <title>Light Economy - Lightverse</title>
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
              {slide.tierRange && (
                <div className="lumina-codex__tier-range">{slide.tierRange}</div>
              )}
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

Economy.layout = page => <MainLayout>{page}</MainLayout>;
export default Economy;