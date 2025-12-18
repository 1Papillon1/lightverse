import React, { useRef, useEffect, Suspense, useContext } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Terrain from "@/components/visuals/Terrain";
import RotatingStars from "@/components/visuals/RotatingStars";
import NebulaBackdrop from "./NebulaBackdrop";
import { observer } from "mobx-react-lite";
import { resolveTerrainType } from "@/utils/terrainResolver";
import LightverseCoin from "@/components/visuals/LightverseCoin";
import CoinPickupOrchestrator from "@/components/visuals/CoinPickupOrchestrator";
import { useRootStore } from "@/stores/RootStore";
import { SRGBColorSpace } from "three";
import { RootStoreContext } from "@/stores/RootStore";

// Safe usePage import
let inertiaUsePage;
try {
  inertiaUsePage = require("@inertiajs/react").usePage;
} catch {
  try {
    inertiaUsePage = require("@inertiajs/inertia-react").usePage;
  } catch {
    inertiaUsePage = null;
  }
}

const UniverseBackdrop = observer(({ mode, children }) => {
  const orbitRef = useRef();
  const { lightwebCoinStore, userStore } = useContext(RootStoreContext);

  const inertiaPage = inertiaUsePage ? inertiaUsePage() : null;

  // Which terrain to render
  const currentUrl =
    inertiaPage?.url || inertiaPage?.props?.url || window.location.pathname;

  const resolvedType = mode || resolveTerrainType(currentUrl);



  // Camera limiter
  function CameraLimiter() {
    const { camera } = useThree();
    const terrainSize = 70;
    const margin = 10;
    const minX = -terrainSize / 2 + margin;
    const maxX = terrainSize / 2 - margin;
    const minZ = -terrainSize / 2 + margin;
    const maxZ = terrainSize / 2 - margin;
    const minY = -10;
    const maxY = 20;

    useFrame(() => {
      if (!orbitRef.current) return;
      const controls = orbitRef.current;
      const target = controls.target;
      const pos = camera.position;

      target.x = Math.max(minX, Math.min(maxX, target.x));
      target.z = Math.max(minZ, Math.min(maxZ, target.z));
      target.y = Math.max(minY, Math.min(maxY, target.y));

      pos.x = Math.max(minX, Math.min(maxX, pos.x));
      pos.z = Math.max(minZ, Math.min(maxZ, pos.z));
      pos.y = Math.max(minY, Math.min(maxY, pos.y));

      controls.update();
    });

    return null;
  }

  return (
    <div className="canvas__background">
      <Canvas camera={{ position: [0, 5, 30], fov: 75 }}
      gl={{ outputColorSpace: SRGBColorSpace }}
      >

        <ambientLight intensity={3} />
        <directionalLight position={[1, 5, 0]} intensity={15} castShadow />
        <pointLight position={[0, 5, 0]} intensity={3} color="#8f8fff" />

       <Suspense fallback={null}>
        <RotatingStars />
        <NebulaBackdrop rotate />
        <Terrain
          key={resolvedType}   // 🔑 CRITICAL
          type={resolvedType}
        />

        {userStore.authorized &&
          lightwebCoinStore.filteredDrops.map(drop => (
            <LightverseCoin key={drop.id} drop={drop} />
        ))}

        {userStore.authorized && <CoinPickupOrchestrator />}
        {children}
      </Suspense>

        <OrbitControls
          ref={orbitRef}
          enablePan={true}
          enableRotate={false}
          enableZoom={false}
          screenSpacePanning={true}
          minPolarAngle={Math.PI / 2}
          maxPolarAngle={Math.PI / 2}
        />

        <CameraLimiter />
      </Canvas>
    </div>
  );
});

export default UniverseBackdrop;
