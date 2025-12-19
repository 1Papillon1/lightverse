import { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils";
import { useRootStore } from "@/stores/RootStore";
import { useCoinModel } from "@/utils/useCoinModel";
import { observer } from "mobx-react-lite";

const CoinPickupAnimator = observer(() => {
  const { camera, scene } = useThree();
  const store = useRootStore().lightwebCoinStore;

  const baseCoin = useCoinModel();
  const anim = useRef(null);
  const temp = new THREE.Vector3();

  const WALLET_SCREEN_X = window.innerWidth - 60;
  const WALLET_SCREEN_Y = 50;

  /* ----------------------------------
     INIT PICKUP (instant)
  ---------------------------------- */
  useEffect(() => {
    if (!store.activePickup) return;

    const drop = store.getDrop(store.activePickup);
    if (!drop) return;

    anim.current = {
      drop,
      t: 0,
      visual: null,
      finished: false,
      start: new THREE.Vector3(drop.x, drop.y, drop.z),
      end: null,
    };
  }, [store.activePickup]);

  /* ----------------------------------
     FRAME LOOP (fly only)
  ---------------------------------- */
  useFrame((_, delta) => {
    if (!anim.current) return;

    const a = anim.current;
    a.t += delta;

    const p = Math.min(1, a.t / 1.2); // fly duration

    if (!a.end) {
      const nx = (WALLET_SCREEN_X / window.innerWidth) * 2 - 1;
      const ny = -(WALLET_SCREEN_Y / window.innerHeight) * 2 + 1;
      temp.set(nx, ny, 0.4).unproject(camera);
      a.end = temp.clone();
    }

    const mid = a.start
      .clone()
      .lerp(a.end, 0.5)
      .add(new THREE.Vector3(0, 1, 0));

    const a1 = a.start.clone().lerp(mid, p);
    const a2 = mid.clone().lerp(a.end, p);
    const pos = a1.lerp(a2, p);

    if (!a.visual && baseCoin && scene) {
      a.visual = clone(baseCoin);
      scene.add(a.visual);
    }

    if (a.visual) {
      a.visual.position.copy(pos);
      a.visual.traverse(o => {
        if (o.material) {
          o.material.transparent = true;
          o.material.opacity = 1 - p;
        }
      });
    }

    if (p >= 1 && !a.finished) {
      a.finished = true;

      if (a.visual && scene) {
        try {
          scene.remove(a.visual);
        } catch {}
      }

      store.consumePickup(a.drop.id);
      anim.current = null;
    }
  });

  /* ----------------------------------
     CLEANUP
  ---------------------------------- */
  useEffect(() => {
    return () => {
      if (anim.current?.visual && scene) {
        try {
          scene.remove(anim.current.visual);
        } catch {}
      }
      anim.current = null;
    };
  }, [scene]);

  return null;
});

export default CoinPickupAnimator;
