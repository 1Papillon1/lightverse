// resources/js/components/visuals/core/UniverseScene.jsx
import { useEffect, useRef, useState, useContext, Suspense } from "react";
import { observer } from "mobx-react-lite";
import { Canvas } from "@react-three/fiber";
import { Stars, OrbitControls, Html } from "@react-three/drei";
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

const UniverseScene = observer(({ onSceneSelect }) => {
  const orbitRef = useRef();
  const targetRef = useRef([0, 0, 0]);
  
  const { universeStore, marketStore, visualLoadStore } = useContext(RootStoreContext);
  const [sceneReady, setSceneReady] = useState(false);

  useEffect(() => {
    marketStore.setSceneReady(true);
    setSceneReady(true);
    visualLoadStore.markUniverseReady();
  }, []);

  useEffect(() => {
    if (!sceneReady) return;
    universeStore.detectFromUrl();
  }, [sceneReady]);

  /* --------------------------------------------------
     🌌 ZOOM INTO GALAXY
  -------------------------------------------------- */
  const zoomIntoGalaxy = (galaxyId, position) => {
    const camera = orbitRef.current?.object;
    if (!camera) return;

    const galaxy = universeConfig.galaxies.find(g => g.id === galaxyId);
    if (!galaxy) return;

    universeStore.setActiveGalaxy({ id: galaxyId, pos: position });
    universeStore.setZoomLevel("galaxy");

    gsap.to(camera.position, {
      x: position[0],
      y: 60,
      z: position[2] + 200,
      duration: 1.5,
      ease: "power2.out",
    });

    gsap.to(targetRef.current, {
      0: position[0],
      1: 0,
      2: position[2],
      duration: 1.5,
      ease: "power2.out",
      onUpdate: () => orbitRef.current?.target.set(...targetRef.current),
      onComplete: () => {
        Inertia.visit(galaxy.route, {
          preserveState: true,
          preserveScroll: true,
        });
      },
    });
  };

  /* --------------------------------------------------
     ⭐ ZOOM INTO STAR SYSTEM
  -------------------------------------------------- */
  const zoomIntoSystem = (systemId, position) => {
    const camera = orbitRef.current?.object;
    if (!camera) return;

    const galaxy = universeConfig.galaxies.find(g => 
      g.starSystems.some(s => s.id === systemId)
    );
    
    const system = galaxy?.starSystems.find(s => s.id === systemId);
    if (!system) return;

    universeStore.setActiveSystem({ id: systemId, pos: position });
    universeStore.setZoomLevel("system");

    gsap.to(camera.position, {
      x: position[0] * 1.3,
      y: position[1] * 0.6,
      z: position[2] * 0.9,
      duration: 1.4,
      ease: "power2.out",
    });

    gsap.to(targetRef.current, {
      0: position[0],
      1: position[1],
      2: position[2],
      duration: 1.4,
      ease: "power2.out",
      onUpdate: () => orbitRef.current?.target.set(...targetRef.current),
      onComplete: () => {
        Inertia.visit(system.route, {
          preserveState: true,
          preserveScroll: true,
        });
        onSceneSelect?.(systemId);
      },
    });
  };

  return (
    <Canvas
      camera={{ position: [0, 150, 500], fov: 80 }}
      gl={{
        outputColorSpace: "srgb",
        antialias: true,
        powerPreference: "high-performance",
      }}
    >
      <TutorialZoomTracker />

      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 15]} intensity={0.8} />
      <pointLight position={[0, 0, 20]} intensity={2} color="#00ffff" />

      <NebulaBackdrop />
      <Stars radius={400} depth={50} count={3000} factor={6} fade />
      <SparkleFieldGroup />
      <AsteroidField count={50} radius={600} repulsionRadius={150} />

      <OrbitControls
        ref={orbitRef}
        enablePan={false}
        enableZoom
        minDistance={universeStore.zoomLevel === "system" ? 20 : 200}
        maxDistance={universeStore.zoomLevel === "system" ? 50 : 600}
      />

      {/* ============================================
          🌌 UNIVERSE VIEW - Show both galaxies
          ============================================ */}
      {universeStore.zoomLevel === "universe" && (
        <Suspense fallback={null}>
          {/* Central Universe Core */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[5, 32, 32]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#00ffff"
              emissiveIntensity={2}
              transparent
              opacity={0.3}
            />
          </mesh>

          <Html position={[0, 20, 0]} center>
            <div style={{
              color: "#ffffff",
              fontFamily: "Orbitron, sans-serif",
              fontSize: "2rem",
              textShadow: "0 0 20px #00ffff",
              textAlign: "center",
              pointerEvents: "none",
              fontWeight: "bold"
            }}>
              LIGHTVERSE
            </div>
          </Html>

          {/* Render Galaxy Cores */}
          {universeConfig.galaxies.map((galaxy) => (
            <group key={galaxy.id} position={galaxy.position}>
              <mesh
                onClick={() => zoomIntoGalaxy(galaxy.id, galaxy.position)}
                onPointerOver={(e) => {
                  document.body.style.cursor = "pointer";
                  e.stopPropagation();
                }}
                onPointerOut={() => {
                  document.body.style.cursor = "auto";
                }}
              >
                <sphereGeometry args={[20, 32, 32]} />
                <meshStandardMaterial
                  color={galaxy.color}
                  emissive={galaxy.color}
                  emissiveIntensity={1.5}
                  transparent
                  opacity={0.7}
                />
              </mesh>

              <Html position={[0, 30, 0]} center>
                <div style={{
                  color: galaxy.color,
                  fontFamily: "Orbitron, sans-serif",
                  fontSize: "1.5rem",
                  textShadow: `0 0 16px ${galaxy.color}`,
                  textAlign: "center",
                  pointerEvents: "none",
                  fontWeight: "bold"
                }}>
                  {galaxy.label}
                  <div style={{ fontSize: "0.8rem", marginTop: "8px", opacity: 0.8 }}>
                    {galaxy.description}
                  </div>
                </div>
              </Html>
            </group>
          ))}
        </Suspense>
      )}

      {/* ============================================
          ⭐ GALAXY VIEW - Show star systems
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
          🪐 SYSTEM VIEW - Show orbiting nodes
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
  );
});

export default UniverseScene;