// resources/js/components/trackers/LoaderGate.jsx

import { Html, useProgress } from "@react-three/drei";

function LoaderGate() {
  const { loaded, total } = useProgress();
  const progress = (loaded / total) * 100;

  // When all textures & assets are loaded → notify MobX
  if (progress === 100) {
    setTimeout(() => {
      window.rootStore.uiStore.setUniverseReady(true);
    }, 150); // small delay for cleanup
  }

  return (
    <Html center>
      <div className="universe-loader">
        Loading... {Math.floor(progress)}%
      </div>
    </Html>
  );
}
export default LoaderGate;