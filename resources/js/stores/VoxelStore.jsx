// resources/js/stores/VoxelStore.js
import { makeAutoObservable, runInAction } from "mobx";
import axios from "axios";

class VoxelStore {
  voxels = [];
  hoverPos = null;
  loading = false;
  SIZE = 8;
  Y_SINK = 8 * 0.45;
  maxBlocks = 20;

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  async fetchVoxels(planetId) {
    this.loading = true;
    try {
      const { data } = await axios.get(`/api/voxels/${planetId}`);
      runInAction(() => {
        this.voxels = data.data || [];
        this.maxBlocks = data.limit || 20;
        this.loading = false;
      });
    } catch (e) {
      runInAction(() => (this.loading = false));
    }
  }

  async persist(planetId) {
    try {
      await axios.post(`/api/voxels/${planetId}`, { data: this.voxels });
    } catch (e) { console.error("Save failed", e); }
  }

  setHover(pos) { this.hoverPos = pos; }

  addVoxel(pos, planetId) {
    if (this.voxels.length >= this.maxBlocks) return alert("Limit reached!");
    
    if (this.voxels.some(v => 
      Math.abs(v.x - pos.x) < 0.1 && Math.abs(v.y - pos.y) < 0.1 && Math.abs(v.z - pos.z) < 0.1
    )) return;

    const newV = { ...pos, size: this.SIZE };
    this.voxels = this._mergePass([...this.voxels, newV], this.SIZE);
    this.persist(planetId);
  }

  removeVoxel(meshPos, planetId) {
    // 🚀 FIX: Usklađivanje osi za brisanje (v.z u renderu je visina v.y)
    this.voxels = this.voxels.filter(v =>
      !(Math.abs(v.x - meshPos.x) < 0.1 &&
        Math.abs(v.y - meshPos.z) < 0.1 && 
        Math.abs(v.z - meshPos.y) < 0.1)
    );
    this.persist(planetId);
  }

  _mergePass(list, size) {
    const nextSize = size * 2;
    let merged = false;
    const used = new Set();
    const result = [];

    for (let i = 0; i < list.length; i++) {
      if (used.has(i)) continue;
      const v = list[i];
      if (v.size !== size) { result.push(v); continue; }

      const ax = Math.floor(v.x / nextSize) * nextSize;
      const ay = Math.floor((v.y + this.Y_SINK) / nextSize) * nextSize - this.Y_SINK;
      const az = Math.floor(v.z / nextSize) * nextSize;

      const expected = [];
      for (let dx = 0; dx < 2; dx++)
        for (let dy = 0; dy < 2; dy++)
          for (let dz = 0; dz < 2; dz++)
            expected.push({ x: ax + dx * size + size / 2, y: ay + dy * size + size / 2, z: az + dz * size + size / 2 });

      const matches = [];
      for (const exp of expected) {
        const idx = list.findIndex((lv, li) => !used.has(li) && lv.size === size && Math.abs(lv.x - exp.x) < 0.1 && Math.abs(lv.y - exp.y) < 0.1 && Math.abs(lv.z - exp.z) < 0.1);
        if (idx !== -1) matches.push(idx);
      }

      if (matches.length === 8) {
        matches.forEach(idx => used.add(idx));
        result.push({ x: ax + nextSize / 2, y: ay + nextSize / 2, z: az + nextSize / 2, size: nextSize });
        merged = true;
      } else { result.push(v); used.add(i); }
    }
    return merged ? this._mergePass(result, nextSize) : result;
  }
}
export default VoxelStore;