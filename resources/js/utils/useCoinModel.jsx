import { useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { clone } from "three/examples/jsm/utils/SkeletonUtils";
import { useRootStore } from "@/stores/RootStore";

export function useCoinModel() {
  const { scene } = useGLTF("/resources/models/coin/lightverse_coin.glb");

  useEffect(() => {
    scene.traverse(obj => {
      if (obj.isMesh) {
        obj.castShadow = false;
        obj.receiveShadow = false;
      }
    });

    // 🔥 CRITICAL: reset any baked scale
    scene.scale.set(1, 1, 1);
    scene.updateMatrixWorld(true);
  }, [scene]);

  return clone(scene);
}