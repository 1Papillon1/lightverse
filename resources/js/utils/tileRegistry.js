// resources/js/utils/tileRegistry.js
//
// EKSPLICITNI registar - Three.js/GLB loader NE ZNA što fajl predstavlja
// samo po imenu. Ovo je "rječnik" koji prevodi semantičku ulogu
// (određenu u voxelClassifier.js) u konkretan GLB fajl.
//
// v2: prebačeno s border-*/barricade-* (dekorativni/prop kitovi) na
// wall-* kit, koji je jedini dio Kenney building kita stvarno građen da
// se spaja modul-na-modul (isti footprint kao wall.glb). border-* su
// tanke ograde/rubovi, barricade-* su freestanding prepreke - nijedan
// nije zamišljen kao strukturni zid s otvorom za vrata/prozor, otud i
// izgled iz screenshota (tanki lukovi razbacani okolo).
//
// Svaka uloga ima ARRAY varijanti - kad ih ima više, biramo nasumično
// po (stabilnom) seedu iz pozicije bloka, da se ista pozicija uvijek
// renderira istom varijantom (ne mijenja se svaki re-render).

const BASE = '/resources/models/kenney-building-kit/';

// Kenney modeli su izvorno ~1 jedinica veličine, a grid mreža ima razmak
// od 8 jedinica (SIZE konstanta u VoxelBuilder). NAPOMENA: ovo je i dalje
// pretpostavka - sad kad su pravi wall-* modeli u igri, prva stvar koju
// vizualno provjeri je pristaje li jedan wall.glb blok točno uz susjedni
// (bez razmaka, bez preklapanja). Ako ne, ovo je prvi broj koji mijenjaš.
export const TILE_SCALE = 8;

export const TILE_REGISTRY = {
  wall: [
    `${BASE}wall.glb`,
  ],
  corner: [
    // v5: wall-corner-round.glb removed. It's a genuinely different
    // profile (curved, recessed) from wall-corner.glb (square, flush) -
    // randomly alternating between them per-block within one structure
    // created visible seams/gaps against straight wall.glb neighbors,
    // since only the square variant is built to butt flush against a
    // straight wall edge. Revisit once there's a per-building "style"
    // selection instead of per-block random choice.
    `${BASE}wall-corner.glb`,
  ],
  door: [
  `${BASE}wall-doorway-square.glb`,
  ],
  window: [
    `${BASE}wall-window-square.glb`,
  ],
  roofFlat: [
    `${BASE}roof-flat-center.glb`,
    `${BASE}roof-flat-square.glb`,
  ],
  roofEdge: [
    `${BASE}roof-flat-side.glb`,
  ],
  roofCorner: [
    `${BASE}roof-flat-corner.glb`,
  ],
  column: [
    `${BASE}column.glb`,
    `${BASE}column-thin.glb`,
    `${BASE}column-wide.glb`,
  ],
};

// Stabilan "random" - ista pozicija bloka UVIJEK dobiva istu varijantu,
// umjesto da se mijenja na svaki re-render (Math.random() bi to radio).
function seededPick(array, seedString) {
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash * 31 + seedString.charCodeAt(i)) >>> 0;
  }
  return array[hash % array.length];
}

/**
 * Vraća GLB path za dani (role, pozicija) par - varijanta je stabilna
 * po poziciji bloka, ne nasumična na svaki render.
 */
export function getTileModel(role, voxel) {
  const variants = TILE_REGISTRY[role];
  if (!variants || variants.length === 0) return null;

  const seed = `${voxel.x}|${voxel.y}|${voxel.z}`;
  return seededPick(variants, seed);
}

// ─────────────────────────────────────────────────────────────
// ROTACIJA - koji smjer model treba gledati, u radijanima za Three.js
// rotation.y. Model je autorski orijentiran da "gleda" jedan smjer
// (obično -Z ili +Z u Kenney kitovima - PROVJERI u Blenderu/pregledniku
// kad prvi put učitaš, pa prilagodi FACE_ANGLES ako je krivo).
// ─────────────────────────────────────────────────────────────

const FACE_ANGLES = {
  north: 0,
  east: Math.PI * 0.5,
  south: Math.PI,
  west: Math.PI * 1.5,
};

/**
 * v6: zamjenjuje getWallRotation(exposed) - blok sad može imati više
 * side-part-ova, svaki sa svojom listom strana, pa rotacija mora doći
 * iz TOG PARTA (part.faces[0]), ne iz cijelog exposed objekta bloka.
 */
export function getFaceRotation(face) {
  return FACE_ANGLES[face] ?? 0;
}

/**
 * v6: zamjenjuje getCornerRotation(exposed) - isto obrazloženje, uzima
 * eksplicitno koje dvije strane taj SPECIFIČNI corner part predstavlja
 * (part.faces), umjesto da sam traži prvi par u exposed objektu.
 */
export function getCornerRotationForFaces(faceA, faceB) {
  const pairs = {
    'north|east': Math.PI * 1.75, // NE kut
    'east|south': Math.PI * 0.25, // SE kut
    'south|west': Math.PI * 0.75, // SW kut
    'west|north': Math.PI * 1.25, // NW kut
  };
  return pairs[`${faceA}|${faceB}`] ?? pairs[`${faceB}|${faceA}`] ?? 0;
}