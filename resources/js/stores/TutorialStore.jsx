import { makeAutoObservable } from "mobx";

class TutorialStore {
  isActive = false;
  activeScene = "";
  activeStep = 0;
  deviceType = "desktop";
  completed = false;
  completedSteps = new Set();
  steps = {};

  constructor() {
    makeAutoObservable(this);
    this.loadFromStorage();
    this.detectDeviceType();

    this.steps = {
      dashboard: [
        {
          id: 1,
          textDesktop: "Click and drag to rotate the universe.",
          instruction: "(Hold left mouse button and move)",
          textMobile: "Swipe with one finger to rotate the universe.",
        },
        {
          id: 2,
          textDesktop: "Scroll to zoom in.",
          instruction: "(Mouse scroll up)",
          textMobile: "Pinch inward to zoom in.",
        },
        {
          id: 3,
          textDesktop: "Scroll to zoom out.",
          instruction: "(Mouse scroll down)",
          textMobile: "Pinch outward to zoom out.",
        },
        {
          id: 4,
          textDesktop: "Click on a node to finish the tutorial.",
          instruction: "(Left-click on a planet node)",
          textMobile: "Tap a node to finish the tutorial.",
        },
      ]
    };
  }

  detectDeviceType() {
    this.deviceType = /Mobi|Android/i.test(navigator.userAgent)
      ? "mobile"
      : "desktop";
  }

  startTutorial(scene) {
    if (this.completed) return;
    this.isActive = true;
    this.activeScene = scene;
    this.activeStep = 0;
    this.completedSteps = new Set();
  }

  nextStep() {
    if (this.activeStep < this.steps[this.activeScene].length - 1) {
      this.activeStep += 1;
    } else {
      this.finishTutorial();
    }
  }

  markStepComplete() {
    const step = this.steps[this.activeScene][this.activeStep];
    if (step?.id) {
      this.completedSteps.add(step.id);
    }
  }

  isCurrentStepCompleted() {
    const sceneSteps = this.steps[this.activeScene];
    if (!sceneSteps || !sceneSteps[this.activeStep]) return false;
    const step = sceneSteps[this.activeStep];
    return this.completedSteps.has(step.id);
  }

  finishTutorial() {
    this.isActive = false;
    this.completed = true;
    localStorage.setItem("tutorialCompleted", "true");
  }

  resetTutorial() {
    this.completed = false;
    this.isActive = false;
    this.activeScene = "";
    this.activeStep = 0;
    this.completedSteps = new Set();
    localStorage.removeItem("tutorialCompleted");
  }

  loadFromStorage() {
    if (localStorage.getItem("tutorialCompleted") === "true") {
      this.completed = true;
    }
  }

  get currentStepText() {
    const sceneSteps = this.steps[this.activeScene];
    const step = sceneSteps?.[this.activeStep];
    return step
      ? this.deviceType === "mobile"
        ? step.textMobile
        : step.textDesktop
      : "";
  }

  get currentStepInstruction() {
    const sceneSteps = this.steps[this.activeScene];
    const step = sceneSteps?.[this.activeStep];
    return step?.instruction || "";
  }
}

export default TutorialStore;
