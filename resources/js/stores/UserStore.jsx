// UserStore.js
import { makeAutoObservable } from "mobx";
import { router } from "@inertiajs/react";

class UserStore {
  rootStore;
  authorized = false;
  status = "";
  user = null;
  activeOverlay = null;

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  /* ------------------
     AUTH
  ------------------ */

  // Fetch user coins on authorization
  onLoginSuccess(user) {
    this.authorized = true;
    this.user = user;
    this.closeOverlay();

    // 🔑 INIT COINS HERE
    this.rootStore.lightwebCoinStore.initializeForUser();
  }

  logout() {
    router.post("/logout", {}, {
      preserveScroll: true,
      onFinish: () => {
        this.authorized = false;
        this.user = null;
        this.closeOverlay();

        // 🔑 SINGLE SOURCE OF TRUTH
        this.rootStore.lightwebCoinStore.reset();
      },
    });
  }

  /* ------------------
     OVERLAYS
  ------------------ */

  openOverlay(name) {
    if (["login", "signup", "settings", "achievements"].includes(name)) {
      this.activeOverlay = name;
    }
  }

  closeOverlay() {
    this.activeOverlay = null;
  }

  toggleOverlay(name) {
    this.activeOverlay === name ? this.closeOverlay() : this.openOverlay(name);
  }

  get overlayActive() {
    return !!this.activeOverlay;
  }
}

export default UserStore;
