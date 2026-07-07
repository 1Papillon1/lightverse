// resources/js/components/visuals/nodes/FloatingNodeGrid.jsx
import { useMemo } from "react";
import { Sparkles } from "@react-three/drei";
import FloatingNode from "@/components/visuals/nodes/FloatingNode";

const FloatingNodeGrid = ({ activeSystem, nodes, orbitRadius = 3.5, onSelect }) => {
  
  // ✅ INCREASED ORBIT RADIUS - 3x larger spread
  const nodePositions = useMemo(() => {
    const expandedRadius = orbitRadius * 3;
    
    return nodes.map((node, index) => {
      const angle = (index / nodes.length) * Math.PI * 2;
      return {
        ...node,
        position: [
          Math.cos(angle) * expandedRadius,
          0,
          Math.sin(angle) * expandedRadius
        ]
      };
    });
  }, [nodes, orbitRadius]);

  return (
    <group name={`orbit-${activeSystem}`}>
      {/* ✅ CENTRAL STAR - Smaller and brighter */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[3.5, 64, 64]} />
        <meshStandardMaterial
          color="#ffcc00"
          emissive="#ffaa00"
          emissiveIntensity={2.5}
        />
      </mesh>

      {/* ✅ Removed glow layer 1 - was making weird plasma circles */}
      
      {/* ✅ Subtle atmosphere instead of glow layer 2 */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[5, 32, 32]} />
        <meshBasicMaterial
          color="#ffaa00"
          transparent
          opacity={0.15}
          depthWrite={false}
        />
      </mesh>

      {/* ✅ SPARKLES around star - increased count and scale */}
      <Sparkles
        count={200}
        scale={15}
        size={4}
        speed={0.4}
        opacity={0.7}
        color="#ffaa00"
        position={[0, 0, 0]}
      />

      {/* ✅ ORBITING NODES (planets) - now 3x farther */}
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