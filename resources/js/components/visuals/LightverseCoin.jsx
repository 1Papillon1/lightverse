import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useCoinModel } from "@/utils/useCoinModel";
import { useRootStore } from "@/stores/RootStore";
import * as THREE from "three";

export default function LightverseCoin({ drop }) {
  const store = useRootStore().lightwebCoinStore;

  // 🔒 HARD EXIT — consumed coins NEVER render
  if (store.isConsumed(drop.id)) return null;

  const rootRef = useRef();
  const centerRef = useRef();

  // ✅ Already a clone
  const model = useCoinModel();

  const [hovered, setHovered] = useState(false);
  const phase = useRef(Math.random() * Math.PI * 2);
  const baseY = drop.y;

  const isActive = store.activePickup === drop.id;

  /* ----------------------------------
     MODEL CENTERING (NO EXTRA CLONE)
  ---------------------------------- */
  useEffect(() => {
    if (!model || !centerRef.current) return;

    const box = new THREE.Box3().setFromObject(model);
    const center = new THREE.Vector3();
    box.getCenter(center);

    model.position.set(-center.x, -center.y, -center.z);
    model.position.y += 0.25;

    centerRef.current.add(model);

    return () => {
      centerRef.current.remove(model);
    };
  }, [model]);

  /* ----------------------------------
     CURSOR SAFETY CLEANUP
  ---------------------------------- */
  useEffect(() => {
    return () => {
      document.body.style.cursor = "default";
    };
  }, []);

  /* ----------------------------------
     FRAME LOOP
  ---------------------------------- */
  useFrame((_, delta) => {
    const g = rootRef.current;
    if (!g) return;

    if (!isActive) {
      g.rotation.y += delta * 0.35;
      phase.current += delta * 1.4;
      g.position.y = baseY + Math.sin(phase.current) * 0.16;
    }

    const targetScale = hovered || isActive ? 1.15 : 1.0;
    g.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.15
    );
  });

  /* ----------------------------------
     CLICK HANDLER
  ---------------------------------- */
  const handleClick = (e) => {
    e.stopPropagation();
    if (store.isPickupFrozen || store.activePickup) return;
    store.beginPickup(drop.id);
  };

  return (
    <group
      ref={rootRef}
      position={[drop.x, drop.y, drop.z]}
      rotation={[drop.rot_x, drop.rot_y, drop.rot_z]}
      renderOrder={9999}
    >
      <group ref={centerRef} />

      {/* ⏳ Pickup progress ring */}
      {isActive && (
        <mesh position={[0, 1.6, 0]}>
          <ringGeometry
            args={[0.35, 0.45, 32, 1, 0, Math.PI * 2 * store.pickupProgress]}
          />
          <meshBasicMaterial
            color="#8f8fff"
            transparent
            opacity={0.9}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* 🫥 Invisible hitbox */}
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = "default";
        }}
        onClick={handleClick}
      >
        <sphereGeometry args={[1.0, 32, 32]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}
