import { makeAutoObservable } from "mobx";
import { router } from "@inertiajs/react";

class UserStore {
  rootStore;

  authorized = false;
  status = "";
  user = null;

  activeOverlay = null;
  overlayClosing = false;

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  /* ------------------
     AUTH
  ------------------ */

  onLoginSuccess(user) {
    this.authorized = true;
    this.user = user;
    this.closeOverlay();

    this.rootStore.lightwebCoinStore.initializeForUser();
  }

  logout() {
    router.post("/logout", {}, {
      preserveScroll: true,
      onFinish: () => {
        this.authorized = false;
        this.user = null;
        this.closeOverlay();

        this.rootStore.lightwebCoinStore.reset();
      },
    });
  }

  /* ------------------
     OVERLAYS
  ------------------ */

  openOverlay(name) {
    if (["login", "signup", "settings", "achievements", "admin"].includes(name)) {
      this.activeOverlay = name;
      this.overlayClosing = false;
    }
  }

  closeOverlayAnimated() {
    if (this.overlayClosing) return;

    this.overlayClosing = true;

    setTimeout(() => {
      this.activeOverlay = null;
      this.overlayClosing = false;
    }, 600);
  }

  closeOverlay() {
    this.activeOverlay = null;
    this.overlayClosing = false;
  }

  get overlayActive() {
    return !!this.activeOverlay;
  }
}

export default UserStore;
