// FloatingNode.jsx
import React, { useRef, useState } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import { Html } from "@react-three/drei";





export default function FloatingNode({ type, position, onClick }) {
  const mesh = useRef();

  const [hovered, setHovered] = useState(false);

  const textures = {
    wallet: useLoader(TextureLoader, "/textures/wallet_node_4k.jpg"),
    token: useLoader(TextureLoader, "/textures/market_node_4k.jpg"),
    contract: useLoader(TextureLoader, "/textures/contract_node_4k.jpg"),
    roadmap: useLoader(TextureLoader, "/textures/roadmap_node_4k.jpg"),
    ai: useLoader(TextureLoader, "/textures/ai_node_4k.jpg"),
  };

  useFrame(({ clock }) => {
  const time = clock.getElapsedTime();

  // Pulse effect for emissive intensity
  const pulse = 0.2 + Math.sin(time * 1.2) * 0.12;

  // Optional: subtle breathing scale
  const scale = 1 + Math.sin(time * 2) * 0.03;

  if (mesh.current) {
    mesh.current.material.emissiveIntensity = hovered ? 0.2 : 0;
    if (hovered) {
      mesh.current.scale.set(scale, scale, scale);
    }
  }
});

  return (
    <mesh
      ref={mesh}
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[0.8, 64, 64]}/>
      <meshStandardMaterial
        map={textures[type]}
        metalness={0.2}
        roughness={0.9}
        emissive={"#552288"}
        emissiveIntensity={0.4}
      />
      
      {hovered && (
        <Html
          position={[0, 1, 0]} // Offset to the right + above the sphere
          distanceFactor={10}
          style={{
            background: "rgba(0, 0, 0, 0.75)",
            fontFamily: "Orbitron, monospace",
            color: "#FF6EC7",
            textShadow: "0 0 4px #FF00FF",
            padding: "8px 16px",
            borderRadius: "8px",
            border: "1px solid #FF00FF",
            pointerEvents: "none",
            width: "250px",
            fontSize: "24px",
            textAlign: "center",
          }}
          occlude
          center
         
        >
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Html>
      )}
    </mesh>
  );
}
