// resources/js/Pages/Landing.jsx
import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import UniverseScene from '@/components/visuals/core/UniverseScene';
import LandingIntro from '@/components/visuals/LandingIntro';

const Landing = () => {
  const [introComplete, setIntroComplete] = useState(false);

  return (
    <>
      <Head>
        {/* PRIMARY META */}
        <title>Lightverse — Where Reputation Becomes Light</title>
        <meta name="title"       content="Lightverse — Where Reputation Becomes Light" />
        <meta name="description" content="A 3D universe where your identity, knowledge, and contributions earn Light. Not bought. Not sold. Only earned." />
        <meta name="keywords"    content="web3, reputation platform, light economy, achievements, identity, 3D universe, contribution economy, blockchain" />
        <meta name="author"      content="Lightverse" />
        <meta name="robots"      content="index, follow" />

        {/* OPEN GRAPH */}
        <meta property="og:type"        content="website" />
        <meta property="og:url"         content="https://lightverse.cloud/" />
        <meta property="og:title"       content="Lightverse — Where Reputation Becomes Light" />
        <meta property="og:description" content="A 3D universe where your reputation is earned — never bought, never sold. Enter the Verse." />
        <meta property="og:image"       content="https://lightverse.cloud/og-image.png" />
        <meta property="og:image:width"  content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name"   content="Lightverse" />
        <meta property="og:locale"      content="en_US" />

        {/* TWITTER */}
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:url"         content="https://lightverse.cloud/" />
        <meta name="twitter:title"       content="Lightverse — Where Reputation Becomes Light" />
        <meta name="twitter:description" content="A 3D universe where your reputation is earned — never bought, never sold." />
        <meta name="twitter:image"       content="https://lightverse.cloud/twitter-card.png" />
        <meta name="twitter:creator"     content="@lightverse" />
        <meta name="twitter:site"        content="@lightverse" />

        {/* MISC */}
        <meta name="theme-color"                    content="#00ffff" />
        <meta name="mobile-web-app-capable"         content="yes" />
        <meta name="mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-title"           content="Lightverse" />

        {/* STRUCTURED DATA */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Lightverse",
            "url": "https://lightverse.cloud",
            "description": "A 3D universe where reputation is earned — never bought, never sold.",
          })}
        </script>
      </Head>

      <main className="landing-page" role="main">

        {/* Universe always renders behind — locked on landing */}
        <div className="universe-background" aria-hidden="true" style={{ pointerEvents: 'none' }}>
          <UniverseScene locked={true} />
          <div className="universe-overlay" />
        </div>

        {/* Genesis intro — plays once */}
        {!introComplete && (
          <LandingIntro onComplete={() => setIntroComplete(true)} />
        )}

        {/* Main content — fades in after intro completes */}
        <article className={`landing-content ${introComplete ? 'landing-content--visible' : 'landing-content--hidden'}`}>

          {/* Logo / headline */}
          <header className="landing-logo">
            <h1>LIGHTVERSE</h1>
            <p className="tagline">Where Reputation Becomes Light</p>
          </header>

          {/* 3 core truths — replaces the carousel */}
          <section className="landing-pillars" aria-label="Core values">
            <div className="landing-pillar">
              <span className="landing-pillar__icon">🌌</span>
              <span className="landing-pillar__text">3D universe. Navigate galaxies of real, verified knowledge.</span>
            </div>
            <div className="landing-pillar">
              <span className="landing-pillar__icon">⚡</span>
              <span className="landing-pillar__text">Reputation earned — never bought, never sold. Only yours.</span>
            </div>
            <div className="landing-pillar">
              <span className="landing-pillar__icon">📡</span>
              <span className="landing-pillar__text">News verified across independent sources. No single truth.</span>
            </div>
          </section>

          {/* CTA */}
          <nav className="landing-cta" aria-label="Enter the Verse">
            <Link
              href="/register"
              className="btn btn--primary"
              aria-label="Register and forge your identity"
            >
              <i className="fas fa-rocket" aria-hidden="true" />
              Forge your Identity
            </Link>
            <Link
              href="/login"
              className="btn btn--secondary"
              aria-label="Login to restore your light"
            >
              <i className="fas fa-bolt" aria-hidden="true" />
              Restore your Light
            </Link>
          </nav>

        </article>
      </main>
    </>
  );
};

export default Landing;