import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Terrain from "@/components/visuals/Terrain";
import RotatingStars from "@/components/visuals/RotatingStars"; // wherever you place it
import NebulaBackdrop from "./NebulaBackdrop";

export default function UniverseBackdrop({ mode = "token" }) {
  return (
    <div className="canvas__background">
      <Canvas camera={{ position: [0, 2, 8], fov: 75 }}>
        <ambientLight intensity={3} />
        <directionalLight position={[1, 5, 0]} intensity={15} castShadow />
        <pointLight position={[0, 5, 0]} intensity={3} color="#8f8fff" />

          {/* /*  <SpaceGradientBackground />
        <fog attach="fog" args={["#0b0b2e", 1, 50]} />
            <*/}

        <RotatingStars />  ✅ Now only stars move 

        <NebulaBackdrop rotate/>

        <Terrain type={mode} />

        <OrbitControls enablePan={false} enableZoom={false} enableRotate={false} />
      </Canvas>
    </div>
  );
}