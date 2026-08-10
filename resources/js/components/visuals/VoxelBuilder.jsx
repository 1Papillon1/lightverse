// resources/js/Pages/Galaxy/Art/DigitalCanvas/VoxelBuilder.jsx
import React, { useState, useCallback, useRef } from "react";
import * as THREE from "three";
import { Edges } from "@react-three/drei";

const VoxelBuilder = () => {
  const [voxels, setVoxels] = useState([]);
  const [hoverPos, setHoverPos] = useState(null);
  const groupRef = useRef();


  const neonPurple = "#0a0a1f";
  const SIZE = 8;
    const Y_SINK = SIZE * 0.45;  // sink 45% into ground
    const minY = SIZE / 2 - Y_SINK;

  const snapXZ = (val) => Math.round(val / SIZE) * SIZE;
  
  // Poboljšani snapY koji osigurava precizno slaganje jedan na drugi
  const snapY = (val) => {
    const rawY = Math.floor(val / SIZE) * SIZE + SIZE / 2;
    const finalY = rawY - Y_SINK;
    // ✅ FLOOR LIMIT: Ne dopušta poziciju nižu od prvog reda na terrainu
    return Math.max(minY, finalY);
  };

  const getPositionFromEvent = useCallback((e) => {
    if (!groupRef.current) return null;

    const worldPoint = e.point.clone();
    const worldNormal = e.face.normal.clone();
    worldNormal.transformDirection(e.object.matrixWorld);
    
    // Suptilniji offset za Raycaster (0.45 je "sweet spot")
    worldPoint.add(worldNormal.multiplyScalar(SIZE * 0.45));
    const localPoint = groupRef.current.worldToLocal(worldPoint);

    return {
      x: snapXZ(localPoint.x),
      y: snapY(localPoint.y),
      z: snapXZ(localPoint.z),
    };
  }, []);

  const onMove = useCallback((e) => {
    e.stopPropagation();
    const pos = getPositionFromEvent(e);
    if (pos) setHoverPos(pos);
  }, [getPositionFromEvent]);

  const onDown = useCallback((e) => {
    e.stopPropagation();
    const { button, altKey, object } = e;

    if (altKey || button === 2) {
      if (object.name === "voxel-mesh") {
        setVoxels((prev) => prev.filter((v) => 
          v.x !== object.position.x || v.y !== object.position.y || v.z !== object.position.z
        ));
      }
      return;
    }

    const pos = getPositionFromEvent(e);
    if (!pos) return;

    setVoxels((prev) => {
      if (prev.some(v => v.x === pos.x && v.y === pos.y && v.z === pos.z)) return prev;
      return [...prev, pos];
    });
  }, [getPositionFromEvent]);

  return (
    <group 
  ref={groupRef} 
  rotation={[-Math.PI / 1.95, 0, 0]} 
  position={[0, -22, -20]}  // ✅ match terrain exactly
>
      <mesh 
        onPointerMove={onMove} 
        onPointerDown={onDown} 
        onPointerOut={() => setHoverPos(null)} 
        visible={false}
        position={[0, 0, 0]}  // relative to group
        >
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial transparent opacity={0} side={THREE.DoubleSide} />
        </mesh>

      {/* RENDERIRANJE VOXELA */}
      {voxels.map((v) => (
        <mesh key={`${v.x}-${v.y}-${v.z}`} position={[v.x, v.y, v.z]} name="voxel-mesh" onPointerMove={onMove} onPointerDown={onDown}>
          <boxGeometry args={[SIZE, SIZE, SIZE]} />
          <meshStandardMaterial 
            color="#000810" 
            emissive={neonPurple} 
            emissiveIntensity={2} 
            transparent 
            opacity={0.95} 
          />
          <Edges threshold={15} color={neonPurple} scale={1.01} />
        </mesh>
      ))}

      {/* GHOST PREVIEW */}
      {hoverPos && (
        <mesh position={[hoverPos.x, hoverPos.y, hoverPos.z]} pointerEvents="none">
          <boxGeometry args={[SIZE + 0.1, SIZE + 0.1, SIZE + 0.1]} />
          <meshStandardMaterial color={neonPurple} opacity={0.3} transparent />
          <Edges color="#ffffff" />
        </mesh>
      )}
    </group>
  );
};

export default VoxelBuilder;