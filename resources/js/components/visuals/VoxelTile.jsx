// resources/js/components/visuals/VoxelTile.jsx
import { useMemo } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import {
  getTileModel,
  getFaceRotation,
  getCornerRotationForFaces,
  getFacePushDirection,
  computeFillScale,
  CELL_SIZE,
  getRoleFacingCorrection,
} from '@/utils/tileRegistry';

const ROLE_MAP = {
  wall: 'wall',
  door: 'door',
  window: 'window',
  corner: 'corner',
  'roof-edge': 'roofEdge',
  'roof-corner': 'roofCorner',
  'roof-flat': 'roofFlat',
};

function resolveFacingAngle(type, faces, role) {
  if (type === 'corner' || type === 'roof-corner') {
    return getCornerRotationForFaces(faces[0], faces[1]);
  }
  return getFaceRotation(faces[0] ?? 'north') + getRoleFacingCorrection(role);
}


function getHeightOffset(type) {
  return type.startsWith('roof-') ? CELL_SIZE / 2 : 0;
}

// v20: pushOffset is now computed from the face LABEL (via
// getFacePushDirection - a fixed north/south/east/west -> direction
// lookup) instead of from facingAngle. It's applied in its own group,
// OUTSIDE the rotation group, so it never moves when facingAngle /
// WALL_FACING_CORRECTION changes - rotation and position are fully
// independent now. Corners/roof pieces don't get a push at all (they
// self-center correctly, per the original v19 note).
const VoxelTileModel = ({ path, role, position, facingAngle, baseRotation, heightOffset = 0, pushFace, debugColor }) => {
  const { scene } = useGLTF(path);

  const { cloned, centerOffset } = useMemo(() => {
    const clone = scene.clone(true);
    clone.updateMatrixWorld(true);

    const rawBox = new THREE.Box3().setFromObject(clone);
    const rawSize = rawBox.getSize(new THREE.Vector3());

    if (debugColor) {
      clone.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({ color: debugColor });
        }
      });
    }

    const scale = computeFillScale(role, { x: rawSize.x, y: rawSize.y, z: rawSize.z });
    clone.scale.set(scale.x, scale.y, scale.z);
    clone.updateMatrixWorld(true);

    const scaledBox = new THREE.Box3().setFromObject(clone);
    const center = scaledBox.getCenter(new THREE.Vector3());

    return { cloned: clone, centerOffset: { x: center.x, z: center.z } };
  }, [scene, role, debugColor]);

  const isFlatWall = role === 'wall' || role === 'door' || role === 'window';
  const push = isFlatWall ? getFacePushDirection(pushFace) : { x: 0, z: 0 };
    const pushOffset = [push.x * (CELL_SIZE / 2), 0, -push.z * (CELL_SIZE / 2)];

  return (
    <group position={position} rotation={baseRotation}>
      {/* Fixed edge offset - driven by pushFace directly, NOT by
          facingAngle, so it never shifts when rotation is tuned. */}
      <group position={pushOffset}>
        {/* Pure visual spin - safe to change freely, position above is
            already locked in. */}
        <group rotation={[0, facingAngle, 0]}>
          <primitive
            object={cloned}
            position={[-centerOffset.x, heightOffset, -centerOffset.z]}
          />
        </group>
      </group>
    </group>
  );
};

const VoxelTile = ({ voxel, classification, position, baseRotation = [0, 0, 0] }) => {
  const { parts } = classification;

  if (!parts || parts.length === 0) return null;

  return (
    <>
      {parts.map((part) => {
        const role = ROLE_MAP[part.type] ?? 'wall';
        const path = getTileModel(role, voxel);
        if (!path) return null;

        const facingAngle = resolveFacingAngle(part.type, part.faces, role);
        const heightOffset = getHeightOffset(part.type);

        return (
          <VoxelTileModel
            key={`${part.type}-${part.faces.join('-')}`}
            path={path}
            role={role}
            position={position}
            facingAngle={facingAngle}
            baseRotation={baseRotation}
            heightOffset={heightOffset}
            pushFace={part.faces[0]}
          />
        );
      })}
    </>
  );
};

export default VoxelTile;