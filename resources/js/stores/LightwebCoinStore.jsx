import { makeAutoObservable, runInAction } from "mobx";
import axios from "axios";

/* 🔑 SINGLETON INSTANCE (REQUIRED) */
let instance = null;

export default class LightwebCoinStore {
    rootStore;

    drops = [];
    balance = 0;

    initializedForUser = false;

    isPickupFrozen = false;
    activePickup = null;
    pickupProgress = 0;

    constructor(rootStore) {
        if (instance) return instance;
        instance = this;

        this.rootStore = rootStore;
        makeAutoObservable(this);
    }

    /* --------------------------
       AUTH-AWARE INITIALIZATION
    -------------------------- */
    initializeForUser() {
        const userStore = this.rootStore.userStore;

        if (!userStore.authorized) return;
        if (this.initializedForUser) return;

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
    }

    /* --------------------------
       API CALLS (GUARDED)
    -------------------------- */
    async fetchDrops() {
        if (!this.rootStore.userStore.authorized) return;

        try {
            const { data } = await axios.get("/lightcoins/drops", {
                withCredentials: true,
            });

            runInAction(() => {
                this.drops = data;
            });
        } catch {
            // silent fail during auth transitions
        }
    }

    async fetchBalance() {
        if (!this.rootStore.userStore.authorized) return;

        try {
            const { data } = await axios.get("/lightcoins/balance", {
                withCredentials: true,
            });

            runInAction(() => {
                this.balance = data.balance ?? 0;
            });
        } catch {
            // silent
        }
    }

    /* --------------------------
       COMPUTED (SAFE)
    -------------------------- */
    get filteredDrops() {
        if (!this.rootStore.userStore.authorized) return [];

        const universeStore = this.rootStore.universeStore;
        const zoom = universeStore?.zoomLevel || "galaxy";
        const activeSystem = universeStore?.activeSystem?.id || null;

        const normalized = window.location.pathname
            .replace(/\/$/, "")
            .toLowerCase()
            .replace(/^\//, "");

        if (zoom === "galaxy") {
            return this.drops.filter(d => d.spawn_location === "galaxy");
        }

        if (zoom === "system") {
            if (!activeSystem) return [];
            return this.drops.filter(
                d => d.spawn_location === `system:${activeSystem}`
            );
        }

        if (zoom === "node") {
            return this.drops.filter(d =>
                d.spawn_location === `system:${activeSystem}` ||
                d.spawn_location === `page:${normalized}`
            );
        }

        return [];
    }
}
