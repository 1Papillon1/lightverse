import React, { useEffect, startTransition } from "react";
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

import Settings from "@/pages/Settings";
import AchievementsOverlay from "@/components/user/AchievementsOverlay";
import AdminPanel from "@/components/admin/AdminPanel";


const MainLayout = observer(({ children }) => {
  const rootStore = useRootStore();
  const {
    userStore,
    universeStore,
    narratorStore,
    visualLoadStore,
  } = rootStore;

  const page = usePage();
  const { url, props } = page;

  /* ----------------------------------
     🔑 INERTIA → MOBX AUTH SYNC
     (SAFE: happens AFTER render)
  ---------------------------------- */
  const inertiaUser = props?.auth?.user ?? null;

  useEffect(() => {
    if (!inertiaUser) return;

    if (!userStore.authorized) {
      userStore.onLoginSuccess(inertiaUser);
    }
  }, [inertiaUser, userStore]);

  /* ----------------------------------
     🌌 UNIVERSE SYNC ON ROUTE CHANGE
     (wrapped to avoid sync suspend)
  ---------------------------------- */
  useEffect(() => {
    startTransition(() => {
      try {
        universeStore.detectFromUrl();
      } catch (e) {
        console.error("detectFromUrl failed", e);
      }
    });
  }, [url, universeStore]);

  /* ----------------------------------
     🧭 AUTH ROUTES
  ---------------------------------- */
  const isAuth =
    url.startsWith("/login") ||
    url.startsWith("/register");

  useEffect(() => {
    if (isAuth && !userStore.authorized) {
      visualLoadStore.reset();
    }
  }, [isAuth, userStore.authorized, visualLoadStore]);



  /* ----------------------------------
     🔒 UI LOCK
  ---------------------------------- */
  useEffect(() => {
    document.body.classList.toggle(
      "ui-locked",
      userStore.overlayActive
    );

    return () => {
      document.body.classList.remove("ui-locked");
    };
  }, [userStore.overlayActive]);

  const isDashboard = url === "/" || url === "/dashboard";

  return (
    <>
      <UniverseBootLoader />

      <WalletProvider>
        <div className="App">
          {!isAuth && (
            <>
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

          {userStore.activeOverlay === "admin" && <AdminPanel />}
          {userStore.activeOverlay === "settings" && <Settings />}
          {userStore.activeOverlay === "achievements" && (
            <AchievementsOverlay />
          )}
        </div>
      </WalletProvider>
    </>
  );
});

export default MainLayout;
