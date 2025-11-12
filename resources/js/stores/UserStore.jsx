// UserStore.js
import { makeAutoObservable } from "mobx";
import { router } from "@inertiajs/react";

class UserStore {
  rootStore;
  authorized = false;
  status = "";
  user = null;

  // current overlay: "login" | "signup" | "settings" | null
  activeOverlay = null;

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  // --- Overlay handling ---
  openOverlay(name) {
    if (["login", "signup", "settings"].includes(name)) {
      this.activeOverlay = name;
    }
  }

  closeOverlay() {
    this.activeOverlay = null;
  }

  toggleOverlay(name) {
    if (this.activeOverlay === name) {
      this.closeOverlay();
    } else {
      this.openOverlay(name);
    }
  }

  // --- Auth handling ---
  loggedIn(username, password) {
    if (username === "admin" && password === "admin") {
      this.authorized = true;
      this.user = { username };
      this.closeOverlay(); // close login on success
    } else {
      this.status = "Username or password is incorrect";
    }
  }

  logout() {
    router.post(
      "/logout",
      {},
      {
        preserveScroll: true,
        onFinish: () => {
          this.user = null;
          this.authorized = false;
          this.closeOverlay();
        },
      }
    );
  }
}

export default UserStore;
