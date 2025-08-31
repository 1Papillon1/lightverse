// TutorialZoomTracker.jsx
import { useFrame } from "@react-three/fiber";
import { useContext, useRef } from "react";
import { RootStoreContext } from "@/stores/RootStore";

export default function TutorialZoomTracker() {
  const tutorialStore = useContext(RootStoreContext).tutorialStore;
  const lastZRef = useRef(null);

  useFrame(({ camera }) => {
    if (!tutorialStore.isActive) return;

    const stepText = tutorialStore.currentStepText.toLowerCase();
    const isZoomInStep = stepText.includes("zoom in");
    const isZoomOutStep = stepText.includes("zoom out");

    const currentZ = camera.position.z;
    const lastZ = lastZRef.current;

    if (lastZ !== null) {
      const zoomedIn = currentZ < lastZ;
      const zoomedOut = currentZ > lastZ;

      if (isZoomInStep && zoomedIn && Math.abs(currentZ - lastZ) > 0.2) {
        tutorialStore.markStepComplete();
      }

      if (isZoomOutStep && zoomedOut && Math.abs(currentZ - lastZ) > 0.2) {
        tutorialStore.markStepComplete();
      }
    }

    lastZRef.current = currentZ;
  });

  return null;
}