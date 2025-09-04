// UniverseScene.jsx
import { useEffect, useRef, useState, useContext } from "react";
import { Canvas } from "@react-three/fiber";
import FloatingNodeGrid from "@/components/layout/FloatingNodeGrid";
import { Stars, OrbitControls } from "@react-three/drei";
import gsap from "gsap";
import { RootStoreContext } from "@/stores/RootStore";
import LoadingScreen from "@/components/transitions/LoadingScreen";
import { Inertia } from "@inertiajs/inertia";
import TutorialZoomTracker from "../trackers/TutorialZoomTracker";
import { usePage } from "@inertiajs/react";
import { TextureLoader } from "three";
import { useLoader, useThree } from "@react-three/fiber";
import NebulaBackdrop from "@/components/visuals/NebulaBackdrop";

export default function UniverseScene({ onSceneSelect }) {
  const orbitRef = useRef();
  const targetRef = useRef([0, 0, 0]);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [localReady, setLocalReady] = useState(false);
  const store = useContext(RootStoreContext).marketStore;
  const { url } = usePage();
  

  // Reset camera to default when navigating
  const resetCamera = () => {
    const camera = orbitRef.current?.object;
    if (!camera) return;
    gsap.to(camera.position, {
      x: 0,
      y: 0,
      z: 12,
      duration: 1,
      ease: "power2.out"
    });
    gsap.to(targetRef.current, {
      0: 0,
      1: 0,
      2: 0,
      duration: 1,
      ease: "power2.out",
      onUpdate: () => {
        orbitRef.current.target.set(...targetRef.current);
      }
    });
    store.uiStore.setActiveNode(null);
    if (onSceneSelect) onSceneSelect("market"); // default scene
  };

    useEffect(() => {
    if (url === "/" || url.startsWith("/dashboard")) {
      resetCamera();
    }
  }, [url]);

  const textures = useLoader(TextureLoader, [
    "/textures/wallet_node_4k.jpg",
    "/textures/market_node_4k.jpg",
    "/textures/contract_node_4k.jpg",
    "/textures/roadmap_node_4k.jpg",
    "/textures/ai_node_4k.jpg"
  ]);

  useEffect(() => {
    if (textures.length === 5 && !mounted) {
      setMounted(true);
      setTimeout(() => {
        store.setSceneReady(true);
        setLocalReady(true);
      }, 500); 
    }
  }, [textures, mounted, store]);

 const handleNodeClick = (id, pos, route) => {
  const camera = orbitRef.current.object;
  const zoomFactor = 2;

  gsap.to(camera.position, {
    x: pos[0] * zoomFactor,
    y: pos[1] * zoomFactor,
    z: pos[2] * zoomFactor,
    duration: 1.3,
    ease: "power2.out",
  });

  gsap.to(targetRef.current, {
    0: pos[0],
    1: pos[1],
    2: pos[2],
    duration: 1.2,
    ease: "power2.out",
    onUpdate: () => {
      orbitRef.current.target.set(...targetRef.current);
    },
    onComplete: () => {
      if (route) Inertia.visit(route);
    },
  });


   store.uiStore.setActiveNode(id);

  if (onSceneSelect) onSceneSelect(id);
};


  return (
    <>
      {!localReady && <LoadingScreen />} 
      <Canvas camera={{ position: [0, 3, 12], fov: 80 }} gl={{ toneMappingExposure: 2 }}>
        <TutorialZoomTracker />
        
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <pointLight position={[0, 0, 8]} intensity={1.5} />

        <NebulaBackdrop />

        <Stars radius={200} depth={20} count={8000} factor={4} fade />
      

        <OrbitControls ref={orbitRef} enablePan={false} enableZoom={true}
         minDistance={3}
            maxDistance={18}
        />
        <FloatingNodeGrid onSelect={handleNodeClick} onNodeHover={setHoveredNode} />
      </Canvas>
    </>
  );
}
