// resources/js/stores/LightwebCoinStore.js
import { makeAutoObservable, runInAction } from "mobx";
import axios from "axios";

let instance = null; // <-- Singleton guard

export default class LightwebCoinStore {
    rootStore;

    drops = [];
    balance = 0;

    isPickupFrozen = false;
    activePickup = null;
    pickupProgress = 0;

    pollingInterval = null;
    alreadyInitialized = false;

    coinPrototype = null;
    

    constructor(rootStore) {
        if (instance) return instance;       // return existing instance

        instance = this;

        this.rootStore = rootStore;
        makeAutoObservable(this);

        return instance;
    }

    // --------------------------
    // Initialization (run once)
    // --------------------------
    initialize() {
          if (this.alreadyInitialized) return;
            this.alreadyInitialized = true;

            this.fetchBalance();   // ✅ NEW
            this.fetchDrops();     // existing
    }

    // --------------------------
    // API CALLS
    // --------------------------
    async fetchDrops() {
        try {
            const { data } = await axios.get("/lightcoins/drops", {
                withCredentials: true
            });

            runInAction(() => {
                this.drops = data;
            });
        } catch (e) {
            console.error("fetchDrops error", e);
        }
    }

    // Optional: Only if you ever want re-enable polling later
    startPolling(interval = 15000) {
        if (this.pollingInterval) return;
        this.pollingInterval = setInterval(() => this.fetchDrops(), interval);
    }

    stopPolling() {
        if (!this.pollingInterval) return;
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
    }

    // --------------------------
    // CLAIM COIN
    // --------------------------
    async claimDropServer(dropId) {
        try {
            const { data } = await axios.post(
                `/lightcoins/claim/${dropId}`,
                {},
                { withCredentials: true }
            );

            runInAction(() => {
                if (data.new_balance != null) this.balance = data.new_balance;
                this.drops = this.drops.filter((d) => d.id !== dropId);
            });

            return { ok: true, data };
        } catch (e) {
            console.error("claimDrop error", e);
            return { ok: false, error: e };
        }
    }

    // --------------------------
    // PICKUP UI FLOW CONTROL
    // --------------------------
   

    async fetchBalance() {
    try {
        const { data } = await axios.get("/lightcoins/balance", {
            withCredentials: true,
        });

        runInAction(() => {
            this.balance = data.balance ?? 0;
        });
    } catch (e) {
        console.error("fetchBalance error", e);
    }
}

 beginPickup(dropId) {
        if (this.isPickupFrozen) return false;
        this.isPickupFrozen = true;
        this.activePickup = dropId;
        this.pickupProgress = 0;
        return true;
    }

    setPickupProgress(p) {
        this.pickupProgress = Math.min(1, Math.max(0, p));
    }

    async finishPickup(dropId, serverNewBalance = null) {
        this.isPickupFrozen = false;
        this.activePickup = null;
        this.pickupProgress = 0;

        if (serverNewBalance != null) this.balance = serverNewBalance;

        // Refresh drops after pickup
        await this.fetchDrops();
    }

    

    // --------------------------
    // FILTERED DROPS (computed)
    // --------------------------
    get filteredDrops() {
        const universeStore = this.rootStore.universeStore;
        const zoom = universeStore?.zoomLevel || "galaxy";
        const activeSystem = universeStore?.activeSystem?.id || null;

        const rawPath = window.location.pathname; 
        const normalized = rawPath.replace(/\/$/, "").toLowerCase();
        const nodeKey = normalized.startsWith("/")
            ? normalized.substring(1)
            : normalized;

        // ------------------------------
        // GALAXY VIEW
        // ------------------------------
        if (zoom === "galaxy") {
            return this.drops.filter(d => 
            d.spawn_location === "galaxy"
            );
        }

        // ------------------------------
        // SYSTEM VIEW
        // ------------------------------
        if (zoom === "system") {
            if (!activeSystem) return [];
            return this.drops.filter(d =>
            d.spawn_location === `system:${activeSystem}`
            );
        }

        // ------------------------------
        // NODE / PAGE VIEW
        // ------------------------------
        if (zoom === "node") {
            return this.drops.filter(d => {
            if (!d.spawn_location) return false;

            // system-level fallback
            if (d.spawn_location === `system:${activeSystem}`) return true;

            // page exact match
            if (d.spawn_location === `page:${nodeKey}`) return true;

            return false;
            });
        }

        return this.drops;
        }


        setCoinPrototype(scene) {
            this.coinPrototype = scene;
            }
}
