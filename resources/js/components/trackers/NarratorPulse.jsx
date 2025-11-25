// resources/js/components/visuals/NarratorPulse.jsx
import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { useRootStore } from "@/stores/RootStore";

const NarratorPulse = observer(() => {
  const { narratorStore } = useRootStore();
  const active = narratorStore.isSpeaking && !narratorStore.isMuted;

  const [open, setOpen] = useState(false);

  return (
    <div
      className={
        "narrator-pulse" + (open ? " narrator-pulse--open" : "")
      }
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={() => setOpen((prev) => !prev)}
    >
      {/* Center Orb */}
      <div
        className={
          "narrator-pulse__inner" +
          (active ? " narrator-pulse__inner--active" : "")
        }
      />

      {/* Radial Menu */}
      <div className="narrator-pulse__menu">

        {/* PLAY */}
        <div className="narrator-pulse__menu-item narrator-pulse__menu-item--top">
          <button onClick={() => narratorStore.resume()}>▶</button>
          <span className="narrator-pulse__label">Play</span>
        </div>

        {/* PAUSE */}
        <div className="narrator-pulse__menu-item narrator-pulse__menu-item--top-right">
          <button onClick={() => narratorStore.pause()}>❚❚</button>
          <span className="narrator-pulse__label">Pause</span>
        </div>

        {/* STOP */}
        <div className="narrator-pulse__menu-item narrator-pulse__menu-item--right">
          <button onClick={() => narratorStore.stop()}>⏹</button>
          <span className="narrator-pulse__label">Stop</span>
        </div>

      </div>
    </div>
  );
});

export default NarratorPulse;
