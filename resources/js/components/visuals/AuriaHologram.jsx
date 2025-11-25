import React from "react";
import { observer } from "mobx-react-lite";
import { useRootStore } from "@/stores/RootStore";
import auriaImg from "@/assets/auria/hologram.png";

const AuriaHologram = observer(() => {
  const { narratorStore } = useRootStore();
  const visible = narratorStore.isSpeaking && !narratorStore.isMuted;

  return (
    <div className={"auria" + (visible ? " auria--visible" : "")}>
      <img
        src={auriaImg}
        alt="Auria AI Hologram"
        className="auria__img"
      />
      <div className="auria__scanlines"></div>
      <div className="auria__glow"></div>
    </div>
  );
});

export default AuriaHologram;