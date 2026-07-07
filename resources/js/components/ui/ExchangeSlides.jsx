// resources/js/components/ui/ExchangeSlides.jsx
// Reusable slide component for all Exchange galaxy nodes.
// Usage: <ExchangeSlides slides={slides} color="#00ffcc" />

import React, { useState } from 'react';
import arrowBackIcon    from '@/assets/icons/arrow_back.svg';
import arrowForwardIcon from '@/assets/icons/arrow_forward.svg';

const slideStyle = (index, activeIndex) => {
  const offset = (index - activeIndex) * 340;
  return {
    transform: `translate(-50%, -50%) translateX(${offset}px)`,
    opacity:       index === activeIndex ? 1 : 0,
    pointerEvents: index === activeIndex ? 'auto' : 'none',
  };
};

const ExchangeSlides = ({ slides = [], color = '#00ffcc' }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="exchange-slides" style={{ '--exchange-color': color }}>

      {/* Projector beam */}
      <div className="exchange-slides__projector" />

      {/* Cards */}
      {slides.map((slide, i) => (
        <div
          key={i}
          className="exchange-slides__card"
          style={slideStyle(i, activeIndex)}
        >
          <div className="exchange-slides__core">

            {/* Icon */}
            <div className="exchange-slides__icon">{slide.icon}</div>

            {/* Title */}
            <h3 className="exchange-slides__title">{slide.title}</h3>

            {/* Badge (optional) */}
            {slide.badge && (
              <div className="exchange-slides__badge">{slide.badge}</div>
            )}

            {/* Content */}
            <p className="exchange-slides__content">{slide.content}</p>

            {/* Examples list (optional) */}
            {slide.examples && (
              <ul className="exchange-slides__examples">
                {slide.examples.map((ex, idx) => (
                  <li key={idx}>{ex}</li>
                ))}
              </ul>
            )}

            {/* Note */}
            {slide.note && (
              <p className="exchange-slides__note">{slide.note}</p>
            )}

            {/* Footer indicator */}
            <div className="exchange-slides__footer">
              <span className="exchange-slides__indicator">
                {i + 1} / {slides.length}
              </span>
            </div>

          </div>
        </div>
      ))}

      {/* Navigation controls */}
      <div className="exchange-slides__controls">
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
  );
};

export default ExchangeSlides;
