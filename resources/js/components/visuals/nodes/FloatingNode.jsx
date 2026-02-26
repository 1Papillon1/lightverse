// resources/js/components/visuals/nodes/FloatingNode.jsx
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from 'three';

const FloatingNode = ({ nodeData, systemId, position, onSelect }) => {
  const mesh = useRef();
  const glowRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    // Gentle breathing animation
    if (mesh.current) {
      const scale = 1 + Math.sin(clock.getElapsedTime() * 1.5) * 0.05;
      mesh.current.scale.set(scale, scale, scale);
    }
    
    // Glow pulse on hover
    if (glowRef.current && hovered) {
      const pulse = 1 + Math.sin(clock.getElapsedTime() * 3) * 0.2;
      glowRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    onSelect?.(nodeData.id);
  };

  const handlePointerOver = (e) => {
    e.stopPropagation();
    document.body.style.cursor = "pointer";
    setHovered(true);
  };

  const handlePointerOut = () => {
    document.body.style.cursor = "auto";
    setHovered(false);
  };

  return (
    <group position={position}>
      {/* ✅ MAIN PLANET (much bigger) */}
      <mesh
        ref={mesh}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshStandardMaterial
          color={hovered ? "#66ffff" : "#1a4d5c"}
          emissive={hovered ? "#00ffff" : "#003344"}
          emissiveIntensity={hovered ? 2.5 : 1.5}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>

      {/* ✅ GLOW LAYER (visible from far) */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[3.2, 32, 32]} />
        <meshBasicMaterial
          color="#00ffff"
          transparent
          opacity={hovered ? 0.4 : 0.2}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* ✅ LABEL (always visible, not just on hover) */}
      <Html 
        distanceFactor={8} 
        position={[0, 2.5, 0]} 
        center
        style={{
          transition: 'all 0.3s ease',
          opacity: hovered ? 1 : 0.7,
        }}
      >
        <div style={{
          color: hovered ? "#ffffff" : "#b8eaff",
          fontFamily: "Rajdhani, sans-serif",
          fontSize: "1rem",
          fontWeight: "bold",
          textShadow: hovered 
            ? "0 0 12px #00ffff, 0 0 24px #00ffff" 
            : "0 0 6px #00ffff",
          textAlign: "center",
          pointerEvents: "none",
          whiteSpace: "nowrap",
          transition: 'all 0.3s ease',
        }}>
          {nodeData.label}
        </div>
      </Html>
    </group>
  );
};

export default FloatingNode;