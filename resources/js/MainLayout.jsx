import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { usePage } from "@inertiajs/react";

import { useRootStore } from "@/stores/RootStore";

import Navigation from "@/components/layout/Navigation";
import ReturnToOrbitButton from "@/components/transitions/ReturnToOrbitButton";
import WalletProvider from "@/components/wallet/WalletProvider";

import UniverseBootLoader from "@/components/loaders/UniverseBootLoader";
import TutorialOverlay from "@/components/visuals/TutorialOverlay";
import NarratorPulse from "@/components/trackers/NarratorPulse";
import AuriaHologram from "@/components/visuals/AuriaHologram";

import Login from "@/components/authentication/Login";
import Signup from "@/components/authentication/Signup";
import Settings from "@/pages/Settings";
import AchievementsOverlay from "@/components/user/AchievementsOverlay";

const MainLayout = observer(({ children }) => {
  const rootStore = useRootStore();
  const {
    userStore,
    universeStore,
    narratorStore,
  } = rootStore;

  const page = usePage();
  const url = page.url;
  const props = page.props;

  /* ----------------------------------
     🔑 INERTIA → MOBX AUTH SYNC
  ---------------------------------- */
useEffect(() => {
  const inertiaUser = props?.auth?.user;
console.log(universeStore.zoomLevel);

  if (inertiaUser && !userStore.authorized) {
    userStore.onLoginSuccess(inertiaUser);
  }

 
}, [props?.auth?.user]);



  /* ----------------------------------
     🌌 UNIVERSE SYNC ON ROUTE CHANGE
  ---------------------------------- */
  useEffect(() => {
   
  try {
    universeStore.detectFromUrl();
  } catch (e) {
    console.error("detectFromUrl failed", e);
  }
}, [url]);

  /* ----------------------------------
     🧭 AUTH ROUTES
  ---------------------------------- */
  const isAuth =
    url.startsWith("/login") ||
    url.startsWith("/register") ||
    url.startsWith("/email/verify");

 useEffect(() => {
  if (isAuth && !userStore.authorized) {
    rootStore.visualLoadStore.reset();
  }
}, [isAuth, userStore.authorized]);

  /* ----------------------------------
     🎙 Narrator
  ---------------------------------- */
  useEffect(() => {
    if (props?.flash?.welcome_narrator) {
      narratorStore.playWelcome();
    }
  }, []);

  /* ----------------------------------
     🔒 UI LOCK
  ---------------------------------- */
  useEffect(() => {
    document.body.classList.toggle("ui-locked", userStore.overlayActive);
  }, [userStore.overlayActive]);

  const isDashboard = url === "/" || url === "/dashboard";

  return (
    <>
      <UniverseBootLoader />

      <WalletProvider>
        <div className="App">
          {!isAuth && (
            <>
              <NarratorPulse />
              <AuriaHologram />
              <Navigation horizontal />
            </>
          )}

          <div className="layout">{children}</div>

          {!isDashboard && (
            <div className="asidebar">
              <div className="asidebar__footer">
               {universeStore.canReturnToSystem && (
                  <ReturnToOrbitButton type="system" />
                )}

                {universeStore.canReturnToGalaxy && (
                  <ReturnToOrbitButton type="galaxy" />
                )}
              </div>
            </div>
          )}

          {isDashboard && (
            <>
            <TutorialOverlay />
            {universeStore.zoomLevel === "system" && (
              <div className="asidebar">
              <div className="asidebar__footer">
                <ReturnToOrbitButton type="galaxy" />
                </div>
              </div>
            )}
            </>
            )}

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
