// TutorialOverlay.jsx
import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useRootStore } from "@/stores/RootStore";

const TutorialOverlay = observer(() => {
  const { tutorialStore } = useRootStore();
  const stepText = tutorialStore.currentStepText;
  const instructionText = tutorialStore.currentStepInstruction;
  const stepLower = stepText.toLowerCase();

  const isRotate = stepLower.includes("rotate");
  const isZoomIn = stepLower.includes("zoom in");
  const isZoomOut = stepLower.includes("zoom out");
  const isClick = stepLower.includes("click");

  const isCompleted = tutorialStore.isCurrentStepCompleted();


  useEffect(() => {
    if (!isRotate || isCompleted) return;

    const onMouseDown = () => {
     
      tutorialStore.markStepComplete();
    };

    window.addEventListener("mousedown", onMouseDown);

    return () => {
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, [isRotate, isCompleted, tutorialStore]);


  useEffect(() => {
    if (!(isZoomIn || isZoomOut) || isCompleted) return;

    const handleZoom = () => {

      tutorialStore.markStepComplete();
    };

    window.addEventListener("wheel", handleZoom);

    return () => {
      window.removeEventListener("wheel", handleZoom);
    };
  }, [isZoomIn, isZoomOut, isCompleted, tutorialStore]);


  useEffect(() => {
    if (!isClick || isCompleted) return;

    const onClick = () => {
      tutorialStore.markStepComplete();
    };

    window.addEventListener("click", onClick);

    return () => {
      window.removeEventListener("click", onClick);
    };
  }, [isClick, isCompleted, tutorialStore]);


  useEffect(() => {
    if (tutorialStore.isCurrentStepCompleted()) {
    
    }
  }, [tutorialStore.activeStep, tutorialStore.isCurrentStepCompleted()]);

  if (!tutorialStore.isActive) return null;

  return (
    <div className="overlay overlay--tutorial" data-interactive="true">
      <div className="overlay__content">
        <p className="overlay__text">{stepText}</p>
        <p className="overlay__instruction">{instructionText}</p>
      </div>

      <div className="overlay__buttons-bar">
        {isCompleted && (
          <button
            className="overlay__button overlay__button--overlay"
            onClick={() => tutorialStore.nextStep()}
          >
            Next
          </button>
        )}
        <button
          className="overlay__button overlay__button--skip"
          onClick={() => tutorialStore.finishTutorial()}
        >
          Skip
        </button>
      </div>
    </div>
  );
});

export default TutorialOverlay;
