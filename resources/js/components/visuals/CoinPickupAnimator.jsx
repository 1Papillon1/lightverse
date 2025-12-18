// CoinPickupAnimator.jsx
import { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils";
import { useRootStore } from "@/stores/RootStore";
import { useCoinModel } from "@/utils/useCoinModel";

export default function CoinPickupAnimator() {
  const { camera, scene } = useThree();
  const store = useRootStore().lightwebCoinStore;

  // 🔑 Base model (already a clone from hook)
  const baseCoin = useCoinModel();

  const anim = useRef(null);
  const temp = new THREE.Vector3();

  // Wallet HUD screen position
  const WALLET_SCREEN_X = window.innerWidth - 60;
  const WALLET_SCREEN_Y = 50;

  /* ----------------------------------
     INIT PICKUP
  ---------------------------------- */
  useEffect(() => {
    if (!store.activePickup) return;

    const drop = store.getDrop(store.activePickup);
    if (!drop) return;

    anim.current = {
      drop,
      stage: "charge",
      t: 0,
      visual: null,
      start: new THREE.Vector3(drop.x, drop.y, drop.z),
      end: null,
    };
  }, [store.activePickup]);

  /* ----------------------------------
     FRAME LOOP
  ---------------------------------- */
  useFrame((_, delta) => {
    if (!anim.current) return;

    const a = anim.current;

    /* --------------------------
       CHARGING PHASE
    -------------------------- */
    if (a.stage === "charge") {
      a.t += delta;

      const p = Math.min(1, a.t / 3);
      store.setPickupProgress(p);

      if (p >= 1) {
        // Convert screen → world
        const nx = (WALLET_SCREEN_X / window.innerWidth) * 2 - 1;
        const ny = -(WALLET_SCREEN_Y / window.innerHeight) * 2 + 1;
        temp.set(nx, ny, 0.4).unproject(camera);

        a.end = temp.clone();
        a.stage = "fly";
        a.t = 0;
      }
      return;
    }

    /* --------------------------
       FLY PHASE (Bezier)
    -------------------------- */
    a.t += delta;
    const p = Math.min(1, a.t / 0.8);

    const mid = a.start
      .clone()
      .lerp(a.end, 0.5)
      .add(new THREE.Vector3(0, 1, 0));

    // 🔥 Correct quadratic Bézier
    const a1 = a.start.clone().lerp(mid, p);
    const a2 = mid.clone().lerp(a.end, p);
    const pos = a1.lerp(a2, p);

    if (!a.visual && baseCoin) {
      a.visual = clone(baseCoin);
      scene.add(a.visual);
    }

    if (a.visual) {
      a.visual.position.copy(pos);
    }

    /* --------------------------
       FINISH
    -------------------------- */
    if (p >= 1) {
      if (a.visual) scene.remove(a.visual);
      store.consumePickup(a.drop.id);
      anim.current = null;
    }
  });

  return null;
}
