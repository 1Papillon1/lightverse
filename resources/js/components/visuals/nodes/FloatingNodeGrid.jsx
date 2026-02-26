// resources/js/components/visuals/nodes/FloatingNodeGrid.jsx
import { useMemo } from "react";
import { Sparkles } from "@react-three/drei";
import FloatingNode from "@/components/visuals/nodes/FloatingNode";

const FloatingNodeGrid = ({ activeSystem, nodes, orbitRadius = 3.5, onSelect }) => {
  
  const nodePositions = useMemo(() => {
    return nodes.map((node, index) => {
      const angle = (index / nodes.length) * Math.PI * 2;
      return {
        ...node,
        position: [
          Math.cos(angle) * orbitRadius,
          0,
          Math.sin(angle) * orbitRadius
        ]
      };
    });
  }, [nodes, orbitRadius]);

  return (
    <group name={`orbit-${activeSystem}`}>
      {/* ✅ CENTRAL STAR - The focal point */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[4, 64, 64]} />
        <meshStandardMaterial
          color="#ffaa00"
          emissive="#ffaa00"
          emissiveIntensity={2}
        />
      </mesh>

      {/* Star glow layer 1 */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[5, 64, 64]} />
        <meshBasicMaterial
          color="#ffaa00"
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Star glow layer 2 */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[6.5, 64, 64]} />
        <meshBasicMaterial
          color="#ff8800"
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* ✅ SPARKLES around star */}
      <Sparkles
        count={150}
        scale={12}
        size={3}
        speed={0.3}
        opacity={0.6}
        color="#ffaa00"
      />

      {/* ✅ ORBITING NODES (planets) */}
      {nodePositions.map((node) => (
        <FloatingNode
          key={node.id}
          nodeData={node}
          systemId={activeSystem}
          position={node.position}
          onSelect={onSelect}
        />
      ))}
    </group>
  );
};

export default FloatingNodeGrid;