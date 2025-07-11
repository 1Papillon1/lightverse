import { createContext, useContext } from "react";
import UIStore from "./UIStore";
import UserStore from "./UserStore";
import MarketStore from "./MarketStore";
import { makeAutoObservable } from "mobx";




class RootStore {

    history;
    uiStore;
    userStore;
    marketStore;

    constructor() {
        this.uiStore = new UIStore(this);
        this.userStore = new UserStore(this);
        this.marketStore = new MarketStore(this);
        makeAutoObservable(this);
    }

    navigate(navigateFn, path) {
        if (navigateFn) {
            navigateFn(path);
        }
    }
}

export const rootStore = new RootStore();
export const RootStoreContext = createContext(rootStore);

export const useRootStore = () => {
    return useContext(RootStoreContext);
};