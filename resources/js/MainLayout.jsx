// resources/js/Layouts/MainLayout.jsx
import React from 'react';
import Navigation from '@/components/layout/Navigation';
import AirEffect from '@/components/visuals/AirEffect';
import { useRootStore } from '@/stores/RootStore';
import { observer } from "mobx-react-lite";
import ReturnToOrbitButton from '@/components/transitions/ReturnToOrbitButton';
import { usePage } from '@inertiajs/react';
import WalletProvider from '@/components/wallet/WalletProvider';


const MainLayout = observer(({ children }) => {
  const rootStore = useRootStore();
  // if UniverseScene is not loaded show AirEffect
  const { url } = usePage();
  const isDashboard = url === "/dashboard";

  return (
    <WalletProvider>

      <div className="App">
    
        {rootStore.uiStore.animated && !rootStore.marketStore.sceneReady && (
          <>
            <AirEffect />
          
          
          </>
        )}
        <Navigation horizontal />
        
        <div className="layout">
          {children}
        </div>

        {!isDashboard && (
            <ReturnToOrbitButton onReturn={() => rootStore.uiStore.setActiveScene("universe")} />
        )}
        
      </div>
    </WalletProvider>
  );
});

export default MainLayout;