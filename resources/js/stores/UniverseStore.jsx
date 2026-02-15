import { makeAutoObservable } from "mobx";
import { Inertia } from "@inertiajs/inertia";

class UniverseStore {
  zoomLevel = "universe"; // ✅ NEW: "universe" | "galaxy" | "system" | "node"
  activeGalaxy = null;    // ✅ NEW: { id, pos } or null
  activeSystem = null;    // { id, pos } or null

  constructor() {
    makeAutoObservable(this);
  }

  /* ------------------
     COMPUTED GETTERS
  ------------------ */

  get isUniverse() {
    return this.zoomLevel === "universe";
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

  get canReturnToUniverse() {
    return this.isGalaxy || this.isSystem || this.isNode;
  }

  get canReturnToGalaxy() {
    return this.isSystem || this.isNode;
  }

  get canReturnToSystem() {
    return this.isNode;
  }

  /* ------------------
     SETTERS
  ------------------ */

  setZoomLevel(level) {
    if (!["universe", "galaxy", "system", "node"].includes(level)) return;
    this.zoomLevel = level;
    console.log("🪐 Zoom level →", level);
  }

  setActiveGalaxy(galaxyOrNull) {
    this.activeGalaxy = galaxyOrNull;
    console.log("🌌 Active galaxy →", galaxyOrNull?.id || "none");
  }

  setActiveSystem(systemOrNull) {
    this.activeSystem = systemOrNull;
    console.log("⭐ Active system →", systemOrNull?.id || "none");
  }

  /* ------------------
     NAVIGATION
  ------------------ */

  returnToUniverse() {
    this.setZoomLevel("universe");
    this.activeGalaxy = null;
    this.activeSystem = null;
    Inertia.visit("/dashboard", {
      preserveState: true,
      preserveScroll: true,
    });
  }

  returnToGalaxy() {
    if (this.activeGalaxy?.id) {
      this.setZoomLevel("galaxy");
      this.activeSystem = null;
      Inertia.visit(`/galaxy/${this.activeGalaxy.id}`, {
        preserveState: true,
        preserveScroll: true,
      });
    } else {
      // Fallback to universe if no active galaxy
      this.returnToUniverse();
    }
  }

  returnToSystem() {
    if (this.activeSystem?.id && this.activeGalaxy?.id) {
      this.setZoomLevel("system");
      Inertia.visit(`/galaxy/${this.activeGalaxy.id}/${this.activeSystem.id}`, {
        preserveState: true,
        preserveScroll: true,
      });
    } else {
      this.returnToGalaxy();
    }
  }

  /* ------------------
     URL DETECTION
  ------------------ */

  detectFromUrl() {
    const path = window.location.pathname.split("/").filter(Boolean);

    // Auth pages
    if (["login", "register", "email"].includes(path[0])) {
      this.zoomLevel = "universe";
      this.activeGalaxy = null;
      this.activeSystem = null;
      return;
    }

    // Dashboard (Universe view)
    if (path.length === 0 || path[0] === "dashboard") {
      this.zoomLevel = "universe";
      this.activeGalaxy = null;
      this.activeSystem = null;
      return;
    }

    // Galaxy view: /galaxy/{galaxyId}
    if (path[0] === "galaxy" && path.length === 2) {
      this.zoomLevel = "galaxy";
      this.activeGalaxy = { id: path[1] };
      this.activeSystem = null;
      return;
    }

    // System view: /galaxy/{galaxyId}/{systemId}
    if (path[0] === "galaxy" && path.length === 3) {
      this.zoomLevel = "system";
      this.activeGalaxy = { id: path[1] };
      this.activeSystem = { id: path[2] };
      return;
    }

    // Node view: /galaxy/{galaxyId}/{systemId}/{nodeId}
    if (path[0] === "galaxy" && path.length === 4) {
      this.zoomLevel = "node";
      this.activeGalaxy = { id: path[1] };
      this.activeSystem = { id: path[2] };
      return;
    }

    // Fallback
    this.zoomLevel = "universe";
    this.activeGalaxy = null;
    this.activeSystem = null;
  }
}

export default UniverseStore;