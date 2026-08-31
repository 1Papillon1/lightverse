// resources/js/Pages/Galaxy/ArtGalaxy/DigitalCanvas/VoxelBuilder.jsx
import React, { useState, useCallback, useRef, useEffect } from "react";
import * as THREE from "three";
import { Edges } from "@react-three/drei";
import { useRootStore } from "@/stores/RootStore";
import { observer } from "mobx-react-lite";
import { classifyStructure } from "@/utils/voxelClassifier";
import VoxelTile from "@/components/visuals/VoxelTile";

/**
 * Grid -> lokalni Three.js prostor.
 *
 * Grid: { x, y (visina), z (dubina) }
 * Grupa je rotirana (rotation=[-Math.PI/1.95,0,0]) tako da njena lokalna
 * Y os prati dubinu, a lokalna Z os prati visinu - zato je mapiranje
 * [x, z, y], a NE [x, y, z].
 *
 * VoxelTile baseRotation=[Math.PI/2,0,0] ispravlja nesklad između modelove
 * vlastite Y-up orijentacije (glTF standard) i lokalne Z-visine ovdje -
 * vidi detaljan komentar u VoxelTile.jsx. Ako modeli ispadnu naopako,
 * prvo probaj -Math.PI/2 na tom jednom mjestu (ne mijenjaj ništa drugo).
 */
const toLocalPosition = (v) => [v.x, v.z, v.y];

const VoxelBuilder = observer(() => {
  const [hoverPos, setHoverPos] = useState(null);
  const groupRef = useRef();
  const { voxelStore } = useRootStore();
  const PLANET_ID = "verse-forge";

  useEffect(() => {
    voxelStore.fetchVoxels(PLANET_ID);
    return () => {
      voxelStore.flushSync();
    };
  }, []);

  const neonPurple = "#0a0a1f";
  const SIZE = 8;
  const Y_SINK = SIZE * 0.45;
  const minY = SIZE / 2 - Y_SINK;

  const BOUND_X = 40;
  const BOUND_Z_FAR = 40;
  const BOUND_Z_NEAR = -8;

  const snapXZ = (val) => Math.round(val / SIZE) * SIZE;

  const snapHeight = (val) => {
    const rawHeight = Math.floor(val / SIZE) * SIZE + SIZE / 2;
    const finalHeight = rawHeight - Y_SINK;
    return Math.max(minY, finalHeight);
  };

  const getPositionFromEvent = useCallback((e) => {
    if (!groupRef.current) return null;

    const worldPoint = e.point.clone();
    const worldNormal = e.face.normal.clone();
    worldNormal.transformDirection(e.object.matrixWorld);
    worldPoint.add(worldNormal.multiplyScalar(SIZE * 0.45));

    const localPoint = groupRef.current.worldToLocal(worldPoint);

    const gridX = snapXZ(localPoint.x);
    const gridZ = snapXZ(localPoint.y);
    const gridY = snapHeight(localPoint.z);

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

      if (altKey || button === 2) {
        if (object.name === "voxel-mesh") {
          voxelStore.removeVoxel({
            x: object.position.x,
            y: object.position.z,
            z: object.position.y,
          });
        }
        return;
      }

      const pos = getPositionFromEvent(e);
      if (!pos) return;

      voxelStore.addVoxel(pos);
    },
    [getPositionFromEvent, voxelStore]
  );

  // Klasifikacija se računa svaki render (broj blokova je malen - do
  // par stotina max po limitu - pa nije potreban memo/optimizacija ovdje).
  const classified = classifyStructure(voxelStore.voxels);

  return (
    <group ref={groupRef} rotation={[-Math.PI / 1.95, 0, 0]} position={[0, -22, -20]}>
      {/* Senzor klika */}
      <mesh onPointerMove={onMove} onPointerDown={onDown} onPointerOut={() => setHoverPos(null)} visible={false}>
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>

      {/* Placirani blokovi - sad pravi GLB modeli po klasifikaciji.
          Klik/brisanje i dalje rade preko istog senzor-mesh triku, samo
          nevidljiv "hit target" mesh ostaje po bloku (VoxelTile ne prima
          pointer evente - GLB modeli imaju kompleksniju geometriju koja
          otežava pouzdano hit-testiranje, pa nevidljivi box iza njega i
          dalje hvata klikove). */}
     {classified.map((v) => (
        <group key={`${v.x}-${v.y}-${v.z}`} position={toLocalPosition(v)}>
          {!v.isBridge && (
            <mesh
              name="voxel-mesh"
              onPointerMove={onMove}
              onPointerDown={onDown}
              visible={false}
            >
              <boxGeometry args={[SIZE, SIZE, SIZE]} />
            </mesh>
          )}

          <VoxelTile
            voxel={v}
            classification={v.classification}
            position={[0, 0, 0]}
            baseRotation={[Math.PI / 2, 0, 0]}
          />
        </group>
      ))}

      {/* Preview blok - ostaje jednostavna kocka (ne pravi GLB), jer je
          ovo samo indikator "gdje bi sljedeći blok stao", ne stvarni
          objekt - klasificirati ga po susjedstvu bi bilo nepotrebno
          skupo/nestabilno dok se miš stalno miče. */}
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