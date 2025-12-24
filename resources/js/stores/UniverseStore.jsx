import { makeAutoObservable } from "mobx";
import { Inertia } from "@inertiajs/inertia";

class UniverseStore {
  zoomLevel = "galaxy"; // "galaxy" | "system" | "node"
  activeSystem = null;  // { id, pos } or null

  constructor() {
    makeAutoObservable(this);
  }

    get isGalaxy() {
    return this.zoomLevel === "galaxy";
  }

  get isSystem() {
    return this.zoomLevel === "system";
  }

  get isNode() {
    return this.zoomLevel === "node";
  }

  get canReturnToGalaxy() {
    return this.isSystem || this.isNode;
  }

  get canReturnToSystem() {
    return this.isNode;
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

  if (["login", "register", "email"].includes(path[0])) {
    this.zoomLevel = "galaxy";
    this.activeSystem = null;
    return;
  }

  if (path.length === 0 || path[0] === "dashboard") {
    this.zoomLevel = "galaxy";
    this.activeSystem = null;
    return;
  }

  // SYSTEM ROOT ONLY
  if (path.length === 1) {
    this.zoomLevel = "system";
    this.activeSystem = { id: path[0] };
    return;
  }

  // NODE VIEW
  this.zoomLevel = "node";
  this.activeSystem = { id: path[0] };
}
}

export default UniverseStore;
