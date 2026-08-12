// resources/js/stores/VoxelStore.js
import { makeAutoObservable, runInAction } from "mobx";
import axios from "axios";

const SYNC_DEBOUNCE_MS = 2000;

/**
 * Grid prostor (jedini format u kojem se voxeli spremaju i šalju na server):
 *   { x, y, z }  gdje je   x = lijevo/desno,  y = visina,  z = dubina
 *
 * VoxelBuilder je odgovoran za pretvorbu ovog formata u lokalni Three.js
 * prostor za render (vidi toLocalPosition u VoxelBuilder.jsx). Store se
 * time uopće ne bavi - on samo drži i sinkronizira grid koordinate.
 */
class VoxelStore {
  voxels = [];
  maxBlocks = 20;
  loading = false;
  syncing = false;
  planetId = null;
  _syncTimer = null;

  constructor() {
    makeAutoObservable(this, {
      // interni timer ne treba biti observable
      _syncTimer: false,
    });
  }

  hasVoxelAt(pos) {
    return this.voxels.some(
      (v) => v.x === pos.x && v.y === pos.y && v.z === pos.z
    );
  }

  get isFull() {
    return this.voxels.length >= this.maxBlocks;
  }

  async fetchVoxels(planetId) {
    this.planetId = planetId;
    this.loading = true;
    try {
      const { data } = await axios.get(`/api/voxels/${planetId}`);
      runInAction(() => {
        this.voxels = Array.isArray(data.data) ? data.data : [];
        this.maxBlocks = data.limit ?? this.maxBlocks;
        this.loading = false;
      });
    } catch (err) {
      console.error("VoxelStore: greška pri dohvaćanju voxela", err);
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  /**
   * Dodaje blok. Vraća true/false ovisno o uspjehu, tako da UI
   * (VoxelBuilder) može odlučiti hoće li nešto prikazati korisniku
   * (npr. "limit dosegnut") bez da store zna za UI.
   */
  addVoxel(pos) {
    if (!pos) return false;
    if (this.isFull) return false;
    if (this.hasVoxelAt(pos)) return false;

    this.voxels.push({ x: pos.x, y: pos.y, z: pos.z });
    this._scheduleSync();
    return true;
  }

  removeVoxel(pos) {
    if (!pos) return;
    const before = this.voxels.length;
    this.voxels = this.voxels.filter(
      (v) => !(v.x === pos.x && v.y === pos.y && v.z === pos.z)
    );
    if (this.voxels.length !== before) this._scheduleSync();
  }

  /**
   * Mjesto za buduću "spajanje više blokova u jedan" funkcionalnost.
   * Kad dođemo do toga: prolazi kroz voxels, traži susjedne blokove
   * istog materijala i grupira ih u jedan entry s size: {w,h,d} umjesto
   * pojedinačnih 1x1x1 blokova. Sad je namjerno isključeno dok
   * koordinate/store nisu bili čvrsti - a sad jesu.
   */

  _scheduleSync() {
    if (this._syncTimer) clearTimeout(this._syncTimer);
    this._syncTimer = setTimeout(() => {
      this.syncToServer();
    }, SYNC_DEBOUNCE_MS);
  }

  async syncToServer() {
    if (!this.planetId || this.syncing) return;
    this.syncing = true;
    try {
      await axios.post(`/api/voxels/${this.planetId}`, {
        data: this.voxels.slice(),
      });
    } catch (err) {
      console.error("VoxelStore: greška pri spremanju voxela", err);
    } finally {
      runInAction(() => {
        this.syncing = false;
      });
    }
  }

  /** Poziva se npr. na unmount da se ne izgubi zadnja izmjena ako je debounce još u tijeku. */
  flushSync() {
    if (this._syncTimer) {
      clearTimeout(this._syncTimer);
      this._syncTimer = null;
    }
    return this.syncToServer();
  }
}

export default VoxelStore;