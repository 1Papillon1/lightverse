// resources/js/components/visuals/nodes/FloatingNodeGrid.jsx
import { useMemo } from "react";
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