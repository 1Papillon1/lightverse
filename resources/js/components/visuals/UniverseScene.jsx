// resources/js/components/visuals/UniverseScene.jsx
import { useEffect, useRef, useState, useContext } from "react";
import { observer } from "mobx-react-lite";
import { Canvas } from "@react-three/fiber";
import { Stars, OrbitControls } from "@react-three/drei";
import gsap from "gsap";
import { RootStoreContext } from "@/stores/RootStore";
import LoadingScreen from "@/components/transitions/LoadingScreen";
import { TextureLoader } from "three";
import NebulaBackdrop from "@/components/visuals/NebulaBackdrop";
import RisingStarGrid from "@/components/layout/RisingStarGrid";
import FloatingNodeGrid from "@/components/layout/FloatingNodeGrid";
import TutorialZoomTracker from "../trackers/TutorialZoomTracker";
import { Inertia } from "@inertiajs/inertia";
import SparkleFieldGroup from "@/components/visuals/SparkleFieldGroup";
import AsteroidField from "@/components/visuals/AsteroidField";
import ReturnToOrbitButton from "@/components/transitions/ReturnToOrbitButton";
import RisingStar from "@/components/visuals/RisingStar";

const starConfigs = [
  { id: "wallet", label: "Wallet", theme: "black", position: [-40, 2, 105] },
  { id: "markets", label: "Markets", theme: "orange", position: [59, 15, 85] },
  { id: "contracts", label: "Contracts", theme: "gray", position: [85, -35, -17] },
  { id: "overview", label: "Overview", theme: "darkbrown", position: [-65, -15, 8] },
  { id: "ai", label: "Wzkr AI", theme: "lightbrown", position: [25, 15, -60] },
];

const UniverseScene = observer(({ onSceneSelect }) => {
  const orbitRef = useRef();
  const targetRef = useRef([0, 0, 0]);
  const [activeSystem, setActiveSystem] = useState(null);
  const [sceneReady, setSceneReady] = useState(false);

  const { marketStore, universeStore } = useContext(RootStoreContext);

  // 🌌 Preload textures
  useEffect(() => {
    const loader = new TextureLoader();
    const urls = [
      "/textures/wallet_node_4k.jpg",
      "/textures/market_node_4k.jpg",
      "/textures/contract_node_4k.jpg",
      "/textures/roadmap_node_4k.jpg",
      "/textures/ai_node_4k.jpg",
    ];
    Promise.all(urls.map((url) => new Promise((resolve) => loader.load(url, resolve)))).then(() => {
      marketStore.setSceneReady(true);
      /* setSceneReady(true); */
    });
  }, [marketStore]);

  // 🧭 Detect ?system= query param on dashboard
  useEffect(() => {
    if (!sceneReady) return;

    const params = new URLSearchParams(window.location.search);
    const systemParam = params.get("system");

    if (systemParam) {
      const system = starConfigs.find((s) => s.id === systemParam);
      if (system) {
        zoomIntoSystem(system.id, system.position);
      }
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
      onComplete: () => {
        onSceneSelect?.(id);
      },
    });
  };

  return (
    <>
     {/*  {!sceneReady && <LoadingScreen />} */}

      {/* 🚀 Orbit Return Buttons */}
      {universeStore.zoomLevel !== "galaxy" && (
        <div className="asidebar">
          <div className="asidebar__footer">
            {/* Always show “Return to Galactic View” in system or node */}
            <ReturnToOrbitButton type="galaxy" />

            {/* If currently in a node, also show “Return to System Orbit” */}
            {universeStore.zoomLevel === "node" && (
              <ReturnToOrbitButton type="system" />
            )}
          </div>
        </div>
      )}

      <Canvas camera={{ position: [0, 60, 240], fov: 80 }}>
        <TutorialZoomTracker />
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <pointLight position={[0, 0, 8]} intensity={1.5} />

        <NebulaBackdrop />
        <Stars radius={250} depth={30} count={2000} factor={5} fade />
        <SparkleFieldGroup />
        <AsteroidField count={35} radius={450} repulsionRadius={100} />

        <OrbitControls ref={orbitRef} enablePan={false} enableZoom={true} 
 
            minDistance={universeStore.zoomLevel === "system" ? 20 : 160}
            maxDistance={universeStore.zoomLevel === "system" ? 50 : 220}
        
        />

        {/* 🌠 Galaxy level */}
        {universeStore.zoomLevel === "galaxy" && (
          <RisingStarGrid onSelect={(id, pos) => zoomIntoSystem(id, pos)} />
        )}

        {/* 🌌 System level */}
      {universeStore.zoomLevel === "system" && activeSystem && (
  <group position={activeSystem.pos}>
    {/* 🌟 Central static star in system view */}
   <RisingStar
  position={[0, 0, 0]}
  theme={activeSystem.theme || "default"}
  label={activeSystem.label || "Central Star"}
  interactive={false} // disables hover and click
/>

    {/* 🌌 Floating nodes orbiting around the star */}
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
  </group>
)}
      </Canvas>
    </>
  );
});

export default UniverseScene;
