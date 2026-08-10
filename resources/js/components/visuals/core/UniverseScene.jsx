// resources/js/components/visuals/core/UniverseScene.jsx

import {
  useEffect,
  useRef,
  useState,
  useContext,
  Suspense,
} from "react";

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
import GalaxyLabelsOverlay from "@/components/ui/GalaxyLabelsOverlay";


const UniverseScene = observer(({ onSceneSelect, locked = false }) => {

  /*
  |--------------------------------------------------------------------------
  | INERTIA PAGE STATE
  |--------------------------------------------------------------------------
  |
  | URL više NIJE izveden iz UniverseStorea.
  | Inertia je source of truth.
  |
  */

  const { props } = usePage();

  const {
    galaxy: pageGalaxy,
    system: pageSystem,
    node: pageNode,
    light,
  } = props;


  /*
  |--------------------------------------------------------------------------
  | STORES
  |--------------------------------------------------------------------------
  |
  | UniverseStore više nije potreban.
  | Ostavljamo samo storeove koji nisu odgovorni za navigaciju.
  |
  */

  const {
    marketStore,
    visualLoadStore,
  } = useContext(RootStoreContext);


  /*
  |--------------------------------------------------------------------------
  | ROUTE → VIEW
  |--------------------------------------------------------------------------
  */

  const getId = (value) => {
    if (!value) return null;

    if (typeof value === "string") {
      return value;
    }

    if (typeof value === "object") {
      return (
        value.id ??
        value.slug ??
        value.symbol ??
        value.name ??
        null
      );
    }

    return null;
  };


  const galaxyIdFromPage = getId(pageGalaxy);
  const systemIdFromPage = getId(pageSystem);
  const nodeIdFromPage = getId(pageNode);


  /*
  |--------------------------------------------------------------------------
  | FIND DATA FROM UNIVERSE CONFIG
  |--------------------------------------------------------------------------
  */

  let activeGalaxy = null;
  let activeSystem = null;
  let activeNode = null;


  // First try galaxy directly from Inertia props
  if (galaxyIdFromPage) {
    activeGalaxy = universeConfig.galaxies.find(
      (g) => g.id === galaxyIdFromPage
    );
  }


  // Find system
  if (systemIdFromPage) {

    for (const galaxy of universeConfig.galaxies) {

      const system = galaxy.starSystems?.find(
        (s) => s.id === systemIdFromPage
      );

      if (system) {
        activeSystem = system;

        // If backend did not provide galaxy,
        // derive it from the system.
        if (!activeGalaxy) {
          activeGalaxy = galaxy;
        }

        break;
      }
    }
  }


  // Find node
  if (nodeIdFromPage) {

    for (const galaxy of universeConfig.galaxies) {

      for (const system of galaxy.starSystems ?? []) {

        const node = system.nodes?.find(
          (n) => n.id === nodeIdFromPage
        );

        if (node) {

          activeNode = node;

          // Derive system if necessary
          if (!activeSystem) {
            activeSystem = system;
          }

          // Derive galaxy if necessary
          if (!activeGalaxy) {
            activeGalaxy = galaxy;
          }

          break;
        }
      }

      if (activeNode) break;
    }
  }


  /*
  |--------------------------------------------------------------------------
  | CURRENT VIEW
  |--------------------------------------------------------------------------
  |
  | Priority:
  |
  | node
  | ↓
  | system
  | ↓
  | galaxy
  | ↓
  | universe
  |
  */

  const view =
    activeNode
      ? "node"
      : activeSystem
        ? "system"
        : activeGalaxy
          ? "galaxy"
          : "universe";


  /*
  |--------------------------------------------------------------------------
  | DEBUG
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    console.log("🌌 UNIVERSE SCENE ROUTE STATE", {
      pathname: window.location.pathname,

      props: {
        galaxy: pageGalaxy,
        system: pageSystem,
        node: pageNode,
      },

      resolved: {
        galaxyId: activeGalaxy?.id ?? null,
        systemId: activeSystem?.id ?? null,
        nodeId: activeNode?.id ?? null,
      },

      view,
    });

  }, [
    pageGalaxy,
    pageSystem,
    pageNode,
    view,
  ]);


  /*
  |--------------------------------------------------------------------------
  | REFS / LOCAL UI STATE
  |--------------------------------------------------------------------------
  */

  const orbitRef = useRef(null);

  const [sceneReady, setSceneReady] = useState(false);

  // UI only:
  // first click = center
  // second click = enter
  const [centeredGalaxyId, setCenteredGalaxyId] = useState(null);

  // UI only
  const [hoveredGalaxy, setHoveredGalaxy] = useState(null);


  /*
  |--------------------------------------------------------------------------
  | SYSTEM LIGHT
  |--------------------------------------------------------------------------
  */

  const systemLight = light?.system?.total || 0;


  /*
  |--------------------------------------------------------------------------
  | SCENE READY
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    marketStore.setSceneReady(true);

    setSceneReady(true);

    visualLoadStore.markUniverseReady();

  }, [
    marketStore,
    visualLoadStore,
  ]);


  /*
  |--------------------------------------------------------------------------
  | RESET LOCAL GALAXY CENTER WHEN LEAVING UNIVERSE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    if (view !== "universe") {
      setCenteredGalaxyId(null);
      setHoveredGalaxy(null);
    }

  }, [view]);


  /*
  |--------------------------------------------------------------------------
  | CAMERA POSITIONING
  |--------------------------------------------------------------------------
  */

  const positionCameraForView = () => {

    const controls = orbitRef.current;

    if (!controls) {
      console.log("📷 Camera positioning skipped - controls not ready");
      return;
    }

    const camera = controls.object;

    if (!camera) {
      console.log("📷 Camera positioning skipped - camera not ready");
      return;
    }


    /*
    |--------------------------------------------------------------------------
    | UNIVERSE
    |--------------------------------------------------------------------------
    */

    if (view === "universe") {

      camera.position.set(
        0,
        150,
        500
      );

      controls.target.set(
        0,
        0,
        0
      );

      controls.update();

      console.log("📷 Camera → UNIVERSE");

      return;
    }


    /*
    |--------------------------------------------------------------------------
    | GALAXY
    |--------------------------------------------------------------------------
    */

    if (view === "galaxy" && activeGalaxy) {

      const [x, y, z] = activeGalaxy.position;

      camera.position.set(
        x,
        y + 60,
        z + 200
      );

      controls.target.set(
        x,
        y,
        z
      );

      controls.update();

      console.log("📷 Camera → GALAXY", {
        galaxy: activeGalaxy.id,
        position: activeGalaxy.position,
      });

      return;
    }


    /*
    |--------------------------------------------------------------------------
    | SYSTEM
    |--------------------------------------------------------------------------
    */

    if (view === "system" && activeSystem) {

      const [x, y, z] = activeSystem.position;

      camera.position.set(
        x,
        y + 12,
        z + 18
      );

      controls.target.set(
        x,
        y,
        z
      );

      controls.update();

      console.log("📷 Camera → SYSTEM", {
        system: activeSystem.id,
        position: activeSystem.position,
      });

      return;
    }


    /*
    |--------------------------------------------------------------------------
    | NODE
    |--------------------------------------------------------------------------
    |
    | Node page itself does not render the 3D scene through Dashboard,
    | but if UniverseScene is ever kept mounted, we preserve system camera.
    |
    */

    if (view === "node" && activeSystem) {

      const [x, y, z] = activeSystem.position;

      camera.position.set(
        x,
        y + 12,
        z + 18
      );

      controls.target.set(
        x,
        y,
        z
      );

      controls.update();

      console.log("📷 Camera → NODE / SYSTEM CONTEXT", {
        node: activeNode?.id,
        system: activeSystem.id,
      });

    }

  };


  /*
  |--------------------------------------------------------------------------
  | POSITION CAMERA WHEN ROUTE / VIEW CHANGES
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    if (!sceneReady) return;

    /*
     * OrbitControls ref may not exist during the first effect pass.
     * Give React/R3F one frame to attach it.
     */

    const frame = requestAnimationFrame(() => {

      positionCameraForView();

    });

    return () => cancelAnimationFrame(frame);

  }, [
    sceneReady,
    view,
    activeGalaxy?.id,
    activeSystem?.id,
    activeNode?.id,
  ]);


  /*
  |--------------------------------------------------------------------------
  | RETURN TO UNIVERSE
  |--------------------------------------------------------------------------
  */

  const returnToUniverseCenter = () => {

    const controls = orbitRef.current;

    if (!controls) return;

    const camera = controls.object;

    setCenteredGalaxyId(null);

    gsap.killTweensOf(camera.position);
    gsap.killTweensOf(controls.target);


    gsap.to(camera.position, {

      x: 0,
      y: 150,
      z: 500,

      duration: 1.2,

      ease: "power2.inOut",

    });


    gsap.to(controls.target, {

      x: 0,
      y: 0,
      z: 0,

      duration: 1.2,

      ease: "power2.inOut",

      onUpdate: () => controls.update(),

      onComplete: () => {

        controls.update();

      },

    });


    /*
     * IMPORTANT:
     *
     * No UniverseStore mutation.
     *
     * URL becomes the state.
     */

    if (window.location.pathname !== "/dashboard") {

      Inertia.visit("/dashboard", {
        preserveState: true,
        preserveScroll: true,
      });

    }

  };


  /*
  |--------------------------------------------------------------------------
  | CENTER GALAXY
  |--------------------------------------------------------------------------
  */

  const centerGalaxy = (galaxyId, position) => {

    const controls = orbitRef.current;

    if (!controls) return;

    const camera = controls.object;

    const galaxy = universeConfig.galaxies.find(
      (g) => g.id === galaxyId
    );

    if (!galaxy) return;


    console.log(
      "🎯 Centering galaxy:",
      galaxyId
    );


    setCenteredGalaxyId(galaxyId);


    const targetPosition = {

      x: position[0],
      y: position[1],
      z: position[2],

    };


    const isVertical =
      Math.abs(position[1]) > Math.abs(position[0]) &&
      Math.abs(position[1]) > Math.abs(position[2]);


    let cameraOffset;


    if (isVertical) {

      cameraOffset = {

        x: position[0] + 150,
        y: position[1],
        z: position[2] + 100,

      };

    } else {

      cameraOffset = {

        x: position[0],
        y: position[1] + 60,
        z: position[2] + 200,

      };

    }


    gsap.killTweensOf(camera.position);
    gsap.killTweensOf(controls.target);


    gsap.to(camera.position, {

      x: cameraOffset.x,
      y: cameraOffset.y,
      z: cameraOffset.z,

      duration: 1.5,

      ease: "power2.inOut",

    });


    gsap.to(controls.target, {

      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,

      duration: 1.5,

      ease: "power2.inOut",

      onUpdate: () => controls.update(),

    });

  };


  /*
  |--------------------------------------------------------------------------
  | ENTER GALAXY
  |--------------------------------------------------------------------------
  */

  const enterGalaxy = (galaxyId) => {

    const galaxy = universeConfig.galaxies.find(
      (g) => g.id === galaxyId
    );

    if (!galaxy) return;


    console.log(
      "🚪 ENTER GALAXY:",
      galaxyId
    );


    /*
     * URL changes.
     *
     * Backend returns new Inertia props.
     * usePage() updates.
     * view becomes "galaxy".
     */

    Inertia.visit(galaxy.route, {

      preserveState: false,
      preserveScroll: true,

    });

  };


  /*
  |--------------------------------------------------------------------------
  | GALAXY CLICK
  |--------------------------------------------------------------------------
  */

  const handleGalaxyClick = (
    galaxyId,
    position
  ) => {

    if (centeredGalaxyId === galaxyId) {

      // Second click
      enterGalaxy(galaxyId);

    } else {

      // First click
      centerGalaxy(
        galaxyId,
        position
      );

    }

  };


  /*
  |--------------------------------------------------------------------------
  | DOUBLE CLICK GALAXY
  |--------------------------------------------------------------------------
  */

  const fastZoomIntoGalaxy = (galaxyId) => {

    const galaxy = universeConfig.galaxies.find(
      (g) => g.id === galaxyId
    );

    if (!galaxy) return;


    console.log(
      "⚡ FAST ENTER GALAXY:",
      galaxyId
    );


    setCenteredGalaxyId(galaxyId);


    Inertia.visit(galaxy.route, {

      preserveState: false,
      preserveScroll: true,

    });

  };


  /*
  |--------------------------------------------------------------------------
  | ENTER SYSTEM
  |--------------------------------------------------------------------------
  */

  const zoomIntoSystem = (
    systemId
  ) => {

    const galaxy = universeConfig.galaxies.find(
      (g) =>
        g.starSystems?.some(
          (s) => s.id === systemId
        )
    );


    const system = galaxy?.starSystems?.find(
      (s) => s.id === systemId
    );


    if (!system) {

      console.error(
        "❌ Cannot find system:",
        systemId
      );

      return;

    }


    console.log(
      "⭐ ENTER SYSTEM:",
      systemId
    );


    /*
     * Again:
     *
     * NO STORE MUTATION.
     *
     * URL is the state.
     */

    Inertia.visit(system.route, {

      preserveState: false,
      preserveScroll: true,

    });


    onSceneSelect?.(
      systemId
    );

  };


  /*
  |--------------------------------------------------------------------------
  | KEYBOARD NAVIGATION
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    const handleKeyPress = (event) => {

      if (event.key !== "Escape") {
        return;
      }


      /*
      |--------------------------------------------------------------------------
      | SYSTEM → GALAXY
      |--------------------------------------------------------------------------
      */

      if (view === "system" && activeGalaxy) {

        const controls = orbitRef.current;

        if (!controls) return;

        const camera = controls.object;

        const [
          x,
          y,
          z
        ] = activeGalaxy.position;


        gsap.killTweensOf(camera.position);
        gsap.killTweensOf(controls.target);


        gsap.to(camera.position, {

          x,
          y: y + 60,
          z: z + 200,

          duration: 1.2,

          ease: "power2.inOut",

        });


        gsap.to(controls.target, {

          x,
          y,
          z,

          duration: 1.2,

          ease: "power2.inOut",

          onUpdate: () =>
            controls.update(),

          onComplete: () => {

            Inertia.visit(
              activeGalaxy.route,
              {
                preserveState: false,
                preserveScroll: true,
              }
            );

          },

        });


        return;

      }


      /*
      |--------------------------------------------------------------------------
      | GALAXY → UNIVERSE
      |--------------------------------------------------------------------------
      */

      if (view === "galaxy") {

        returnToUniverseCenter();

        return;

      }


      /*
      |--------------------------------------------------------------------------
      | CENTERED GALAXY → UNIVERSE
      |--------------------------------------------------------------------------
      */

      if (
        view === "universe" &&
        centeredGalaxyId !== null
      ) {

        returnToUniverseCenter();

      }

    };


    window.addEventListener(
      "keydown",
      handleKeyPress
    );


    return () => {

      window.removeEventListener(
        "keydown",
        handleKeyPress
      );

    };

  }, [
    view,
    activeGalaxy?.id,
    activeSystem?.id,
    centeredGalaxyId,
  ]);


  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (

    <>

      <Canvas

        camera={{
          position: [0, 150, 500],
          fov: 80,
        }}

        gl={{
          outputColorSpace: "srgb",
          antialias: true,
          powerPreference: "high-performance",
        }}

        style={{
          pointerEvents:
            locked
              ? "none"
              : "auto",
        }}

      >

        <TutorialZoomTracker />


        <ambientLight
          intensity={0.5}
        />

        <directionalLight
          position={[10, 10, 15]}
          intensity={0.8}
        />

        <pointLight
          position={[0, 0, 20]}
          intensity={2}
          color="#00ffff"
        />


        <NebulaBackdrop />

        <Stars
          radius={400}
          depth={50}
          count={3000}
          factor={6}
          fade
        />

        <SparkleFieldGroup />


        {/* ==================================================
            SYSTEM EFFECTS
        ================================================== */}

        {view === "system" && (

          <AsteroidField
            count={20}
            radius={40}
            repulsionRadius={5}
          />

        )}


        {/* ==================================================
            CONTROLS
        ================================================== */}

        <OrbitControls

          ref={orbitRef}

          enablePan={false}

          enableZoom={!locked}

          enabled={!locked}

          autoRotate={locked}

          minDistance={
            view === "system"
              ? 10
              : 100
          }

          maxDistance={
            view === "system"
              ? 50
              : 200
          }

        />


        {/* ==================================================
            🌌 UNIVERSE VIEW
        ================================================== */}

        {view === "universe" && (

          <Suspense fallback={null}>

            <LightCore
              systemLight={systemLight}
            />


            {universeConfig.galaxies.map(
              (galaxy) => (

                <SpiralGalaxy

                  key={galaxy.id}

                  position={
                    galaxy.position
                  }

                  color={
                    galaxy.color
                  }

                  label={
                    galaxy.label
                  }

                  description={
                    galaxy.description
                  }

                  size={20}

                  isCentered={
                    centeredGalaxyId ===
                    galaxy.id
                  }

                  onClick={() =>
                    handleGalaxyClick(
                      galaxy.id,
                      galaxy.position
                    )
                  }

                  onDoubleClick={() =>
                    fastZoomIntoGalaxy(
                      galaxy.id
                    )
                  }

                  onPointerOver={(e) => {

                    document.body.style.cursor =
                      "pointer";

                    setHoveredGalaxy(
                      galaxy
                    );

                    e.stopPropagation();

                  }}

                  onPointerOut={() => {

                    document.body.style.cursor =
                      "auto";

                    setHoveredGalaxy(
                      null
                    );

                  }}

                />

              )
            )}

          </Suspense>

        )}


        {/* ==================================================
            ⭐ GALAXY VIEW
        ================================================== */}

        {view === "galaxy" &&
          activeGalaxy && (

            <Suspense fallback={null}>

              <RisingStarGrid

                galaxyId={
                  activeGalaxy.id
                }

                onSelect={
                  zoomIntoSystem
                }

              />

            </Suspense>

          )
        }


        {/* ==================================================
            🪐 SYSTEM VIEW
        ================================================== */}

        {view === "system" &&
          activeSystem && (

            <Suspense fallback={null}>

              <group
                position={
                  activeSystem.position
                }
              >

                <FloatingNodeGrid

                  activeSystem={
                    activeSystem.id
                  }

                  nodes={
                    activeSystem.nodes
                  }

                  orbitRadius={
                    activeSystem.orbitRadius
                  }

                  onSelect={(nodeId) => {

                    const node =
                      activeSystem.nodes?.find(
                        (n) =>
                          n.id === nodeId
                      );


                    if (!node) {
                      return;
                    }


                    console.log(
                      "🪐 ENTER NODE:",
                      node.id
                    );


                    Inertia.visit(
                      node.route,
                      {
                        preserveState: false,
                        preserveScroll: true,
                      }
                    );

                  }}

                />

              </group>

            </Suspense>

          )
        }


      </Canvas>


      {/* ==================================================
          GALAXY LABELS
      ================================================== */}

      {view === "universe" &&
        sceneReady && (

          <GalaxyLabelsOverlay

            galaxies={
              universeConfig.galaxies
            }

            camera={
              orbitRef.current?.object
            }

            centeredGalaxyId={
              centeredGalaxyId
            }

            hoveredGalaxyId={
              hoveredGalaxy?.id
            }

          />

        )
      }

    </>

  );

});


export default UniverseScene;