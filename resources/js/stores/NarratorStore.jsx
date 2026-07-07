// resources/js/stores/NarratorStore.js
import { makeAutoObservable } from "mobx";

const AUDIO_BASE = "/resources/audio/tutorial/auria"; // adjust if your server serves differently
const WELCOME_BASE = "/resources/audio/welcome";

export default class NarratorStore {
  rootStore = null;

  isSpeaking = false;
  isMuted = false;
  volume = 0.6;
  currentAudio = null;
  currentKey = null;

  // mapping keys -> filenames (exact as you asked)
  filenames = {
    intro: "00-intro-bridge.mp3",
    "01": "01-rotate.mp3",
    "02": "02-zoom-in.mp3",
    "03": "03-zoom-out.mp3",
    "04": "04-click-node.mp3",
    "05": "05-completed.mp3",
    welcome: "welcome.mp3"
  };

  constructor(rootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
    const persistedMute = localStorage.getItem("narratorMuted");
    if (persistedMute === "true") this.isMuted = true;
  }

  _buildUrl(key) {
    if (key === "welcome") return `${WELCOME_BASE}/${this.filenames.welcome}`;
    return `${AUDIO_BASE}/${this.filenames[key] || this.filenames[key]}`;
  }

  _createAudio(url) {
    const a = new Audio(url);
    a.preload = "auto";
    a.volume = this.isMuted ? 0 : this.volume;
    a.onended = () => {
      this.isSpeaking = false;
      this.currentAudio = null;
      this.currentKey = null;
    };
    a.onerror = () => {
      // be resilient
      this.isSpeaking = false;
      this.currentAudio = null;
      this.currentKey = null;
      console.warn("Narrator audio failed: ", url);
    };
    return a;
  }

  stop() {
  if (this.currentAudio) {
    try {
      this.currentAudio.pause();
      this.currentAudio.src = "";   // <— HARD RESET
      this.currentAudio.load();     // <— forces browser to flush playback
    } catch (e) {}

    this.currentAudio = null;
    this.currentKey = null;
  }

  this.isSpeaking = false;
}

  pause() {
    if (this.currentAudio && !this.currentAudio.paused) {
      try {
        this.currentAudio.pause();
        this.isSpeaking = false;
      } catch (e) {}
    }
  }

  resume() {
  // If paused → resume
  if (this.currentAudio && this.currentAudio.paused) {
    this.currentAudio.play();
    this.isSpeaking = true;
    return;
  }

  // If nothing is playing → play welcome
  if (!this.currentAudio) {
    this.playWelcome();
  }
}

  async _playKey(key) {
  this.stop(); // <— now truly kills old audio

  const url = this._buildUrl(key);
  const audio = this._createAudio(url);

  this.currentAudio = audio;
  this.currentKey = key;

  try {
    await audio.play();
    this.isSpeaking = true;
  } catch (err) {
    this.isSpeaking = false;
    console.warn("Autoplay prevented for:", url);
  }
}

  // Public helpers -------------------------------------------------------
  playWelcome() {
  if (this.isMuted) return;
  this._playKey("welcome");
}

  playTutorialStep(scene, stepIndex) {
    // scene param isn't used currently, but kept for future mapping per-scene
    // we map stepIndex (0-based) -> filenames 01..05
    const mapping = ["01", "02", "03", "04", "05"];
    const key = mapping[stepIndex] || "intro";
    if (this.isMuted) {
      // still keep UI state consistent (no playing)
      return;
    }
    this._playKey(key);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem("narratorMuted", this.isMuted ? "true" : "false");
    if (this.currentAudio) {
      try {
        this.currentAudio.volume = this.isMuted ? 0 : this.volume;
      } catch (e) {}
    }
    if (this.isMuted) this.isSpeaking = false;
  }

  setVolume(v) {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.currentAudio && !this.isMuted) {
      this.currentAudio.volume = this.volume;
    }
  }
}
