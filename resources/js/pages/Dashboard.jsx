// Dashboard.jsx
import React, { useContext, useEffect, useState, useRef } from "react";
import { observer } from "mobx-react-lite";
import { RootStoreContext } from "@/stores/RootStore";
import MainLayout from "@/MainLayout";
import { Head, usePage } from "@inertiajs/react";
import UniverseScene from "@/components/visuals/UniverseScene";
import BlockDetails from "../components/market/BlockDetails";

const Dashboard = observer(() => {
  const [activeScene, setActiveScene] = useState("market");
  const [mounted, setMounted] = useState(false); // ✅ Client-only rendering
  const { symbol } = usePage().props;
  const rootStore = useContext(RootStoreContext);
  const store = useContext(RootStoreContext).marketStore;

  const { navigationState } = rootStore.uiStore;

  const periods = ["24h", "7d", "30d"];
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  // Check for verification success
  const [showVerifiedMessage, setShowVerifiedMessage] = useState(false);

  // ✅ CRITICAL: Ensure component is mounted (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('verified') === '1') {
      setShowVerifiedMessage(true);
      // Remove the verified parameter from URL
      window.history.replaceState({}, '', window.location.pathname);
      // Auto-hide after 5 seconds
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

  return (
    <section className="hero">
      <Head title="Dashboard">
        <meta name="keywords" content="blockchain, dashboard, assets, 3D universe, crypto, manage assets" />
        <meta name="description" content="Manage your blockchain assets in an immersive 3D universe." />
        <meta property="og:title" content="Dashboard - Blockchain Asset Manager" />
      </Head>

      {/* Email Verified Success Message */}
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
        {/* ✅ ONLY RENDER THREE.JS AFTER CLIENT-SIDE MOUNT */}
        {!symbol && mounted && (
          <UniverseScene onSceneSelect={(sceneId) => setActiveScene(sceneId)} />
        )}

        {/* ✅ FALLBACK LOADING STATE FOR SSR */}
        {!symbol && !mounted && (
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