// Settings.jsx
import React, { useContext } from "react";
import { observer } from "mobx-react-lite";
import { RootStoreContext } from "@/stores/RootStore"; 
import { Head } from "@inertiajs/react";

const Settings = observer(() => {
  const rootStore = useContext(RootStoreContext);

  const toggleAnimated = () => {
    rootStore.uiStore.toggleAnimated();
    console.log(rootStore.uiStore.animated);
  };

  return (
    <div className="overlay overlay--settings">
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
            <span className="settings__slider"></span>
          </label>
        </div>
      </div>
    </div>
  );
});

export default Settings;
