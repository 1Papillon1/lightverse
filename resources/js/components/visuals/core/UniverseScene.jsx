// resources/js/components/visuals/core/UniverseScene.jsx
import { useEffect, useRef, useState, useContext, Suspense, use } from "react";
import { observer } from "mobx-react-lite";
import { Canvas } from "@react-three/fiber";
import { Stars, OrbitControls } from "@react-three/drei";
import { usePage } from "@inertiajs/react";
import gsap from "gsap";
import { RootStoreContext } from "@/stores/RootStore";
import { universeConfig } from "@/config/universe";
import { Inertia } from "@inertiajs/inertia";


// Components
import NebulaBackdrop from "@/components/visuals/core/NebulaBackdrop";
import SparkleFieldGroup from "@/components/visuals/effects/SparkleFieldGroup";
import AsteroidField from "@/components/visuals/effects/AsteroidField";
import TutorialZoomTracker from "@/components/trackers/TutorialZoomTracker";
import RisingStarGrid from "@/components/layout/RisingStarGrid";
import FloatingNodeGrid from "@/components/visuals/nodes/FloatingNodeGrid";
import SpiralGalaxy from "@/components/visuals/galaxies/SpiralGalaxy";
import LightCore from "@/components/visuals/core/LightCore";
import GalaxyLabelsOverlay from '@/components/ui/GalaxyLabelsOverlay';

const UniverseScene = observer(({ onSceneSelect, locked = false }) => {
  const orbitRef = useRef();
  
  const { universeStore, marketStore, visualLoadStore } = useContext(RootStoreContext);
  

   useEffect(() => {
    console.log("🧪 UniverseScene render:", {
    zoomLevel: universeStore.zoomLevel,
    activeSystem: universeStore.activeSystem,
    activeSystemHasPos: !!universeStore.activeSystem?.pos
  });
}, [universeStore.zoomLevel, universeStore.activeSystem]);
  
  const [sceneReady, setSceneReady] = useState(false);
  
  // ✅ Track which galaxy is centered (not yet entered)
  const [centeredGalaxyId, setCenteredGalaxyId] = useState(null);
  
  // ✅ NEW: Track hovered galaxy for 2D tooltip
  const [hoveredGalaxy, setHoveredGalaxy] = useState(null);

  // ✅ Get system Light from Inertia props
  const { light } = usePage().props;
  const systemLight = light?.system?.total || 0;

  useEffect(() => {
    marketStore.setSceneReady(true);
    setSceneReady(true);
    visualLoadStore.markUniverseReady();
  }, []);

  useEffect(() => {
  if (!sceneReady) return;
  
  universeStore.detectFromUrl();
  
  // Position camera after detecting zoom level
  setTimeout(() => {
    if (!orbitRef.current) return;
    
    const camera = orbitRef.current.object;
    const controls = orbitRef.current;
    
    // ✅ ADD THIS:
    if (universeStore.zoomLevel === "universe") {
      camera.position.set(0, 150, 500);
      controls.target.set(0, 0, 0);
      controls.update();
    }
    else if (universeStore.zoomLevel === "system" && universeStore.activeSystem) {
      // ... existing system camera positioning
    }
    else if (universeStore.zoomLevel === "galaxy" && universeStore.activeGalaxy) {
      // ... existing galaxy camera positioning
    }
  }, 0);
}, [sceneReady]);

  /* --------------------------------------------------
     🏠 RETURN TO UNIVERSE CENTER
  -------------------------------------------------- */
  const returnToUniverseCenter = () => {
    const camera = orbitRef.current?.object;
    const controls = orbitRef.current;
    if (!camera || !controls) return;

    // ✅ Clear centered galaxy state
    setCenteredGalaxyId(null);
    universeStore.setZoomLevel("universe");
    universeStore.setActiveGalaxy(null);

    // Animate camera back to initial position
    gsap.to(camera.position, {
      x: 0,
      y: 150,
      z: 500,
      duration: 1.2,
      ease: "power2.inOut",
    });

    // Animate OrbitControls target back to center
    gsap.to(controls.target, {
      x: 0,
      y: 0,
      z: 0,
      duration: 1.2,
      ease: "power2.inOut",
      onUpdate: () => controls.update(),
    });

    // Navigate to dashboard if not already there
    if (window.location.pathname !== "/dashboard") {
      Inertia.visit("/dashboard", {
        preserveState: true,
        preserveScroll: true,
      });
    }
  };

/* --------------------------------------------------
   🌌 CENTER GALAXY (FIRST CLICK) - FIXED
-------------------------------------------------- */
const centerGalaxy = (galaxyId, position) => {
  const camera = orbitRef.current?.object;
  const controls = orbitRef.current;
  if (!camera || !controls) return;

  const galaxy = universeConfig.galaxies.find(g => g.id === galaxyId);
  if (!galaxy) return;

  console.log("🎯 Centering galaxy:", galaxyId, "at position:", position);

  // ✅ Mark this galaxy as centered (but not entered)
  setCenteredGalaxyId(galaxyId);

  // Target position (where OrbitControls will orbit around)
  const targetPosition = { 
    x: position[0], 
    y: position[1], // ✅ Use actual Y position from galaxy
    z: position[2] 
  };
  
  // ✅ IMPROVED: Calculate camera offset based on galaxy position
  // For galaxies positioned vertically (high/low Y), adjust camera more dramatically
  
  const distanceFromCenter = Math.sqrt(
    position[0] ** 2 + position[1] ** 2 + position[2] ** 2
  );
  
  // Determine if galaxy is primarily vertical or horizontal
  const isVertical = Math.abs(position[1]) > Math.abs(position[0]) && 
                     Math.abs(position[1]) > Math.abs(position[2]);
  
  let cameraOffset;
  
  if (isVertical) {
    // ✅ For vertical galaxies (top/bottom), position camera to the side
    cameraOffset = {
      x: position[0] + 150, // Move camera to side
      y: position[1],        // Match galaxy Y
      z: position[2] + 100   // Pull back
    };
  } else {
    // ✅ For horizontal galaxies (left/right), position camera above and back
    cameraOffset = {
      x: position[0],
      y: position[1] + 60,   // Lift camera up
      z: position[2] + 200   // Pull back significantly
    };
  }

  console.log("📐 Camera offset:", cameraOffset);

  // Animate camera position
  gsap.to(camera.position, {
    x: cameraOffset.x,
    y: cameraOffset.y,
    z: cameraOffset.z,
    duration: 1.5,
    ease: "power2.inOut",
  });

  // Animate OrbitControls target
  gsap.to(controls.target, {
    x: targetPosition.x,
    y: targetPosition.y,
    z: targetPosition.z,
    duration: 1.5,
    ease: "power2.inOut",
    onUpdate: () => controls.update(),
  });
};

  /* --------------------------------------------------
     🚪 ENTER GALAXY (SECOND CLICK)
  -------------------------------------------------- */
  const enterGalaxy = (galaxyId, position) => {
    const galaxy = universeConfig.galaxies.find(g => g.id === galaxyId);
    if (!galaxy) return;

    console.log("🚪 Entering galaxy:", galaxyId);

    // Set state and navigate
    universeStore.setActiveGalaxy({ id: galaxyId, pos: position });
    universeStore.setZoomLevel("galaxy");

    Inertia.visit(galaxy.route, {
      preserveState: false,
      preserveScroll: true,
    });
  };

  /* --------------------------------------------------
     🎯 HANDLE GALAXY CLICK (TWO-STAGE)
  -------------------------------------------------- */
  const handleGalaxyClick = (galaxyId, position) => {
    if (centeredGalaxyId === galaxyId) {
      // ✅ Second click on same galaxy → ENTER
      enterGalaxy(galaxyId, position);
    } else {
      // ✅ First click or different galaxy → CENTER
      centerGalaxy(galaxyId, position);
    }
  };

  /* --------------------------------------------------
     🌌 DOUBLE-CLICK GALAXY (SKIP TO ENTER)
  -------------------------------------------------- */
  const fastZoomIntoGalaxy = (galaxyId, position) => {
    const galaxy = universeConfig.galaxies.find(g => g.id === galaxyId);
    if (!galaxy) return;

    console.log("⚡ Fast entering galaxy:", galaxyId);

    // Set state immediately and navigate
    setCenteredGalaxyId(galaxyId);
    universeStore.setActiveGalaxy({ id: galaxyId, pos: position });
    universeStore.setZoomLevel("galaxy");

    Inertia.visit(galaxy.route, {
      preserveState: true,
      preserveScroll: true,
    });
  };

 /* --------------------------------------------------
   ⭐ ZOOM INTO STAR SYSTEM (INSTANT - NO ANIMATION)
-------------------------------------------------- */
const zoomIntoSystem = (systemId, position) => {
  const camera = orbitRef.current?.object;
  const controls = orbitRef.current;
  if (!camera || !controls) return;

  const galaxy = universeConfig.galaxies.find(g => 
    g.starSystems.some(s => s.id === systemId)
  );
  
  const system = galaxy?.starSystems.find(s => s.id === systemId);
  if (!system) return;

  console.log("⭐ Entering system instantly:", systemId);

  // Set state
  universeStore.setActiveSystem({ id: systemId, pos: position });
  universeStore.setZoomLevel("system");

  // Position camera instantly (no GSAP animation)
  camera.position.set(
    position[0],
    position[1] + 12,
    position[2] + 18
  );
  
  controls.target.set(
    position[0],
    position[1],
    position[2]
  );
  
  controls.update();



  // Navigate
  Inertia.visit(system.route, {
    preserveState: true,
    preserveScroll: true,
    only: ['activeSystem'],
  });
  
  onSceneSelect?.(systemId);
};

  /* --------------------------------------------------
     ⌨️ KEYBOARD NAVIGATION
  -------------------------------------------------- */
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Escape") {
        if (universeStore.zoomLevel === "system") {
          // Return to galaxy view
          const galaxy = universeConfig.galaxies.find(g =>
            g.starSystems.some(s => s.id === universeStore.activeSystem?.id)
          );
          if (galaxy && universeStore.activeGalaxy) {
            const camera = orbitRef.current?.object;
            const controls = orbitRef.current;
            if (!camera || !controls) return;

            const position = universeStore.activeGalaxy.pos;
            const targetPosition = { x: position[0], y: 0, z: position[2] };
            const cameraOffset = { x: position[0], y: 60, z: position[2] + 200 };

            gsap.to(camera.position, {
              x: cameraOffset.x,
              y: cameraOffset.y,
              z: cameraOffset.z,
              duration: 1.2,
              ease: "power2.inOut",
            });

            gsap.to(controls.target, {
              x: targetPosition.x,
              y: targetPosition.y,
              z: targetPosition.z,
              duration: 1.2,
              ease: "power2.inOut",
              onUpdate: () => controls.update(),
              onComplete: () => {
                universeStore.setZoomLevel("galaxy");
                universeStore.setActiveSystem(null);
                
                const targetRoute = `/galaxy/${galaxy.id}`;
                if (window.location.pathname !== targetRoute) {
                  Inertia.visit(targetRoute, {
                    preserveState: true,
                    preserveScroll: true,
                  });
                }
              },
            });
          }
        } else if (universeStore.zoomLevel === "galaxy") {
          // Return to universe view
          returnToUniverseCenter();
        } else if (centeredGalaxyId !== null) {
          // ✅ NEW: If galaxy is centered but not entered, ESC returns to universe
          returnToUniverseCenter();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [universeStore.zoomLevel, universeStore.activeGalaxy, universeStore.activeSystem, centeredGalaxyId]);

/* --------------------------------------------------
   🎯 HANDLE DIRECT NAVIGATION TO SYSTEM VIEW
-------------------------------------------------- */
useEffect(() => {
  console.log("🔍 useEffect triggered:", {
    sceneReady,
    zoomLevel: universeStore.zoomLevel,
    activeSystemId: universeStore.activeSystem?.id,
    hasOrbitRef: !!orbitRef.current
  });

  if (!sceneReady || universeStore.zoomLevel !== "system" || !orbitRef.current) {
    console.log("⏸️ Skipping camera fix");
    return;
  }

  // ✅ Add a small delay to ensure everything is mounted
  const timer = setTimeout(() => {
  

    const camera = orbitRef.current?.object;
    const controls = orbitRef.current;
    
    if (!camera || !controls) {
      console.log("❌ Camera/controls not ready");
      return;
    }

    const systemId = universeStore.activeSystem?.id;
    if (!systemId) {
      console.log("❌ No active system ID");
      return;
    }

    const galaxy = universeConfig.galaxies.find(g =>
      g.starSystems.some(s => s.id === systemId)
    );
    const system = galaxy?.starSystems.find(s => s.id === systemId);

    if (!system) {
      console.log("❌ System not found:", systemId);
      return;
    }

    const [x, y, z] = system.position;

   

    camera.position.set(x, y + 12, z + 18);
    controls.target.set(x, y, z);
    controls.update();

    console.log("✅ Camera positioned at:", camera.position.toArray());
  }, 100); // Small delay

  return () => clearTimeout(timer);

}, [
  sceneReady, 
  universeStore.zoomLevel, 
  universeStore.activeSystem?.id, // ✅ Add this!
  orbitRef.current // ✅ And this
]);

  return (
    <>
    <Canvas
      camera={{ position: [0, 150, 500], fov: 80 }}
      gl={{
        outputColorSpace: "srgb",
        antialias: true,
        powerPreference: "high-performance",
      }}
      style={{ pointerEvents: locked ? 'none' : 'auto' }} // ✅ add this
    >
      <TutorialZoomTracker />

      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 15]} intensity={0.8} />
      <pointLight position={[0, 0, 20]} intensity={2} color="#00ffff" />

      <NebulaBackdrop />
      <Stars radius={400} depth={50} count={3000} factor={6} fade />
      <SparkleFieldGroup />

      {universeStore.zoomLevel === "system" && <AsteroidField count={20} radius={40} repulsionRadius={5} />}
      

      <OrbitControls
        ref={orbitRef}
        enablePan={false}
        enableZoom={!locked}  // ✅ Disable zoom if locked
        enabled={!locked}      // ✅ Disable all controls if locked
        autoRotate={locked}    // ✅ Auto-rotate when locked
        minDistance={universeStore.zoomLevel === "system" ? 10 : 100}  // ✅ Was 8, now 3
        maxDistance={universeStore.zoomLevel === "system" ? 50 : 200} // ✅ Was 40, now 35
      />

      {/* ============================================
          🌌 UNIVERSE VIEW
          ============================================ */}
      {universeStore.zoomLevel === "universe" && (
        <Suspense fallback={null}>
          {/* ✅ EVOLVED LIGHT CORE */}
          <LightCore systemLight={systemLight} />

          {/* ✅ INTERACTIVE SPIRAL GALAXIES - TWO-STAGE CLICK */}
          {universeConfig.galaxies.map((galaxy) => (
            <SpiralGalaxy
              key={galaxy.id}
              position={galaxy.position}
              color={galaxy.color}
              label={galaxy.label}
              description={galaxy.description}
              size={20}
              isCentered={centeredGalaxyId === galaxy.id}
              onClick={() => handleGalaxyClick(galaxy.id, galaxy.position)}
              onDoubleClick={() => fastZoomIntoGalaxy(galaxy.id, galaxy.position)}
              onPointerOver={(e) => {
                 document.body.style.cursor = "pointer";
                setHoveredGalaxy(galaxy); // ✅ This is used by GalaxyLabelsOverlay
                e.stopPropagation();
              }}
              onPointerOut={() => {
                 document.body.style.cursor = "auto";
                setHoveredGalaxy(null); // ✅ Clear hover state
              }}
            />
          ))}
        </Suspense>
      )}

      {/* ============================================
          ⭐ GALAXY VIEW
          ============================================ */}
      {universeStore.zoomLevel === "galaxy" && universeStore.activeGalaxy && (
        <Suspense fallback={null}>
          <RisingStarGrid
            galaxyId={universeStore.activeGalaxy.id}
            onSelect={zoomIntoSystem}
          />
        </Suspense>
      )}

      {/* ============================================
          🪐 SYSTEM VIEW
          ============================================ */}
      {universeStore.zoomLevel === "system" && universeStore.activeSystem && (
        <Suspense fallback={null}>
          {(() => {
            const galaxy = universeConfig.galaxies.find(g =>
              g.starSystems.some(s => s.id === universeStore.activeSystem.id)
            );
            const system = galaxy?.starSystems.find(s => s.id === universeStore.activeSystem.id);
            
            if (!system) return null;

            return (
              <group position={system.position}>
                <FloatingNodeGrid
                  activeSystem={system.id}
                  nodes={system.nodes}
                  orbitRadius={system.orbitRadius}
                  onSelect={(nodeId) => {
                    const node = system.nodes.find(n => n.id === nodeId);
                    if (node) {
                      universeStore.setZoomLevel("node");
                      Inertia.visit(node.route);
                    }
                  }}
                />
              </group>
            );
          })()}
        </Suspense>
      )}
    </Canvas>

    {universeStore.zoomLevel === "universe" && sceneReady && (
      <GalaxyLabelsOverlay
        galaxies={universeConfig.galaxies}
        camera={orbitRef.current?.object}
        centeredGalaxyId={centeredGalaxyId}
        hoveredGalaxyId={hoveredGalaxy?.id}
      />
    )}
    </>
  );
});

export default UniverseScene;