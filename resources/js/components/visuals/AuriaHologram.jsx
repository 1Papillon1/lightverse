import React, { useRef } from "react";
import { observer } from "mobx-react-lite";
import { useRootStore } from "@/stores/RootStore";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";


const AuriaModel = () => {
  const group = useRef();
  const { scene } = useGLTF("/resources/models/auria/auria_improved.glb");

  // Simple breathing animation
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const scale = 16 + Math.sin(t * 1.5) * 0.12; // soft breathing
    if (group.current) {
      group.current.scale.set(scale, scale, scale);
    }
  });

  return <primitive ref={group} object={scene}  rotation={[0, -Math.PI / 2, 0]} position={[0, -7, 0]} />;
};

const AuriaHologram = observer(() => {
  const { narratorStore } = useRootStore();
  const visible = narratorStore.isSpeaking && !narratorStore.isMuted;

  return (
    <div className={"auria" + (visible ? " auria--visible" : "")}>
      {visible && (
        <Canvas
          camera={{ position: [0, 4, 15] }}
          style={{
            width: "100%",
            height: "100%",
            filter: "drop-shadow(0 0 15px #00f0ff80)"
          }}
        >
          <ambientLight intensity={0.8} />
          <directionalLight position={[2, 2, 2]} intensity={1.2} />
          <AuriaModel />
          <OrbitControls enableZoom={false} />
        </Canvas>
      )}

      {/* Optional hologram effects if you still want them */}
      <div className="auria__scanlines"></div>
      <div className="auria__glow"></div>
    </div>
  );
});

export default AuriaHologram;