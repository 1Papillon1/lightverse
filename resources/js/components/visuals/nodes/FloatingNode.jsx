// resources/js/components/visuals/nodes/FloatingNode.jsx
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from 'three';

const FloatingNode = ({ nodeData, systemId, position, onSelect }) => {
  const mesh = useRef();
  const glowRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  // ✅ Use node's color from config, fallback to cyan
  const nodeColor = nodeData.color || "#00ffff";
  const hoverColor = "#ffffff";

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
      {/* ✅ MAIN PLANET - Uses color from config */}
      <mesh
        ref={mesh}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial
          color={hovered ? hoverColor : nodeColor}
          emissive={nodeColor}
          emissiveIntensity={hovered ? 2.5 : 1.2}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>

      
      {/* ✅ LABEL - Always visible with dark background */}
      <Html 
        distanceFactor={10} 
        position={[0, 3, 0]} 
        center
        style={{
          transition: 'all 0.3s ease',
          opacity: hovered ? 1 : 0.85,
          pointerEvents: 'none',
        }}
      >
        <div style={{
          color: hovered ? "#ffffff" : "#e0f7ff",
          fontFamily: "Rajdhani, sans-serif",
          fontSize: "72px",
          fontWeight: "bold",
          textShadow: hovered 
            ? `0 0 12px ${nodeColor}, 0 0 24px ${nodeColor}` 
            : `0 0 8px ${nodeColor}`,
          textAlign: "center",
          whiteSpace: "nowrap",
          transition: 'all 0.3s ease',
          background: 'rgba(0, 0, 0, 0.6)',
          padding: '4px 24px',
          borderRadius: '50px',
          border: hovered 
            ? `1px solid ${nodeColor}` 
            : `1px solid rgba(0, 255, 255, 0.3)`,
        }}>
          {nodeData.label}
        </div>
      </Html>
    </group>
  );
};

export default FloatingNode;