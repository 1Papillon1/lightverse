import { makeAutoObservable } from "mobx";
import { Inertia } from "@inertiajs/inertia";

class UniverseStore {
  zoomLevel = "galaxy"; // "galaxy" | "system" | "node"
  activeSystem = null;  // { id, pos } or null

  constructor() {
    makeAutoObservable(this);
  }

  // --- Core setters ---
  setZoomLevel(level) {
    if (!["galaxy", "system", "node"].includes(level)) return;
    this.zoomLevel = level;
    console.log("🪐 Zoom level →", level);
  }

  setActiveSystem(systemOrNull) {
    this.activeSystem = systemOrNull;
    console.log("🌌 Active system →", systemOrNull?.id || "none");
  }

  // --- Navigation ---
  returnToSystemOrbit() {
    if (this.activeSystem?.id) {
      this.setZoomLevel("system");
      Inertia.visit(`/${this.activeSystem.id}`, {
        preserveState: true,
        preserveScroll: true,
      });
    } else {
      // fallback — infer from URL if store lost sync
      const parts = window.location.pathname.split("/").filter(Boolean);
      if (parts.length >= 2) {
        Inertia.visit(`/${parts[0]}`, { preserveState: true, preserveScroll: true });
      }
    }
  }

  returnToGalaxy() {
    this.setZoomLevel("galaxy");
    this.activeSystem = null;
    Inertia.visit("/dashboard", {
      preserveState: true,
      preserveScroll: true,
    });
  }

  // --- Detect zoom state from URL ---
  detectFromUrl() {
    const path = window.location.pathname.split("/").filter(Boolean);

    if (path.length === 0 || path[0] === "dashboard") {
      this.setZoomLevel("galaxy");
      this.activeSystem = null;
    } else if (path.length === 1) {
      this.setZoomLevel("system");
      this.activeSystem = { id: path[0] };
    } else if (path.length >= 2) {
      this.setZoomLevel("node");
      this.activeSystem = { id: path[0] };
    }
  }
}

export default UniverseStore;
