// resources/js/components/visuals/UniverseScene.jsx
import { useEffect, useRef, useState, useContext } from "react";
import { observer } from "mobx-react-lite";
import { Canvas, useLoader } from "@react-three/fiber";
import { Stars, OrbitControls } from "@react-three/drei";
import gsap from "gsap";
import { RootStoreContext } from "@/stores/RootStore";
import { TextureLoader, SRGBColorSpace, RepeatWrapping } from "three";
import NebulaBackdrop from "@/components/visuals/NebulaBackdrop";
import RisingStarGrid from "@/components/layout/RisingStarGrid";
import FloatingNodeGrid from "@/components/layout/FloatingNodeGrid";
import TutorialZoomTracker from "@/components/trackers/TutorialZoomTracker";
import SparkleFieldGroup from "@/components/visuals/SparkleFieldGroup";
import AsteroidField from "@/components/visuals/AsteroidField";
import RisingStar from "@/components/visuals/RisingStar";
import LightverseCoin from "@/components/visuals/LightverseCoin";
import CoinPickupOrchestrator from "@/components/visuals/CoinPickupOrchestrator";
import { Inertia } from "@inertiajs/inertia";

const starConfigs = [
  { id: "wallet", label: "Wallet", position: [-40, 2, 105] },
  { id: "markets", label: "Markets", position: [59, 15, 85] },
  { id: "contracts", label: "Contracts", position: [85, -35, -17] },
  { id: "overview", label: "Overview", position: [-65, -15, 8] },
  { id: "ai", label: "Wzkr AI", position: [25, 15, -60] },
];

const UniverseScene = observer(({ onSceneSelect }) => {
  const orbitRef = useRef();
  const targetRef = useRef([0, 0, 0]);
  const [activeSystem, setActiveSystem] = useState(null);
  const [sceneReady, setSceneReady] = useState(false);

  const { marketStore, universeStore, lightwebCoinStore, userStore, visualLoadStore } =
  useContext(RootStoreContext);

  /* --------------------------------------------------
     ✅ PRELOAD ALL SYSTEM TEXTURES (R3F-NATIVE)
  -------------------------------------------------- */
  const textures = useLoader(TextureLoader, [
    "/textures/wallet_node_4k.jpg",
    "/textures/market_node_4k.jpg",
    "/textures/contract_node_4k.jpg",
    "/textures/roadmap_node_4k.jpg",
    "/textures/ai_node_4k.jpg",
  ]);

  useEffect(() => {
  textures.forEach((tex) => {
    tex.colorSpace = SRGBColorSpace;
    tex.wrapS = tex.wrapT = RepeatWrapping;
    tex.needsUpdate = true;
  });

  marketStore.setSceneReady(true);
  setSceneReady(true);

  // 🔑 THIS IS THE MISSING LINE
  visualLoadStore.markUniverseReady();
}, [textures]);

  /* --------------------------------------------------
     URL ?system= detection
  -------------------------------------------------- */
  useEffect(() => {
    if (!sceneReady) return;

    const params = new URLSearchParams(window.location.search);
    const systemParam = params.get("system");

    if (systemParam) {
      const system = starConfigs.find((s) => s.id === systemParam);
      if (system) zoomIntoSystem(system.id, system.position);
    } else {
      universeStore.setZoomLevel("galaxy");
    }
  }, [sceneReady]);

  const zoomIntoSystem = (id, pos) => {
    const camera = orbitRef.current?.object;
    if (!camera) return;

    setActiveSystem({ id, pos });
    universeStore.setActiveSystem({ id, pos });
    universeStore.setZoomLevel("system");

    gsap.to(camera.position, {
      x: pos[0] * 1.3,
      y: pos[1] * 0.6,
      z: pos[2] * 0.9,
      duration: 1.4,
      ease: "power2.out",
    });

    gsap.to(targetRef.current, {
      0: pos[0],
      1: pos[1],
      2: pos[2],
      duration: 1.4,
      ease: "power2.out",
      onUpdate: () => orbitRef.current?.target.set(...targetRef.current),
      onComplete: () => onSceneSelect?.(id),
    });
  };

  return (
    <Canvas
      camera={{ position: [0, 60, 240], fov: 80 }}
      gl={{ outputColorSpace: SRGBColorSpace }}   // ✅ CRITICAL FIX
    >
      <TutorialZoomTracker />

      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <pointLight position={[0, 0, 8]} intensity={1.5} />

      <NebulaBackdrop />
      <Stars radius={250} depth={30} count={2000} factor={5} fade />
      <SparkleFieldGroup />
      <AsteroidField count={35} radius={450} repulsionRadius={100} />

      <OrbitControls
        ref={orbitRef}
        enablePan={false}
        enableZoom
        minDistance={universeStore.zoomLevel === "system" ? 20 : 160}
        maxDistance={universeStore.zoomLevel === "system" ? 50 : 220}
      />

      {/* ---------------- GALAXY ---------------- */}
      {universeStore.zoomLevel === "galaxy" && (
        <>
          <RisingStarGrid onSelect={(id, pos) => zoomIntoSystem(id, pos)} />

        
          {userStore.authorized &&
            lightwebCoinStore.filteredDrops.map(drop => (
              <LightverseCoin key={drop.id} drop={drop} />
          ))}

          {userStore.authorized && <CoinPickupOrchestrator />}
        </>
      )}

      {/* ---------------- SYSTEM ---------------- */}
      {universeStore.zoomLevel === "system" && activeSystem && (
        <group position={activeSystem.pos}>
          <RisingStar
            position={[0, 0, 0]}
            label={activeSystem.label || "Central Star"}
            interactive={false}
          />

          <FloatingNodeGrid
            activeSystem={activeSystem.id}
            onSelect={(nodeId, pos) => {
              const camera = orbitRef.current?.object;
              if (!camera) return;

              const worldPos = [
                activeSystem.pos[0] + pos[0],
                activeSystem.pos[1] + pos[1],
                activeSystem.pos[2] + pos[2],
              ];

              gsap.to(camera.position, {
                x: worldPos[0] * 0.6,
                y: worldPos[1] * 0.6,
                z: worldPos[2] * 0.6,
                duration: 0.8,
                ease: "power2.inOut",
                onComplete: () => {
                  universeStore.setZoomLevel("node");
                  Inertia.visit(`/${activeSystem.id}/${nodeId}`);
                },
              });
            }}
          />

          {lightwebCoinStore.filteredDrops.map((drop) => (
            <LightverseCoin key={drop.id} drop={drop} />
          ))}

          <CoinPickupOrchestrator />
        </group>
      )}
    </Canvas>
  );
});

export default UniverseScene;
