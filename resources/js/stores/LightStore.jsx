import { makeAutoObservable } from "mobx";

class LightStore {
  coreLight   = 0;
  stableLight = 0;
  activeLight = 0;
  totalLight  = 0;
  _pollInterval = null;

  constructor() {
    makeAutoObservable(this);
  }

  hydrate(light) {
    if (!light) return;
    this.coreLight   = light.core   ?? 0;
    this.stableLight = light.stable ?? 0;
    this.activeLight = light.active ?? 0;
    this.totalLight  = light.total  ?? 0;
  }

  async refresh() {
    try {
      const res  = await fetch("/api/light");
      const data = await res.json();
      this.coreLight   = data.core   ?? 0;
      this.stableLight = data.stable ?? 0;
      this.activeLight = data.active ?? 0;
      this.totalLight  = data.total  ?? 0;
    } catch (e) {
      console.warn("Light refresh failed", e);
    }
  }

  startPolling(intervalMs = 60000) {
    this.stopPolling();
    this._pollInterval = setInterval(() => this.refresh(), intervalMs);
  }

  stopPolling() {
    if (this._pollInterval) {
      clearInterval(this._pollInterval);
      this._pollInterval = null;
    }
  }
}

export default LightStore;