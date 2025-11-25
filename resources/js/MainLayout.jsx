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
    // Always sync zoom/system state on any route change
    universeStore.detectFromUrl();
}, [url]);

  const isDashboard = url === "/" || url === "/dashboard";
  const isWallet = url === "/wallet";
  const isAuth = url.startsWith("/login") || url.startsWith("/register");



  // --- Tutorial start logic ---
/*   useEffect(() => {
    universeStore.detectFromUrl();

    if (!tutorialStore.completed) {
      if (isDashboard) tutorialStore.startTutorial("dashboard");
      else if (isWallet) tutorialStore.startTutorial("wallet");
    }
  }, [url, tutorialStore, isDashboard, isWallet, universeStore]);
 */
  // --- Narrator: welcome message ---
useEffect(() => {
  if (props?.flash?.welcome_narrator) {
    narratorStore.playWelcome();
  }
}, []);

 /*  useEffect(() => {
    if (!tutorialStore.isActive) return;
    narratorStore.playTutorialStep(
      tutorialStore.activeScene,
      tutorialStore.activeStep
    );
  }, [tutorialStore.isActive]);

  // --- Narrator: play audio when step changes ---
  useEffect(() => {
    if (!tutorialStore.isActive) return;
    narratorStore.playTutorialStep(
      tutorialStore.activeScene,
      tutorialStore.activeStep
    );
  }, [tutorialStore.activeStep]);

  // --- Narrator: pause on login/signup/settings overlay ---
  useEffect(() => {
    if (userStore.activeOverlay) {
      narratorStore.pause();
    } else {
      narratorStore.resume();
    }
  }, [userStore.activeOverlay]); */

  return (
    <WalletProvider>
      <div className="App">
        {uiStore.animated && !marketStore.sceneReady && <AirEffect />}

        {!isAuth && 
        (
        <>
          <NarratorPulse />
          <AuriaHologram />
        </>
        )}
        
        

        {!isAuth && <Navigation horizontal />}

        <div className="layout">{children}</div>

        {/* Return Buttons */}
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
      </div>
    </WalletProvider>
  );
});

export default MainLayout;
