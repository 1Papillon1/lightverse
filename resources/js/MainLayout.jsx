import React, { useEffect, startTransition } from "react";
import { observer } from "mobx-react-lite";
import { usePage } from "@inertiajs/react";

import { useRootStore } from "@/stores/RootStore";

import Navigation from "@/components/layout/Navigation";
import BreadcrumbTrail from "@/components/ui/BreadcrumbTrail";
import ReturnToOrbitButton from "@/components/transitions/ReturnToOrbitButton";

import UniverseBootLoader from "@/components/loaders/UniverseBootLoader";
import TutorialOverlay from "@/components/visuals/TutorialOverlay";
import AuriaHologram from "@/components/visuals/AuriaHologram";

import Settings from "@/pages/Settings";
import AchievementsOverlay from "@/components/user/AchievementsOverlay";
import AdminPanel from "@/components/admin/AdminPanel";

const MainLayout = observer(({ children }) => {
  const rootStore = useRootStore();
  const {
    userStore,
    universeStore,
    visualLoadStore,
    lightStore,
    notificationsStore,
  } = rootStore;

 

  const page = usePage();
  const { url, props } = page;

  

  /* ----------------------------------
     🔑 INERTIA → MOBX AUTH SYNC
  ---------------------------------- */
  const inertiaUser  = props?.auth?.user  ?? null;
  const inertiaLight = props?.light?.user ?? null; 

  const inertiaNotifs = props?.recentNotifications ?? [];
  const inertiaCount  = props?.unreadNotificationsCount ?? 0;

  // Hydrate on every page visit if logged in
useEffect(() => {
  if (!inertiaUser) return; // ← guard
  notificationsStore.hydrate(inertiaNotifs, inertiaCount);
}, [inertiaUser, inertiaNotifs, inertiaCount]);

// Start polling only when authenticated
useEffect(() => {
  if (!inertiaUser) return;
  notificationsStore.startPolling(30000);
  return () => notificationsStore.stopPolling();
}, [!!inertiaUser]);

  useEffect(() => {
    if (!inertiaUser) return;
    if (!userStore.authorized) {
      userStore.onLoginSuccess(inertiaUser);
    }
  }, [inertiaUser, userStore]);

  /* ----------------------------------
     ✦ LIGHT SYNC — hydrate from Inertia
     shared props on every page visit,
     then poll every 60s for live updates
  ---------------------------------- */
    useEffect(() => {
    if (inertiaLight) lightStore.hydrate(inertiaLight);
  }, [inertiaLight]);

  useEffect(() => {
    if (!inertiaUser) return;
    lightStore.startPolling(60000);
    return () => lightStore.stopPolling();
  }, [!!inertiaUser]);

  /* ----------------------------------
     🌌 UNIVERSE SYNC ON ROUTE CHANGE
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
    document.body.classList.toggle("ui-locked", userStore.overlayActive);
    return () => document.body.classList.remove("ui-locked");
  }, [userStore.overlayActive]);

  const isDashboard = url === "/" || url === "/dashboard";

  return (
    <>
      <UniverseBootLoader />

      
        <div className="App">
          {!isAuth && (
            <>
              <AuriaHologram />
              <Navigation horizontal />
              <BreadcrumbTrail onNavigate={(level) => {}} />
            </>
          )}

          <div className="layout">{children}</div>

          {!isDashboard && (
            <div className="asidebar">
              <div className="asidebar__footer">
                {universeStore.isNode && (
                  <>
                    <ReturnToOrbitButton type="system" />
                    <ReturnToOrbitButton type="galaxy" />
                  </>
                )}
                {universeStore.isSystem && (
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

          {userStore.activeOverlay === "admin"        && <AdminPanel />}
          {userStore.activeOverlay === "settings"     && <Settings />}
          {userStore.activeOverlay === "achievements" && <AchievementsOverlay />}
        </div>
   
    </>
  );
});

export default MainLayout;