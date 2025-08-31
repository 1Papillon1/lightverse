import { makeAutoObservable } from "mobx";

class UIStore {
    activeNode = "wallet";
    animated = true;
    triggerExplosion = false;


    navigationLeft = true;
    navigationState = "main";

 

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


    // explosions
    requestExplosion() {
        this.triggerExplosion = true;
    }

    resetExplosion() {
        this.triggerExplosion = false;
    }

    
  setActiveNode(node) {
    this.activeNode = node;
  }

}

export default UIStore;