// resources/js/components/visuals/nodes/FloatingNode.jsx
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";

const FloatingNode = ({ nodeData, systemId, position, onSelect }) => {
  const mesh = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (mesh.current && hovered) {
      const scale = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.03;
      mesh.current.scale.set(scale, scale, scale);
    }
  });

  const handleClick = () => {
    onSelect?.(nodeData.id);
  };

  return (
    <group position={position}>
      <mesh
        ref={mesh}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.5, 24, 24]} />
        <meshStandardMaterial
          color={hovered ? "#66ffff" : "#1a4d5c"}
          emissive={hovered ? "#00ffff" : "#003344"}
          emissiveIntensity={hovered ? 2 : 1.2}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>

      {hovered && (
        <Html distanceFactor={12} position={[0, 1, 0]} center>
          <div style={{
            color: "#b8eaff",
            fontFamily: "Rajdhani, sans-serif",
            fontSize: "0.8rem",
            textShadow: "0 0 6px #00ffff",
            textAlign: "center",
            pointerEvents: "none"
          }}>
            {nodeData.label}
          </div>
        </Html>
      )}
    </group>
  );
};

export default FloatingNode;