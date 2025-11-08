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
  const { symbol } = usePage().props;
  const rootStore = useContext(RootStoreContext);
  const store = useContext(RootStoreContext).marketStore;

  const { navigationState } = rootStore.uiStore;

  const periods = ["24h", "7d", "30d"];
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

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

      {/* {!store.sceneReady && <LoadingScreen />}  */}

      <div className="hero__container">
        {!symbol && (
          <>
            <UniverseScene onSceneSelect={(sceneId) => setActiveScene(sceneId)} />
          </>
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
