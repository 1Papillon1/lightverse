// resources/js/components/visuals/VoxelPreview.jsx
import React, { useRef } from "react";
import { Edges } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

// Ista konvencija kao u VoxelBuilder.jsx - grid {x, y(visina), z(dubina)}
// mapira se u lokalni Three.js prostor kao [x, z, y]. Ovdje nema rotirane
// grupe (galerija prikazuje objekt "ravno"), pa je mapiranje 1:1 [x, y, z]
// - namjerno JEDNOSTAVNIJE od buildera jer nema interakcije s tlom/kamerom
// koja je diktirala tu rotaciju ondje.
const SIZE = 8;
const neonPurple = "#0a0a1f";

/**
 * Prikazuje snapshot voxel podataka (voxel_data iz Building modela).
 * Samo za gledanje - nema onPointerDown/onPointerMove, nema editiranja.
 * Rotira se lagano oko Y osi radi "vitrina" efekta u galeriji.
 */
const VoxelPreview = ({ voxels, autoRotate = true }) => {
  const groupRef = useRef();

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  if (!voxels || voxels.length === 0) return null;

  return (
    <group ref={groupRef}>
      {voxels.map((v) => (
        <mesh key={`${v.x}-${v.y}-${v.z}`} position={[v.x, v.y, v.z]}>
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
    </group>
  );
};

export default VoxelPreview;