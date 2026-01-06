import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { useRootStore } from "@/stores/RootStore";

const AchievementsOverlay = observer(() => {
    const { userStore } = useRootStore();

  return (
    <div
      className={`overlay overlay--achievements ${
        userStore.overlayClosing ? "closing" : ""
      }`}
    >
      
      {/* 🔥 PROJECTOR */}
      <div className="projector">
        <div className="projector__beam" />
      </div>

      <div className="overlay__content projector__content">

        <h1 className="overlay__title">Achievements</h1>

        <p className="overlay__subtitle">
          Your Lightverse journey milestones
        </p>

        <div className="achievements-list">
          <div className="achievement-card">
            <span className="achievement-card__icon">💠</span>
            <div>
              <h3 className="achievement-card__title">Explorer I</h3>
              <p className="achievement-card__desc">Visited your first system.</p>
            </div>
          </div>
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

export default AchievementsOverlay;
