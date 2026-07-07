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
      universe: [
        {
          id: 1,
          textDesktop: "Welcome to the Lightverse! You're viewing the Universe.",
          instruction: "Two galaxies await exploration",
          textMobile: "Welcome to the Lightverse! Two galaxies await.",
        },
        {
          id: 2,
          textDesktop: "Click and drag to rotate your view.",
          instruction: "(Hold left mouse button and move)",
          textMobile: "Swipe with one finger to rotate.",
        },
        {
          id: 3,
          textDesktop: "Scroll to zoom in and out.",
          instruction: "(Mouse scroll)",
          textMobile: "Pinch to zoom in and out.",
        },
        {
          id: 4,
          textDesktop: "Click on a galaxy to enter it.",
          instruction: "(Left-click on a glowing galaxy)",
          textMobile: "Tap a galaxy to enter it.",
        },
      ],
      galaxy: [
        {
          id: 1,
          textDesktop: "You're now inside a galaxy! Each star is a system.",
          instruction: "Click a star to zoom in",
          textMobile: "You're inside a galaxy! Tap a star to zoom in.",
        },
        {
          id: 2,
          textDesktop: "Click on a star to see its orbiting nodes.",
          instruction: "(Left-click on a star)",
          textMobile: "Tap a star to see its nodes.",
        },
      ],
      system: [
        {
          id: 1,
          textDesktop: "These are nodes orbiting the star. Click one to explore.",
          instruction: "(Left-click on a node)",
          textMobile: "These are nodes. Tap one to explore.",
        },
      ],
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
    const step = this.steps[this.activeScene]?.[this.activeStep];
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