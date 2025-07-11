import { makeAutoObservable } from "mobx";

class UserStore {
    rootStore;
    authorized = false;
    status = "";

    user = null;
    tutorialCompleted = false;

    constructor(rootStore) {
        this.rootStore = rootStore;
        makeAutoObservable(this);
    }


    loggedIn(username, password) {
        if (username === "admin" && password === "admin") {
            this.authorized = true;
            this.user = { username };
        } else {
            this.status = "Username or password is incorrect";
        }

        
    }

    
    logout() {
        this.user = null;
    }

    // remember tutorial completion in cookies or local storage
    isTutorialCompleted() {
        if (!this.tutorialCompleted) {
            const completed = localStorage.getItem("tutorialCompleted");
            if (completed === "true") {
                this.tutorialCompleted = true;
            } else {
                this.tutorialCompleted = false;
            }
        }

    }
    


    // Tutorial management

    setTutorialCompleted() {
        this.tutorialCompleted = true;

    }

    activateTutorial() {
        this.tutorialCompleted = false;
    }


}

export default UserStore;