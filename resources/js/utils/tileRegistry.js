// resources/js/utils/tileRegistry.js
const BASE = '/resources/models/kenney-building-kit/';

export const CELL_SIZE = 8;

const SCALE_MODE = {
  wall: 'height', corner: 'height', door: 'height', window: 'height', column: 'height',
  roofFlat: 'footprint', roofEdge: 'footprint', roofCorner: 'footprint',
};

// FIX: was "getSaleModeForRole" (typo, missing the 'c') while
// computeFillScale below calls "getScaleModeForRole" - that mismatch
// is a ReferenceError at runtime, not a rotation issue. Renamed to
// match its caller.
export function getScaleModeForRole(role) {
  return SCALE_MODE[role] ?? 'height';
}

export function computeFillScale(role, rawSize) {
  const mode = getScaleModeForRole(role);
  if (mode === 'footprint') {
    const dimension = Math.max(rawSize.x, rawSize.z);
    const s = dimension > 0 ? CELL_SIZE / dimension : 1;
    return { x: s, y: s, z: s };
  }
  const heightScale = rawSize.y > 0 ? CELL_SIZE / rawSize.y : 1;
  const footprintDimension = Math.max(rawSize.x, rawSize.z);
  const footprintScale = footprintDimension > 0 ? CELL_SIZE / footprintDimension : 1;
  return { x: footprintScale, y: heightScale, z: footprintScale };
}

export const TILE_REGISTRY = {
  wall: [`${BASE}wall.glb`],
  corner: [`${BASE}wall-corner.glb`],
  door: [`${BASE}wall-doorway-square.glb`],
  window: [`${BASE}wall-window-square.glb`],
  roofFlat: [`${BASE}roof-flat-center.glb`],
  roofEdge: [`${BASE}roof-flat-side.glb`],
  roofCorner: [`${BASE}roof-flat-corner.glb`],
  column: [`${BASE}column.glb`],
};

function seededPick(array, seedString) {
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) hash = (hash * 31 + seedString.charCodeAt(i)) >>> 0;
  return array[hash % array.length];
}

export function getTileModel(role, voxel) {
  const variants = TILE_REGISTRY[role];
  if (!variants || variants.length === 0) return null;
  return seededPick(variants, `${voxel.x}|${voxel.y}|${voxel.z}`);
}

// ─────────────────────────────────────────────────────────────
// PUSH-TO-EDGE (position) vs FACING (rotation) - v20: these are now
// TWO SEPARATE THINGS. Before, the "push a flat wall out to the cell
// edge" offset lived inside the SAME rotated group as the visual
// facingAngle spin - so nudging WALL_FACING_CORRECTION didn't just
// rotate the wall in place, it also dragged it to a DIFFERENT edge
// (since the push vector got rotated right along with the model).
// That's why "right position, wrong rotation" felt impossible to
// reach, and why +0.25/+0.5 "teleported" it - you were never able to
// change one without the other.
//
// FACE_PUSH below is a FIXED lookup straight from the compass label
// (north/south/east/west), completely independent of
// WALL_FACING_CORRECTION. VoxelTile.jsx applies this push in a group
// OUTSIDE the rotation group, so the edge a wall sits against no
// longer depends on whatever rotation number you're experimenting
// with. WALL_FACING_CORRECTION is now a free dial - cycle through
// all 4 multiples of 90° and the wall never leaves its edge.
// ─────────────────────────────────────────────────────────────


const ROLE_FACING_CORRECTION = {
  door: 0,
  window: 0,
};

export function getRoleFacingCorrection(role) {
  return ROLE_FACING_CORRECTION[role] ?? 0;
}


const FACE_PUSH = {
  north: { x: 0, z: -1 },
  south: { x: 0, z: 1 },
  east: { x: 1, z: 0 },
  west: { x: -1, z: 0 },
};

export function getFacePushDirection(face) {
  return FACE_PUSH[face] ?? { x: 0, z: 0 };
}

const CORNER_FACING_CORRECTION = Math.PI * 1.25; // confirmed working - do not change

// Now safe to freely cycle through all 4 - position no longer moves
// when this changes. Try 0, Math.PI * 0.5, Math.PI, Math.PI * 1.5 and
// reload between each; pick whichever makes walls face outward.
const WALL_FACING_CORRECTION = Math.PI * 0.5; // confirmed working - do not change

const FACE_ANGLES = {
  north: 0 + WALL_FACING_CORRECTION,
  east:  Math.PI * 0.5 + WALL_FACING_CORRECTION,
  south: Math.PI + WALL_FACING_CORRECTION,
  west:  Math.PI * 1.5 + WALL_FACING_CORRECTION,
};

export function getFaceRotation(face) {
  return FACE_ANGLES[face] ?? 0;
}

export function getCornerRotationForFaces(faceA, faceB) {
  const pairs = {
    'north|east': Math.PI * 0.75,
    'east|south': Math.PI * 1.25,
    'south|west': Math.PI * 1.75,
    'west|north': Math.PI * 0.25,
  };
  const base = pairs[`${faceA}|${faceB}`] ?? pairs[`${faceB}|${faceA}`] ?? 0;
  return base + CORNER_FACING_CORRECTION;
}