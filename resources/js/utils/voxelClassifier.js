// resources/js/utils/voxelClassifier.js
//
// FAZA 1 dekoracijskog sustava - deterministička klasifikacija bloka na
// temelju susjeda, umjesto punog probabilističkog WFC solvera.
//
// v6: NAJVAŽNIJA promjena dosad - blok sad može dobiti VIŠE OD JEDNOG
// bočnog komada, ne samo jedan 'wall'/'corner'/'pillar' tip za CIJELI
// blok. Stari pristup je birao JEDAN tip i stao - što je značilo da
// blok s 3 izložene strane (npr. 2 bloka jedan pored drugog) dobije
// corner komad za SAMO 2 od 3 strane, treća ostaje potpuno gola. Blok s
// 2 NASUPROTNE izložene strane (sredina reda od 4 bloka) nije ni imao
// odgovarajući corner par (nisu susjedne), pa je padao na JEDAN wall
// komad - pokrivajući samo jednu od te dvije otvorene strane.
//
// Novi pristup: greedy pakiranje. wall-corner.glb već pokriva DVIJE
// okomite strane kao jedan asset (potvrđeno vizualnom inspekcijom) -
// pa prvo uparimo susjedne izložene strane u corner komade, a sve što
// ostane nepokriveno dobiva svoj vlastiti wall/door/window komad (jedan
// PO STRANI, ne jedan po bloku). Ovo automatski rješava i "2 nasuprotne
// strane" slučaj (obje strane postaju zaseban wall, nijedan par nije
// susjedan pa se ništa ne uparuje) I "3 izložene strane" slučaj (jedan
// corner par + jedan wall za preostalu stranu) I izoliran blok sa 4
// strane (2 dijagonalna corner para koji zajedno potpuno zatvaraju
// ćeliju u ISTOM stilu kao ostatak zida - zamjenjuje raniji column.glb
// fallback koji je vizualno djelovao kao strano tijelo).
//
// Grid prostor: { x, y (visina), z (dubina) } - ista konvencija kao
// VoxelStore/VoxelBuilder/VoxelPreview.

const NEIGHBOR_OFFSETS = {
  top:    { x: 0, y: 1, z: 0 },
  bottom: { x: 0, y: -1, z: 0 },
  north:  { x: 0, y: 0, z: -1 },
  south:  { x: 0, y: 0, z: 1 },
  east:   { x: 1, y: 0, z: 0 },
  west:   { x: -1, y: 0, z: 0 },
};

function buildOccupancySet(voxels) {
  const set = new Set();
  for (const v of voxels) {
    set.add(`${v.x}|${v.y}|${v.z}`);
  }
  return set;
}

function isOccupied(occupancySet, x, y, z) {
  return occupancySet.has(`${x}|${y}|${z}`);
}

export function getExposedFaces(voxel, occupancySet) {
  const exposed = {};

  for (const [face, offset] of Object.entries(NEIGHBOR_OFFSETS)) {
    const neighborX = voxel.x + offset.x * 8; // SIZE = 8, ista konstanta kao VoxelBuilder
    const neighborY = voxel.y + offset.y * 8;
    const neighborZ = voxel.z + offset.z * 8;

    exposed[face] = !isOccupied(occupancySet, neighborX, neighborY, neighborZ);
  }

  return exposed;
}

function seededChance(voxel, salt = '') {
  const str = `${voxel.x}|${voxel.y}|${voxel.z}|${salt}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return (hash % 1000) / 1000;
}

const SIDE_FACES = ['north', 'south', 'east', 'west'];
const CORNER_PAIRS = [
  ['north', 'east'], ['east', 'south'],
  ['south', 'west'], ['west', 'north'],
];

/**
 * Klasificira blok - vraća { parts, exposed }.
 *
 * `parts` je sad array objekata { type, faces }, NE array stringova kao
 * u prošloj verziji - svaki part nosi svoju listu strana (1 za
 * wall/door/window, 2 za corner) da VoxelTile može odrediti TOČNU
 * rotaciju za TAJ komad, neovisno o ostalim dijelovima istog bloka.
 *
 * minY - visina najnižeg reda blokova u strukturi (prizemlje).
 */
export function classifyVoxel(voxel, occupancySet, minY = null) {
  const exposed = getExposedFaces(voxel, occupancySet);
  const exposedCount = Object.values(exposed).filter(Boolean).length;

  if (exposedCount === 0) {
    return { parts: [], exposed };
  }

  const exposedSides = SIDE_FACES.filter((f) => exposed[f]);
  const sideCount = exposedSides.length;
  const parts = [];

  // --- SIDE parts: greedy corner-pairing, then wall/door/window for
  // whatever's left uncovered ---
  const remaining = new Set(exposedSides);

  for (const [a, b] of CORNER_PAIRS) {
    if (remaining.has(a) && remaining.has(b)) {
      parts.push({ type: 'corner', faces: [a, b] });
      remaining.delete(a);
      remaining.delete(b);
    }
  }

  for (const face of remaining) {
    // Door/window randomization ostaje ograničena na slučaj kad blok
    // IMA SAMO JEDNU izloženu stranu ukupno - preostala pojedinačna
    // strana iz corner+wall kombinacije (3 izložene), ili jedna od
    // dvije nasuprotne strane, ostaje običan zid. Namjerno ograničeno
    // da se vrata ne pojavljuju na već neuobičajenim oblicima zida
    // (T-spojevi, prolazi) gdje bi djelovalo još čudnije.
    if (sideCount === 1) {
      const isGroundFloor = minY !== null && voxel.y === minY;
      const roll = seededChance(voxel, 'door-window');
      if (isGroundFloor && roll < 0.2) {
        parts.push({ type: 'door', faces: [face] });
        continue;
      }
      if (!isGroundFloor && roll < 0.3) {
        parts.push({ type: 'window', faces: [face] });
        continue;
      }
    }
    parts.push({ type: 'wall', faces: [face] });
  }

  // --- CAP part: i dalje JEDAN komad, neovisno koliko je side parts
  // iskorišteno. NAPOMENA - ovo je i dalje pojednostavljeno: nije
  // potvrđeno da bi slaganje više roof komada za 3-/4-izložene slučajeve
  // pristajalo jedno uz drugo na isti način kao wall komadi, pa se za
  // sve što nije jednostavan 0/1/2-susjedna-strana slučaj koristi ravan
  // krovni cap kao razumna aproksimacija umjesto nagađanja.
  if (exposed.top) {
    const cornerFaces = CORNER_PAIRS.find(([a, b]) => exposed[a] && exposed[b]);
    if (cornerFaces) {
      parts.push({ type: 'roof-corner', faces: cornerFaces });
    } else if (sideCount === 1) {
      parts.push({ type: 'roof-edge', faces: exposedSides });
    } else {
      parts.push({ type: 'roof-flat', faces: [] });
    }
  }

  return { parts, exposed };
}

/**
 * Klasificira cijelu strukturu odjednom.
 */
export function classifyStructure(voxels) {
  const occupancySet = buildOccupancySet(voxels);
  const minY = voxels.length > 0 ? Math.min(...voxels.map((v) => v.y)) : null;

  return voxels.map((v) => ({
    ...v,
    classification: classifyVoxel(v, occupancySet, minY),
  }));
}