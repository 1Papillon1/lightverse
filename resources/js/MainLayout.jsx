// resources/js/Layouts/MainLayout.jsx
import React, { useEffect, useContext } from "react";
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

const MainLayout = observer(({ children }) => {
  const rootStore = useRootStore();
  const { tutorialStore, userStore, uiStore, marketStore, universeStore } = rootStore;
  const { url } = usePage();

  const isDashboard = url === "/" || url === "/dashboard";
  const isWallet = url === "/wallet";

  // Detect on load or route change
  useEffect(() => {
    universeStore.detectFromUrl();

    if (!tutorialStore.completed) {
      if (isDashboard) tutorialStore.startTutorial("dashboard");
      else if (isWallet) tutorialStore.startTutorial("wallet");
    }
  }, [url, tutorialStore, isDashboard, isWallet, universeStore]);

  return (
    <WalletProvider>
      <div className="App">
        {uiStore.animated && !marketStore.sceneReady && <AirEffect />}
        <Navigation horizontal />
        <div className="layout">{children}</div>

        {/* 🪐 Return buttons — determined by zoom level */}
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
