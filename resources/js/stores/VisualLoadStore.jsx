import { makeAutoObservable } from "mobx";

export default class VisualLoadStore {
  universeReady = false;

  constructor() {
    makeAutoObservable(this);
  }

  markUniverseReady() {
    this.universeReady = true;
  }

  reset() {
    this.universeReady = false;
  }
}
