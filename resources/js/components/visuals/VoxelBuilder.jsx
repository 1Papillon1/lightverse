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
  const Y_SINK  = SIZE * 0.45;
  const minY    = SIZE / 2 - Y_SINK;

  // ── 🚀 NOVI LIMITI (Približeni sredini) ──────────────────────────
  const BOUND_X      = 40;   // Ukupna širina je sada 80 jedinica
  const BOUND_Z_FAR  = 40;   // Maksimalna dubina (prema horizontu)
  const BOUND_Z_NEAR = -8;   // Limit prema tebi

  const snapXZ = (val) => Math.round(val / SIZE) * SIZE;

  const snapHeight = (val) => {
    const rawHeight = Math.floor(val / SIZE) * SIZE + SIZE / 2;
    const finalHeight = rawHeight - Y_SINK;
    return Math.max(minY, finalHeight);
  };

  const getPositionFromEvent = useCallback((e) => {
    if (!groupRef.current) return null;

    const worldPoint  = e.point.clone();
    const worldNormal = e.face.normal.clone();
    worldNormal.transformDirection(e.object.matrixWorld);
    worldPoint.add(worldNormal.multiplyScalar(SIZE * 0.45));

    const localPoint = groupRef.current.worldToLocal(worldPoint);

    // Mapiranje: x=X, y=Dubina, z=Visina
    const gridX = snapXZ(localPoint.x);
    const gridZ = snapXZ(localPoint.y); 
    const gridY = snapHeight(localPoint.z);

    // ── Provjera granica ──────────────────────────────────────────
    if (Math.abs(gridX) > BOUND_X) return null;
    if (gridZ > BOUND_Z_FAR)      return null;
    if (gridZ < BOUND_Z_NEAR)     return null;

    return { x: gridX, y: gridY, z: gridZ };
  }, []);

  const onMove = useCallback((e) => {
    e.stopPropagation();
    const pos = getPositionFromEvent(e);
    setHoverPos(pos); 
  }, [getPositionFromEvent]);

  const onDown = useCallback((e) => {
    e.stopPropagation();
    const { button, altKey, object } = e;

    if (altKey || button === 2) {
      if (object.name === "voxel-mesh") {
        setVoxels((prev) => prev.filter((v) =>
          Math.abs(v.x - object.position.x) > 0.1 ||
          Math.abs(v.y - object.position.z) > 0.1 || // Provjera dubine
          Math.abs(v.z - object.position.y) > 0.1    // Provjera visine
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
    <group ref={groupRef} rotation={[-Math.PI / 1.95, 0, 0]} position={[0, -22, -20]}>
      {/* Senzor klika (može ostati velik, granice u kodu rade filtriranje) */}
      <mesh onPointerMove={onMove} onPointerDown={onDown} onPointerOut={() => setHoverPos(null)} visible={false}>
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>

      {/* RENDERIRANJE: position=[X, Visina, Dubina] */}
      {voxels.map((v) => (
        <mesh 
          key={`${v.x}-${v.y}-${v.z}`} 
          position={[v.x, v.z, v.y]} 
          name="voxel-mesh" 
          onPointerMove={onMove} 
          onPointerDown={onDown}
        >
          <boxGeometry args={[SIZE, SIZE, SIZE]} />
          <meshStandardMaterial color="#000810" emissive={neonPurple} emissiveIntensity={2} transparent opacity={0.95} />
          <Edges threshold={15} color={neonPurple} scale={1.01} />
        </mesh>
      ))}

      {hoverPos && (
        <mesh position={[hoverPos.x, hoverPos.z, hoverPos.y]}>
          <boxGeometry args={[SIZE + 0.1, SIZE + 0.1, SIZE + 0.1]} />
          <meshStandardMaterial color={neonPurple} opacity={0.3} transparent />
          <Edges color="#ffffff" />
        </mesh>
      )}
    </group>
  );
};

export default VoxelBuilder;