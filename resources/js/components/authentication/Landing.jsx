import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import UniverseScene from '@/components/visuals/core/UniverseScene';

const Landing = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Welcome to Lightverse",
      description: "A cosmic digital ecosystem where your actions create universes",
      icon: "🌌"
    },
    {
      title: "Navigate Galaxies",
      description: "Each galaxy represents a domain - crypto tools, identity systems, and more",
      icon: "🪐"
    },
    {
      title: "Earn Light",
      description: "Complete achievements and contribute to earn Light - the currency of creation",
      icon: "💡"
    },
    {
      title: "Build Universes",
      description: "Your Light creates value. Your achievements build legacy.",
      icon: "✨"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // ✅ Navigation handlers using router.visit()
  const handleRegister = (e) => {
    e.preventDefault();
    router.visit('/register', {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    router.visit('/login', {
      preserveState: true,
      preserveScroll: true,
    });
  };

  return (
    <>
      <Head>
        <title>Lightverse - Build Your Cosmic Universe</title>
        <meta 
          name="description" 
          content="Navigate galaxies of digital tools. Earn Light through achievements. Build your cosmic legacy in an immersive 3D platform." 
        />
      </Head>

      <div className="landing-page">
        {/* ✅ LOCKED UNIVERSE BACKGROUND */}
        <div className="universe-background">
          <UniverseScene locked={true} />
          <div className="universe-overlay" />
        </div>

        {/* ✅ CONTENT SLIDER */}
        <div className="landing-content">
          
          {/* Logo */}
          <div className="landing-logo">
            <h1>LIGHTVERSE</h1>
            <p className="tagline">Where Light Becomes Reality</p>
          </div>

          {/* Slider */}
          <div className="landing-slider">
            <button 
              className="slider-nav slider-nav--prev" 
              onClick={prevSlide}
              aria-label="Previous slide"
            >
              <i className="fas fa-chevron-left"></i>
            </button>

            <div className="slider-content">
              <div className="slide-icon">{slides[currentSlide].icon}</div>
              <h2 className="slide-title">{slides[currentSlide].title}</h2>
              <p className="slide-description">{slides[currentSlide].description}</p>
              
              {/* Dots indicator */}
              <div className="slider-dots">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    className={`dot ${index === currentSlide ? 'active' : ''}`}
                    onClick={() => setCurrentSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <button 
              className="slider-nav slider-nav--next" 
              onClick={nextSlide}
              aria-label="Next slide"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>

          {/* ✅ CTA BUTTONS - Using router.visit() like your Login component */}
          <div className="landing-cta">
            <button 
              className="btn btn--primary" 
              onClick={handleRegister}
            >
              <i className="fas fa-rocket"></i>
              Start Your Journey
            </button>
            <button 
              className="btn btn--secondary" 
              onClick={handleLogin}
            >
              <i className="fas fa-sign-in-alt"></i>
              Sign In
            </button>
          </div>

          {/* Scroll indicator (optional) */}
          <div className="scroll-indicator">
            <i className="fas fa-chevron-down"></i>
          </div>
        </div>
      </div>
    </>
  );
};

export default Landing;