import React, { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils";
import { useRootStore } from "@/stores/RootStore";
import { useCoinModel } from "@/utils/useCoinModel";

export default function CoinPickupAnimator() {
  const { camera, scene } = useThree();
  const store = useRootStore().lightwebCoinStore;

  const anim = useRef({});
  const temp = new THREE.Vector3();
  const baseCoin = useCoinModel();

  // Wallet screen position (top-right HUD)
  const WALLET_SCREEN_X = window.innerWidth - 60;
  const WALLET_SCREEN_Y = 50;

  // Initialize animation when pickup starts
  useEffect(() => {
    if (!store.activePickup) return;

    const drop = store.drops.find(d => d.id === store.activePickup);
    if (!drop) return;

    anim.current = {
      drop,
      stage: "charging",
      t: 0,
      duration: 4,
      visual: null,
      start: null,
      end: null,
    };
  }, [store.activePickup]);

  useFrame((_, delta) => {
    const s = anim.current;
    if (!s || !s.drop) return;

    /* -------------------------
       1. Charging phase
    -------------------------- */
    if (s.stage === "charging") {
      s.t += delta;
      const p = Math.min(1, s.t / s.duration);
      store.setPickupProgress(p);

      if (p >= 1) {
        s.stage = "fly";
        s.t = 0;
      }
      return;
    }

    /* -------------------------
       2. Prepare fly path
    -------------------------- */
    if (!s.end) {
      const nx = (WALLET_SCREEN_X / window.innerWidth) * 2 - 1;
      const ny = -(WALLET_SCREEN_Y / window.innerHeight) * 2 + 1;

      temp.set(nx, ny, 0.4).unproject(camera);

      s.start = new THREE.Vector3(s.drop.x, s.drop.y, s.drop.z);
      s.end = temp.clone();
    }

    /* -------------------------
       3. Fly animation
    -------------------------- */
    s.t += delta;
    const p = Math.min(1, s.t / 0.9);

    const mid = s.start
      .clone()
      .lerp(s.end, 0.5)
      .add(new THREE.Vector3(0, 0.8, 0));

    const a = s.start.clone().lerp(mid, p);
    const b = mid.clone().lerp(s.end, p);
    const pos = a.lerp(b, p);

    if (!s.visual && baseCoin) {
      s.visual = clone(baseCoin);
      s.visual.scale.set(1, 1, 1);
      scene.add(s.visual);
    }

    if (s.visual) {
      s.visual.position.copy(pos);
    }

    /* -------------------------
       4. Finish
    -------------------------- */
    if (p >= 1) {
  if (s.visual) scene.remove(s.visual);

  (async () => {
    const res = await store.claimDropServer(s.drop.id);

    // Even if server fails, unlock UI
    await store.finishPickup(
      s.drop.id,
      res.ok ? res.data?.new_balance : null
    );
  })();

  anim.current = {};
}
  });

  return null;
}
