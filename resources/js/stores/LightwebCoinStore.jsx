// LightwebCoinStore.js
import { makeAutoObservable, runInAction } from "mobx";
import axios from "axios";


let instance = null;


export default class LightwebCoinStore {
rootStore;


drops = [];
balance = 0;


initializedForUser = false;


isPickupFrozen = false;
activePickup = null;
pickupProgress = 0;
consumed = new Set();


constructor(rootStore) {
if (instance) return instance;
instance = this;


this.rootStore = rootStore;
makeAutoObservable(this);
}


initializeForUser() {
if (!this.rootStore.userStore.authorized || this.initializedForUser) return;
this.initializedForUser = true;
this.fetchBalance();
this.fetchDrops();
}


reset() {
this.drops = [];
this.balance = 0;
this.initializedForUser = false;
this.isPickupFrozen = false;
this.activePickup = null;
this.pickupProgress = 0;
this.consumed.clear();
}


async fetchDrops() {
const { data } = await axios.get("/lightcoins/drops", { withCredentials: true });
runInAction(() => (this.drops = data));
}


async fetchBalance() {
const { data } = await axios.get("/lightcoins/balance", { withCredentials: true });
runInAction(() => (this.balance = data.balance ?? 0));
}


beginPickup(id) {
  if (this.isPickupFrozen) return;
  if (this.activePickup) return;
  if (this.consumed.has(id)) return;

  this.isPickupFrozen = true;
  this.activePickup = id;
  this.pickupProgress = 0;
}


setPickupProgress(p) {
this.pickupProgress = p;
}


getDrop(id) {
return this.drops.find((d) => d.id === id);
}


isConsumed(id) {
return this.consumed.has(id);
}


async consumePickup(id) {
  if (this.consumed.has(id)) return;

  this.consumed.add(id);

  let res;
  try {
    res = await axios.post(
      `/lightcoins/claim/${id}`,
      {},
      { withCredentials: true }
    );
  } catch {
    // rollback on failure
    runInAction(() => {
      this.consumed.delete(id);
      this.isPickupFrozen = false;
      this.activePickup = null;
    });
    return;
  }

  runInAction(() => {
    this.balance = res.data?.new_balance ?? this.balance + 1;
    this.drops = this.drops.filter(d => d.id !== id);
    this.activePickup = null;
    this.pickupProgress = 0;
    this.isPickupFrozen = false;
  });
}


get filteredDrops() {
  if (!this.rootStore.userStore.authorized) return [];

  const universeStore = this.rootStore.universeStore;
  const zoom = universeStore.zoomLevel;
  const activeSystem = universeStore.activeSystem?.id || null;

  const normalizedPath = window.location.pathname
    .replace(/\/$/, "")
    .toLowerCase()
    .replace(/^\//, ""); // e.g. "overview/about"

  return this.drops.filter(d => {
    const loc = d.spawn_location;
    if (!loc) return false;

    /* 🌌 GALAXY */
    if (zoom === "galaxy") {
      return loc === "galaxy";
    }

    /* 🪐 SYSTEM ROOT (/overview) */
    if (zoom === "system") {
      return loc === `system:${activeSystem}`;
    }

    /* 📄 NODE (/overview/about, etc.) */
    if (zoom === "node") {
      return (
        // page-specific coin
        loc === `page:${normalizedPath}` ||

        // system coin shared across all nodes of this system
        loc === `system:${activeSystem}`
      );
    }

    return false;
  });
}

}