// AdminStore.jsx

import { makeAutoObservable } from "mobx";

class AdminStore {
    disabled = true;
    panelVisible = false;
    cryptoList = [];

    constructor() {
        
        makeAutoObservable(this);

        
    }

    togglePanelVisibility() {
        this.panelVisible = !this.panelVisible;
    }

    addCrypto(newCrypto) {
        this.cryptoList.push(newCrypto);
    }

    deleteCrypto(index) {
        this.cryptoList.splice(index, 1);
    }



}

export default AdminStore;