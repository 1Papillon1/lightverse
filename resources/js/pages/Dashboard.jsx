// Dashboard.jsx
import React, { useContext, useEffect, useState, useRef } from "react";
import { observer } from "mobx-react-lite";
import { RootStoreContext } from "@/stores/RootStore";
import MainLayout from "@/MainLayout";
import { Head, usePage } from "@inertiajs/react";
import UniverseScene from "@/components/visuals/core/UniverseScene";
import BlockDetails from "../components/market/BlockDetails";

const Dashboard = observer(() => {
  const [activeScene, setActiveScene] = useState("market");
  const [mounted, setMounted] = useState(false);
  
  // ✅ Get props from Inertia (passed by DashboardController)
  const props = usePage().props;
  const { symbol, galaxy, system, node } = props;
  
  const rootStore = useContext(RootStoreContext);
  const store = useContext(RootStoreContext).marketStore;

  const periods = ["24h", "7d", "30d"];
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();
  const [showVerifiedMessage, setShowVerifiedMessage] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('verified') === '1') {
      setShowVerifiedMessage(true);
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(() => setShowVerifiedMessage(false), 5000);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (symbol) {
      store.setSearchQuery(symbol);
      store.setSelectedMarket(
        store.markets.find((m) => m.symbol.toUpperCase() === symbol.toUpperCase())
      );
    }
  }, [symbol, store]);

  // ✅ Show 3D universe when NOT on a node page
  const showUniverse = !symbol && !node;

  return (
    <section className="hero">
      <Head title="Dashboard">
        <meta name="keywords" content="blockchain, dashboard, assets, 3D universe, crypto, manage assets" />
        <meta name="description" content="Manage your blockchain assets in an immersive 3D universe." />
        <meta property="og:title" content="Dashboard - Blockchain Asset Manager" />
      </Head>

      {showVerifiedMessage && (
        <div className="message message--success">
          <svg className="message__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>

          <div className="message__content">
            <div className="message__title">Email successfully verified!</div>
            <div className="message__subtitle">Your account is now fully active.</div>
          </div>

          <button className="message__close" onClick={() => setShowVerifiedMessage(false)}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="hero__container">
        {/* ✅ SHOW 3D UNIVERSE (universe/galaxy/system views) */}
        {showUniverse && mounted && (
          <UniverseScene onSceneSelect={(sceneId) => setActiveScene(sceneId)} />
        )}

        {/* ✅ LOADING STATE */}
        {showUniverse && !mounted && (
          <div style={{
            width: '100%',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 100%)',
            color: '#fff',
            fontSize: '18px',
            fontFamily: 'Orbitron, monospace'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: '20px', fontSize: '24px' }}>🌌</div>
              <div>Initializing Universe...</div>
            </div>
          </div>
        )}

        {/* ✅ NODE CONTENT (when navigated to specific node) */}
        {node && (
          <div style={{ 
            padding: '2rem', 
            color: '#fff',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 100%)'
          }}>
            <h1 style={{ 
              fontFamily: 'Orbitron, monospace',
              fontSize: '2rem',
              marginBottom: '1rem',
              color: '#00ffff',
              textShadow: '0 0 10px #00ffff'
            }}>
              {node.toUpperCase()}
            </h1>
            <p style={{ opacity: 0.7, marginBottom: '0.5rem' }}>
              Galaxy: <span style={{ color: '#ff9900' }}>{galaxy}</span>
            </p>
            <p style={{ opacity: 0.7 }}>
              System: <span style={{ color: '#00ffff' }}>{system}</span>
            </p>
            
            {/* ✅ Your node-specific content goes here */}
            <div style={{ marginTop: '2rem' }}>
              <p style={{ opacity: 0.5 }}>Node content placeholder...</p>
            </div>
          </div>
        )}

        {/* ✅ LEGACY SYMBOL VIEW (if needed) */}
        {symbol && (
          <>
            <div className="subheader">
              <div className="subheader__wrapper" ref={dropdownRef}>
                <div className="chip" onClick={() => setDropdownOpen(!dropdownOpen)}>
                  <span className="subheader__label">{store.priceChangePeriod}</span>
                </div>
                <div className={`dropdown ${dropdownOpen ? "dropdown--active" : ""}`}>
                  <ul className="dropdown__list">
                    {periods.map((period) => (
                      <li key={period} className="dropdown__item">
                        <button
                          className="dropdown__link"
                          onClick={() => {
                            store.setPriceChangePeriod(period);
                            setDropdownOpen(false);
                          }}
                        >
                          {period}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <BlockDetails symbol={symbol} />
          </>
        )}
      </div>
    </section>
  );
});

Dashboard.layout = (page) => <MainLayout>{page}</MainLayout>;

export default Dashboard;