// resources/js/stores/RootStore.js
import { createContext, useContext } from "react";
import UIStore from "./UIStore";
import UserStore from "./UserStore";
import MarketStore from "./MarketStore";
import TutorialStore from "./TutorialStore";
import AdminStore from "./AdminStore";
import UniverseStore from "./UniverseStore";
import NarratorStore from "./NarratorStore";
import VisualLoadStore from "./VisualLoadStore";
import LightwebCoinStore from "./LightwebCoinStore";
import { makeAutoObservable } from "mobx";

class RootStore {

    uiStore;
    userStore;
    marketStore;
    tutorialStore;
    adminStore;
    narratorStore;
    universeStore;
    visualLoadStore;
    lightwebCoinStore;

    constructor() {
        this.uiStore = new UIStore(this);
        this.userStore = new UserStore(this);
        this.marketStore = new MarketStore(this);
        this.tutorialStore = new TutorialStore(this);
        this.adminStore = new AdminStore(this);
        this.universeStore = new UniverseStore(this);
        this.narratorStore = new NarratorStore(this);
        this.visualLoadStore = new VisualLoadStore(this);
        this.lightwebCoinStore = new LightwebCoinStore(this);

        makeAutoObservable(this);

        // 👇 ADD THIS
        this.lightwebCoinStore.initialize();
    }

    navigate(navigateFn, path) {
        if (navigateFn) {
            navigateFn(path);
        }
    }
}

export const rootStore = new RootStore();
export const RootStoreContext = createContext(rootStore);

export const useRootStore = () => useContext(RootStoreContext);
