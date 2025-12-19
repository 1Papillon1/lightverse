// LightwebCoinStore.js
import { makeAutoObservable, runInAction } from "mobx";
import axios from "axios";
import parseSpawnLocation from "./utils/parseSpawnLocation";


let instance = null;



export default class LightwebCoinStore {
rootStore;


drops = [];
balance = 0;


initializedForUser = false;


isPickupFrozen = false;
activePickup = null;



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
this.consumed.clear();
}


async fetchDrops() {
const { data } = await axios.get("/lightcoins/drops", { withCredentials: true });
runInAction(() => (this.drops = data));
}

isBeingPickedUp(id) {
  return this.activePickup === id;
}

async fetchBalance() {
const { data } = await axios.get("/lightcoins/balance", { withCredentials: true });
runInAction(() => (this.balance = data.balance ?? 0));
}


beginPickup(id) {
  if (this.isPickupFrozen || this.activePickup || this.consumed.has(id)) return;

  this.isPickupFrozen = true;
  this.activePickup = id;
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
  
    this.isPickupFrozen = false;
  });
}


get filteredDrops() {
  if (!this.rootStore.userStore.authorized) return [];

  const zoom = this.rootStore.universeStore.zoomLevel;
  const activeSystem = this.rootStore.universeStore.activeSystem?.id || null;

  console.log(
  "🪙 Visible drops:",
  this.drops.map(d => ({
    id: d.id,
    loc: d.spawn_location,
    parsed: parseSpawnLocation(d.spawn_location),
  }))
);

  const pathname = window.location.pathname
    .replace(/^\/+/, "")
    .replace(/\//g, ".");

  return this.drops.filter(d => {
    const parsed = parseSpawnLocation(d.spawn_location);
    if (!parsed) return false;

    /* 🌌 GALAXY */
    if (zoom === "galaxy") {
      return parsed.type === "galaxy";
    }

    /* 🪐 SYSTEM */
    if (zoom === "system") {
      return (
        parsed.type === "system" &&
        parsed.value === activeSystem
      );
    }

    /* 📄 NODE (page) */
    if (zoom === "node") {
      return (
        parsed.type === "page" &&
        parsed.value === pathname
      );
    }

    return false;
  });
}

}