// resources/js/Layouts/MainLayout.jsx
import React, {useEffect} from 'react';
import Navigation from '@/components/layout/Navigation';
import AirEffect from '@/components/visuals/AirEffect';
import { useRootStore } from '@/stores/RootStore';
import { observer } from "mobx-react-lite";
import ReturnToOrbitButton from '@/components/transitions/ReturnToOrbitButton';
import { usePage } from '@inertiajs/react';
import WalletProvider from '@/components/wallet/WalletProvider';
import TutorialOverlay from '@/components/visuals/TutorialOverlay';
import Login from '@/components/authentication/Login';
import Signup from '@/components/authentication/Signup';
import Settings from '@/pages/Settings';
import Panel from '@/components/layout/Panel';
import NeonCat from '@/components/model/NeonCat';
import { Canvas } from '@react-three/fiber';


const MainLayout = observer(({ children }) => {
  const rootStore = useRootStore();

  // if UniverseScene is not loaded show AirEffect
  const { tutorialStore } = rootStore;
  const { userStore } = rootStore;
  const { url } = usePage();

  const isDashboard = url === "/" || url === "/dashboard";
  const isWallet = url === "/wallet";

   useEffect(() => {
    if (!tutorialStore.completed) {
      if (isDashboard) {
        tutorialStore.startTutorial("dashboard");
      } else if (isWallet) {
        tutorialStore.startTutorial("wallet");
      }
    }
  }, [url, tutorialStore, isDashboard, isWallet]);

  // Overlay handling
 
    

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

      {isDashboard && <TutorialOverlay />}

      {userStore.activeOverlay === "login" && <Login />}
      {userStore.activeOverlay === "signup" && <Signup />}
      {userStore.activeOverlay === "settings" && <Settings />}


        <div className="helper helper--bottom--left">
    <Canvas camera={{ position: [0, 1, 5], fov: 40 }}>
      <ambientLight intensity={1.2} /> {/* boost base light */}
      <directionalLight position={[5, 10, 5]} intensity={15} />
      {/* <NeonCat scale={3} position={[0, 0, 0]} rotation={[0, -Math.PI / 2, 0]} /> */}
    </Canvas>
  </div>

      </div>
    </WalletProvider>
  );
});

export default MainLayout;