import { makeAutoObservable, runInAction } from "mobx";
import axios from "axios";

class AchievementsStore {
  achievements = [];
  loading = false;
  error = null;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchAchievements() {
    this.loading = true;
    this.error = null;

    try {
      const res = await axios.get("/identity/achievements/data");

      runInAction(() => {
        const data = res.data?.achievements ?? [];
        this.achievements = Array.isArray(data) ? data : [];
        this.loading = false;
      });
      console.log("✅ Achievements fetched", this.achievements);
    } catch (e) {
      console.error("❌ Achievements fetch failed", e);
      runInAction(() => {
        this.error = e;
        this.loading = false;
      });
    }
  }

  get byCategory() {
    return this.achievements.reduce((acc, a) => {
      const category = a.category ?? "uncategorized";
      acc[category] ??= [];
      acc[category].push(a);
      return acc;
    }, {});
  }
}

export default AchievementsStore;
