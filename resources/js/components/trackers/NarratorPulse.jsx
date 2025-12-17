// resources/js/components/visuals/NarratorPulse.jsx
import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { useRootStore } from "@/stores/RootStore";

const NarratorPulse = observer(() => {
  const { narratorStore } = useRootStore();
  const active = narratorStore.isSpeaking && !narratorStore.isMuted;

  const [open, setOpen] = useState(false);

  return (

    <>

      {open && (
    <div
      className="narrator__inner"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    />
  )}

  <div
    className={"narrator" + (open ? " narrator--open" : "")}
    onMouseEnter={() => setOpen(true)}
    onMouseLeave={() => setOpen(false)}
    onClick={() => setOpen(prev => !prev)}
  >
    <div className={"narrator__core" + (active ? " narrator__core--active" : "")} />
    <div className="narrator__ring" />
    <div className="narrator__ring narrator__ring--2" />
    <div className="narrator__beam" />


  {open && (
    <div className="narrator__menu">
      <div className="narrator__menu-item narrator__menu-item--top">
        <button onClick={() => narratorStore.resume()}>▶</button>
        <span className="narrator__label">Play</span>
      </div>

      <div className="narrator__menu-item narrator__menu-item--top-right">
        <button onClick={() => narratorStore.pause()}>❚❚</button>
        <span className="narrator__label">Pause</span>
      </div>

      <div className="narrator__menu-item narrator__menu-item--right">
        <button onClick={() => narratorStore.stop()}>⏹</button>
        <span className="narrator__label">Stop</span>
      </div>
    </div>
  )}
</div>

</>
  );
});

export default NarratorPulse;
