import { makeAutoObservable } from "mobx";
import { Inertia } from "@inertiajs/inertia";
import { universeConfig } from "@/config/universe";

class UniverseStore {
  zoomLevel = "universe"; // ✅ NEW: "universe" | "galaxy" | "system" | "node"
  activeGalaxy = null;    // ✅ NEW: { id, pos } or null
  activeSystem = null;    // { id, pos } or null
  activeNode = null;      // { id } or null

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
    this.activeSystem = null; // Reset system when galaxy changes
    this.activeNode = null; // Reset node when galaxy changes
    console.log("🌌 Active galaxy →", galaxyOrNull?.id || "none");
  }

  setActiveSystem(systemOrNull) {
    this.activeSystem = systemOrNull;
    this.activeNode = null; // Reset node when system changes
    console.log("⭐ Active system →", systemOrNull?.id || "none");
  }

   setActiveNode(nodeOrNull) {          // ✅ add this setter
    this.activeNode = nodeOrNull;
    console.log("🪐 Active node →", nodeOrNull?.id || "none");
  }

  /* ------------------
     NAVIGATION
  ------------------ */

  returnToUniverse() {
    this.setZoomLevel("universe");
    this.activeGalaxy = null;
    this.activeSystem = null;
    this.activeNode = null;
    Inertia.visit("/dashboard", {
      preserveState: true,
      preserveScroll: true,
    });
  }

  returnToGalaxy() {
    if (this.activeGalaxy?.id) {
      this.setZoomLevel("galaxy");
      this.activeSystem = null;
      this.activeNode = null;
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
    this.activeNode = null;   // ✅ make sure this is cleared
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
  const path = window.location.pathname;

  if (path === "/" || path === "/dashboard") {
    this.zoomLevel = "universe";
    this.activeGalaxy = null;
    this.activeSystem = null;
    this.activeNode = null;
    return;
  }

  if (["login", "register", "email"].some(p => path.startsWith("/" + p))) {
    this.zoomLevel = "universe";
    this.activeGalaxy = null;
    this.activeSystem = null;
    this.activeNode = null;
    return;
  }

  for (const galaxy of universeConfig.galaxies) {
    if (path === galaxy.route) {
      this.zoomLevel = "galaxy";
      this.activeGalaxy = { id: galaxy.id, pos: galaxy.position, label: galaxy.label };
      this.activeSystem = null;
      this.activeNode = null;
      return;
    }

    for (const system of galaxy.starSystems) {
      if (path === system.route) {
        this.zoomLevel = "system";
        this.activeGalaxy = { id: galaxy.id, pos: galaxy.position, label: galaxy.label };
        this.activeSystem = { id: system.id, pos: system.position, label: system.label };
        this.activeNode = null;
        return;
      }

      for (const node of system.nodes ?? []) {
        if (path === node.route) {
          this.zoomLevel = "node";
          this.activeGalaxy = { id: galaxy.id, pos: galaxy.position, label: galaxy.label };
          this.activeSystem = { id: system.id, pos: system.position, label: system.label };
          this.activeNode = { id: node.id, label: node.label };
          return;
        }
      }
    }
  }

  // Fallback
  this.zoomLevel = "universe";
  this.activeGalaxy = null;
  this.activeSystem = null;
  this.activeNode = null;
}
}

export default UniverseStore;