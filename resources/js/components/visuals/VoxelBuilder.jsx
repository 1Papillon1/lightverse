// resources/js/Pages/Galaxy/Art/DigitalCanvas/VoxelBuilder.jsx
import React, { useState, useCallback, useRef, useEffect } from "react";
import * as THREE from "three";
import { Edges } from "@react-three/drei";
import { useRootStore } from "@/stores/RootStore";
import { observer } from "mobx-react-lite";

/**
 * Grid -> lokalni Three.js prostor.
 *
 * Grid: { x, y (visina), z (dubina) }
 * Grupa je rotirana (rotation=[-Math.PI/1.95,0,0]) tako da njena lokalna
 * Y os prati dubinu, a lokalna Z os prati visinu - zato je mapiranje
 * [x, z, y], a NE [x, y, z]. Ovo je jedino mjesto u cijeloj aplikaciji
 * gdje se ta zamjena osi smije dogoditi - i voxel mesh i hover preview
 * prolaze kroz istu funkciju, pa nema više mogućnosti da se negdje
 * pomiješaju (to je bio prijašnji bug).
 */
const toLocalPosition = (v) => [v.x, v.z, v.y];

const VoxelBuilder = observer(() => {
  const [hoverPos, setHoverPos] = useState(null);
  const groupRef = useRef();
  const { voxelStore } = useRootStore();
  const PLANET_ID = "verse-forge";

  useEffect(() => {
    voxelStore.fetchVoxels(PLANET_ID);
    // Ako korisnik ode sa stranice dok debounce (2s) još čeka, ne gubimo zadnju izmjenu.
    return () => {
      voxelStore.flushSync();
    };
  }, []);

  const neonPurple = "#0a0a1f";
  const SIZE = 8;
  const Y_SINK = SIZE * 0.45;
  const minY = SIZE / 2 - Y_SINK;

  // ── LIMITI (nepromijenjeno) ──────────────────────────────────────
  const BOUND_X = 40;
  const BOUND_Z_FAR = 40;
  const BOUND_Z_NEAR = -8;

  const snapXZ = (val) => Math.round(val / SIZE) * SIZE;

  const snapHeight = (val) => {
    const rawHeight = Math.floor(val / SIZE) * SIZE + SIZE / 2;
    const finalHeight = rawHeight - Y_SINK;
    return Math.max(minY, finalHeight);
  };

  // ── Pozicioniranje / preview (nepromijenjeno) ────────────────────
  const getPositionFromEvent = useCallback((e) => {
    if (!groupRef.current) return null;

    const worldPoint = e.point.clone();
    const worldNormal = e.face.normal.clone();
    worldNormal.transformDirection(e.object.matrixWorld);
    worldPoint.add(worldNormal.multiplyScalar(SIZE * 0.45));

    const localPoint = groupRef.current.worldToLocal(worldPoint);

    // Mapiranje: x=X, y=Dubina, z=Visina
    const gridX = snapXZ(localPoint.x);
    const gridZ = snapXZ(localPoint.y);
    const gridY = snapHeight(localPoint.z);

    // ── Provjera granica ────────────────────────────────────────
    if (Math.abs(gridX) > BOUND_X) return null;
    if (gridZ > BOUND_Z_FAR) return null;
    if (gridZ < BOUND_Z_NEAR) return null;

    return { x: gridX, y: gridY, z: gridZ };
  }, []);

  const onMove = useCallback(
    (e) => {
      e.stopPropagation();
      setHoverPos(getPositionFromEvent(e));
    },
    [getPositionFromEvent]
  );

  const onDown = useCallback(
    (e) => {
      e.stopPropagation();
      const { button, altKey, object } = e;

      // Brisanje (alt-klik ili desni klik)
      if (altKey || button === 2) {
        if (object.name === "voxel-mesh") {
          // object.position je u lokalnom render prostoru [x, z(dubina), y(visina)],
          // pa ga vraćamo natrag u grid prostor prije poziva store-a.
          voxelStore.removeVoxel({
            x: object.position.x,
            y: object.position.z,
            z: object.position.y,
          });
        }
        return;
      }

      // Dodavanje
      const pos = getPositionFromEvent(e);
      if (!pos) return;

      voxelStore.addVoxel(pos);
      // Ako je addVoxel vratio false (npr. limit dosegnut ili blok već postoji),
      // ništa se ne događa - store je jedini koji to odlučuje.
    },
    [getPositionFromEvent, voxelStore]
  );

  return (
    <group ref={groupRef} rotation={[-Math.PI / 1.95, 0, 0]} position={[0, -22, -20]}>
      {/* Senzor klika */}
      <mesh onPointerMove={onMove} onPointerDown={onDown} onPointerOut={() => setHoverPos(null)} visible={false}>
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>

      {/* Blokovi - čitaju se direktno iz store-a, nema lokalnog state-a */}
      {voxelStore.voxels.map((v) => (
        <mesh
          key={`${v.x}-${v.y}-${v.z}`}
          position={toLocalPosition(v)}
          name="voxel-mesh"
          onPointerMove={onMove}
          onPointerDown={onDown}
        >
          <boxGeometry args={[SIZE, SIZE, SIZE]} />
          <meshStandardMaterial color="#000810" emissive={neonPurple} emissiveIntensity={2} transparent opacity={0.95} />
          <Edges threshold={15} color={neonPurple} scale={1.01} />
        </mesh>
      ))}

      {/* Preview blok - nepromijenjeno ponašanje */}
      {hoverPos && (
        <mesh position={toLocalPosition(hoverPos)}>
          <boxGeometry args={[SIZE + 0.1, SIZE + 0.1, SIZE + 0.1]} />
          <meshStandardMaterial color={neonPurple} opacity={0.3} transparent />
          <Edges color="#ffffff" />
        </mesh>
      )}
    </group>
  );
});

export default VoxelBuilder;