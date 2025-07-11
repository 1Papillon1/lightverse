import React, { useContext, useEffect, useState, useRef } from "react";
import { observer } from "mobx-react-lite";
import { RootStoreContext } from "@/stores/RootStore";
import MarketBlocks from "@/components/market/MarketBlocks";
import MainLayout from "@/MainLayout";
import { Head, usePage } from "@inertiajs/react";
import searchIcon from "@/assets/icons/search.svg";
import filterIcon from "@/assets/icons/filter.svg";
import BlockDetails from "../components/market/BlockDetails";
import UniverseScene from "@/components/visuals/UniverseScene";
import LoadingScreen from "@/components/transitions/LoadingScreen";

// Universe Scene is a 3D component that displays a 3D universe with nodes representing different market entities.


const Dashboard = observer(() => {
  const [activeScene, setActiveScene] = useState("market"); // default
  const { auth, symbol } = usePage().props; 
  const rootStore = useContext(RootStoreContext);    // <-- symbol je URL param
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

  // Ako je symbol definiran, spremi ga u store ili samo prikaži detalje
  useEffect(() => {
    if (symbol) {
      store.setSearchQuery(symbol);             // po želji možeš filtrirati listu
      
      store.setSelectedMarket(
      
       store.markets.find((m) => m.symbol.toUpperCase() === symbol.toUpperCase())
      );
    }
    
  }, [symbol, store]);
  return (
    <section className="hero">
      <Head title="Dashboard" />


      {!store.sceneReady && <LoadingScreen />}

      <div className="hero__container">

 {!symbol && (
  <>
      <UniverseScene onSceneSelect={(sceneId) => setActiveScene(sceneId)} />

      {/* Overlay the loading screen if scene is not ready */}


    {activeScene === "market" && (
      <>
        {navigationState === "main" && (
          <div className="hero__search">
            
          </div>
        )}


        {/* Last changed: 2025-06-19 */}
       {/*  <MarketBlocks /> */}

       
      </>
    )}

    {activeScene === "wallet" && (
      <>
        <h2 className="section__title">Wallet Interface</h2>
        {/* Add your wallet components here */}
        {/* Example: <WalletOverview /> or <SyncWallet /> */}
        <p>Sync your wallet and view assets here.</p>
      </>
    )}
  </>
)}

    {symbol && 
    <>

        <div className="subheader">
  <div className="subheader__wrapper" ref={dropdownRef}>
    <div
      className="chip"
      onClick={() => setDropdownOpen(!dropdownOpen)}
    >
      <img src={filterIcon} className="subheader__icon" alt="filter" />
      <span className="subheader__label">{store.priceChangePeriod}</span>
    </div>

    <div className={`dropdown dropdown--horizontal ${dropdownOpen ? "dropdown--active" : ""}`}>
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

    <BlockDetails symbol={symbol}  />
    
    
    
    </>}

      </div>
    </section>
  );
});

Dashboard.layout = (page) => <MainLayout>{page}</MainLayout>;

export default Dashboard;

