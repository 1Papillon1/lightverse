// resources/js/components/visuals/VoxelTile.jsx
import { useMemo } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { getTileModel, getFaceRotation, getCornerRotationForFaces, TILE_SCALE } from '@/utils/tileRegistry';

const ROLE_MAP = {
  wall: 'wall',
  door: 'door',
  window: 'window',
  corner: 'corner',
  'roof-edge': 'roofEdge',
  'roof-corner': 'roofCorner',
  'roof-flat': 'roofFlat',
};

/**
 * facingAngle logika ostaje NETAKNUTA po izričitom zahtjevu - uključujući
 * *4 u VoxelTileModel. NAPOMENA (ne dira se, samo za buduću referencu):
 * *4 na kutove koji su već multiples of π/4 svodi SVE moguće corner
 * rotacije na istu vrijednost (π) nakon mod 2π - zato izolirani blok i
 * dalje pokazuje "opening" kroz GLB slojeve. v8 to rješava DRUGAČIJIM
 * mehanizmom (SealedFacePanel ispod), ne popravkom ove formule.
 */
function resolveFacingAngle(type, faces) {
  if (type === 'corner' || type === 'roof-corner') {
    return getCornerRotationForFaces(faces[0], faces[1]);
  }
  if (type === 'wall' || type === 'door' || type === 'window' || type === 'roof-edge') {
    return getFaceRotation(faces[0]) * 2;
  }
  return 0;
}

const VoxelTileModel = ({ path, position, facingAngle, baseRotation }) => {
  const { scene } = useGLTF(path);

  const { cloned, centerOffset } = useMemo(() => {
    const clone = scene.clone(true);
    clone.scale.setScalar(TILE_SCALE);
    clone.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());

    return { cloned: clone, centerOffset: { x: center.x, z: center.z } };
  }, [scene]);

  return (
    <group position={position} rotation={baseRotation}>
      <group rotation={[0, facingAngle * 4, 0]}>
        <primitive object={cloned} position={[-centerOffset.x, 0, -centerOffset.z]} />
      </group>
    </group>
  );
};

const CELL_SIZE = 8;
const SEAL_THICKNESS = 0.5;
const SIDE_FACES = ['north', 'south', 'east', 'west'];

/**
 * v9: prošli pokušaj (i plane i axis-aligned box varijanta) je pogrešno
 * tretirao geometriju u STVARNIM grid-osima (sjever/jug=Z, istok/zapad=X)
 * i ONDA na to primijenio baseRotation - ali baseRotation postoji da
 * ispravi GLB-ovu VLASTITU Y-up autorsku konvenciju, ne da generalno
 * "postavi nešto uspravno". Primjena baseRotation na geometriju koja
 * NIJE autorirana u toj konvenciji ju je nakrivila (otud plutajući
 * plosnati oblik).
 *
 * Ispravno: graditi panel u ISTOJ konvenciji kao GLB (širina=X,
 * visina=Y, debljina=Z, pomaknuto prema jednom rubu), pa primijeniti
 * ISTI par rotacija koje GLB koristi (unutarnja Y-rotacija za facing,
 * pa baseRotation izvana) - dokazano ispravan par (isti koji je dao
 * zatvorenu kutiju s corner komadima ranije).
 */
const SealedFacePanel = ({ face, position, baseRotation }) => {
  const angle = getFaceRotation(face);

  return (
    <group position={position} rotation={baseRotation}>
      <group rotation={[0, angle, 0]}>
        <mesh position={[0, 0, -(CELL_SIZE / 2 - SEAL_THICKNESS / 2)]}>
          <boxGeometry args={[CELL_SIZE, CELL_SIZE, SEAL_THICKNESS]} />
          <meshStandardMaterial color="#cfd3dc" />
        </mesh>
      </group>
    </group>
  );
};

const VoxelTile = ({ voxel, classification, position, baseRotation = [0, 0, 0] }) => {
  const { parts, exposed } = classification;

  const hasNothingToRender = (!parts || parts.length === 0) && (!exposed || Object.values(exposed).every((v) => !v));
  if (hasNothingToRender) return null;

  const exposedSides = exposed ? SIDE_FACES.filter((f) => exposed[f]) : [];

  return (
    <>
      {/* Dekorativni GLB slojevi - nepromijenjeno */}
      {parts && parts.map((part) => {
      const role = ROLE_MAP[part.type] ?? 'wall';
      const path = getTileModel(role, voxel);
      if (!path) return null;

      const facingAngle = resolveFacingAngle(part.type, part.faces);

      return (
        <VoxelTileModel
          key={`${part.type}-${part.faces.join('-')}`}
          path={path}
          position={position}
          facingAngle={facingAngle}
          baseRotation={baseRotation}
        />
      );
    })}

      {/* v8: garantirani sealed panel po izloženoj bočnoj strani - vidi
          komentar iznad SealedFacePanel definicije */}
      {exposedSides.map((face) => (
        <SealedFacePanel
          key={`seal-${face}`}
          face={face}
          position={position}
          baseRotation={baseRotation}
        />
      ))}
    </>
  );
};

export default VoxelTile;