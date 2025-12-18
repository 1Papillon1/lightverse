import { useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { clone } from "three/examples/jsm/utils/SkeletonUtils";

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

  // ✅ RETURNS A CLONE — SAFE TO USE DIRECTLY
  return clone(scene);
}