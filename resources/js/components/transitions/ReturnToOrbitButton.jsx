// ReturnToOrbitButton.jsx
import React, { useContext } from "react";
import { observer } from "mobx-react-lite";
import { RootStoreContext } from "@/stores/RootStore";

const ReturnToOrbitButton = observer(({ type }) => {
  const { universeStore } = useContext(RootStoreContext);

  const handleReturn = () => {
    if (type === "system") {
      universeStore.returnToSystemOrbit();
    } else if (type === "galaxy") {
      universeStore.returnToGalaxy();
    }
  };

  const label =
    type === "galaxy"
      ? "🚀 Return to Galactic View"
      : "🪐 Return to System Orbit";

  return (
    <button className="asidebar__button" onClick={handleReturn}>
      {label}
    </button>
  );
});

export default ReturnToOrbitButton;
