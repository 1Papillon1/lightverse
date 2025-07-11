import { makeAutoObservable } from "mobx";

class UIStore {

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

}

export default UIStore;