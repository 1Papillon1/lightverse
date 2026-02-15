import { makeAutoObservable } from "mobx";

class UIStore {
  activeNode = "wallet";
  animated = true;
  triggerExplosion = false;

  navigationLeft = true;
  navigationState = "main";

  // UI loading
  universeReady = false;

  constructor() {
    makeAutoObservable(this);
  }

  toggleAnimated() {
    this.animated = !this.animated;
  }

  toggleNavigationLeft() {
    this.navigationLeft = !this.navigationLeft;
  }

  setNavigationState(state) {
    this.navigationState = state;
  }

  // Explosions
  requestExplosion() {
    this.triggerExplosion = true;
  }

  resetExplosion() {
    this.triggerExplosion = false;
  }

  // Setters
  setUniverseReady(val) {
    this.universeReady = val;
  }

  setActiveNode(node) {
    this.activeNode = node;
  }
}

export default UIStore;