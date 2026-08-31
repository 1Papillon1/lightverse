// resources/js/components/visuals/VoxelPreview.jsx
import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { classifyStructure } from "@/utils/voxelClassifier";
import VoxelTile from "@/components/visuals/VoxelTile";

/**
 * Prikazuje snapshot voxel podataka (voxel_data iz Building modela) kao
 * PRAVE 3D modele (zid, vrata, prozor, kut, krovni rub) umjesto praznih
 * kocaka - klasifikacija dolazi iz voxelClassifier.js na temelju
 * susjedstva blokova.
 *
 * Standardna Y-up konvencija ovdje (nema nagnute grupe kao VoxelBuilder),
 * pa je position direktno [v.x, v.y, v.z] - bez swapa.
 *
 * Samo za gledanje - nema onPointerDown/onPointerMove, nema editiranja.
 * Rotira se lagano oko Y osi radi "vitrina" efekta u galeriji.
 */
const VoxelPreview = ({ voxels, autoRotate = true }) => {
  const groupRef = useRef();

  const classified = useMemo(() => classifyStructure(voxels ?? []), [voxels]);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  if (!voxels || voxels.length === 0) return null;

  return (
    <group ref={groupRef}>
      {classified.map((v) => (
        <VoxelTile
          key={`${v.x}-${v.y}-${v.z}`}
          voxel={v}
          classification={v.classification}
          position={[v.x, v.y, v.z]}
        />
      ))}
    </group>
  );
};

export default VoxelPreview;