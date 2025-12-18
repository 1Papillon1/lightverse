// resources/js/Layouts/MainLayout.jsx
import React, { useEffect } from "react";
import Navigation from "@/components/layout/Navigation";
import AirEffect from "@/components/visuals/AirEffect";
import { useRootStore } from "@/stores/RootStore";
import { observer } from "mobx-react-lite";
import ReturnToOrbitButton from "@/components/transitions/ReturnToOrbitButton";
import { usePage } from "@inertiajs/react";
import WalletProvider from "@/components/wallet/WalletProvider";
import TutorialOverlay from "@/components/visuals/TutorialOverlay";
import Login from "@/components/authentication/Login";
import Signup from "@/components/authentication/Signup";
import Settings from "@/pages/Settings";
import NarratorPulse from "@/components/trackers/NarratorPulse";
import AuriaHologram from "@/components/visuals/AuriaHologram";
import UniverseBootLoader from "@/components/loaders/UniverseBootLoader";
import AchievementsOverlay from "@/components/user/AchievementsOverlay";

const MainLayout = observer(({ children }) => {
  const rootStore = useRootStore();
  const {
    tutorialStore,
    userStore,
    uiStore,
    marketStore,
    universeStore,
    narratorStore,
  } = rootStore;

  // ✅ Here is where props actually come from
  const page = usePage();
  const url = page.url;
  const props = page.props;

useEffect(() => {
  if (userStore.authorized) {
    rootStore.lightwebCoinStore.initializeForUser();
  } else {
    rootStore.lightwebCoinStore.reset();
  }
}, [userStore.authorized]);

  useEffect(() => {
    // Always sync zoom/system state on any route change
    console.log(userStore.overlayActive);
    universeStore.detectFromUrl();
}, [url]);

  const isDashboard = url === "/" || url === "/dashboard";
  const isWallet = url === "/wallet";
  

  // Auth check
  const isAuth =
    url.startsWith("/login") ||
    url.startsWith("/register") ||
    url.startsWith("/email/verify");

useEffect(() => {
  if (isAuth) {
    rootStore.visualLoadStore.reset();
  }
}, [isAuth]);


useEffect(() => {
  if (props?.flash?.welcome_narrator) {
    narratorStore.playWelcome();
  }
}, []);

useEffect(() => {
  if (userStore.overlayActive) {
    document.body.classList.add("ui-locked");
  } else {
    document.body.classList.remove("ui-locked");
  }
}, [userStore.overlayActive]);

  return (
    <>
      <UniverseBootLoader />

      <WalletProvider>
        <div className="App">

  

        {!isAuth && (
          <>
            <NarratorPulse />
            <AuriaHologram />
          </>
        )}

        {!isAuth && <Navigation horizontal />}


        <div className="layout">
          {children}
        </div>


        {!isDashboard && (
          <div className="asidebar">
            <div className="asidebar__footer">
              {universeStore.zoomLevel === "system" && (
                <ReturnToOrbitButton type="galaxy" />
              )}
              {universeStore.zoomLevel === "node" && (
                <>
                  <ReturnToOrbitButton type="system" />
                  <ReturnToOrbitButton type="galaxy" />
                </>
              )}
            </div>
          </div>
        )}

        {isDashboard && <TutorialOverlay />}

        {userStore.activeOverlay === "login" && <Login />}
        {userStore.activeOverlay === "signup" && <Signup />}
        {userStore.activeOverlay === "settings" && <Settings />}
        {userStore.activeOverlay === "achievements" && <AchievementsOverlay />}
        </div>
      </WalletProvider>
    </>
  );
});

export default MainLayout;
