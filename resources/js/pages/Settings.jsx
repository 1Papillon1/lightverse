// Settings.jsx
import { observer } from "mobx-react-lite";
import { useRootStore } from "@/stores/RootStore";
import { Head } from "@inertiajs/react";

const Settings = observer(() => {
  const rootStore = useRootStore();
  const { userStore } = rootStore;

  const toggleAnimated = () => {
    rootStore.uiStore.toggleAnimated();
  };

  return (
    <div
      className={`overlay overlay--settings ${
        userStore.overlayClosing ? "closing" : ""
      }`}
    >
      <Head title="Settings" />

      <div className="overlay__content">
        <h1 className="overlay__title">Settings</h1>

        <div className="settings__item">
          <span className="settings__label">Animated</span>
          <label className="settings__switch">
            <input
              type="checkbox"
              checked={rootStore.uiStore.animated}
              onChange={toggleAnimated}
            />
            <span className="settings__slider" />
          </label>
        </div>

        <button
          className="overlay__close"
          onClick={() => userStore.closeOverlayAnimated()}
        >
          Close
        </button>
      </div>
    </div>
  );
});

export default Settings;
