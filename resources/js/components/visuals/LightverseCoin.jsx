import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useCoinModel } from "@/utils/useCoinModel";
import { useRootStore } from "@/stores/RootStore";
import * as THREE from "three";

export default function LightverseCoin({ drop }) {
  const rootRef = useRef();
  const centerRef = useRef();
  const hitboxRef = useRef();

  const model = useCoinModel();
  const store = useRootStore().lightwebCoinStore;

  const isActive = store.activePickup === drop.id;
  const [hovered, setHovered] = useState(false);
  const phase = useRef(0);
  const baseY = drop.y;

  useEffect(() => {
    if (!model || !centerRef.current) return;

    const box = new THREE.Box3().setFromObject(model);
    const center = new THREE.Vector3();
    box.getCenter(center);

    model.position.set(-center.x, -center.y, -center.z);
    model.position.y += 0.25;

    centerRef.current.add(model);
  }, [model]);

  useFrame((_, delta) => {
    const g = rootRef.current;
    if (!g) return;

    if (hovered) {
      if (!g.userData.freeze) {
        g.userData.freezeY = g.position.y;
        g.userData.freeze = true;
      }
      g.position.y = g.userData.freezeY;
    } else {
      g.userData.freeze = false;
      phase.current += delta * 1.4;
      g.position.y = baseY + Math.sin(phase.current) * 0.16;
    }

    const target = hovered ? 1.15 : 1.0;
    g.scale.lerp(new THREE.Vector3(target, target, target), 0.15);
  });

  const handleClick = () => {
    if (store.isPickupFrozen || store.activePickup) return;
    store.beginPickup(drop.id);
  };

  if (isActive) return null;

  return (
    <group ref={rootRef} position={[drop.x, drop.y, drop.z]} renderOrder={9999}>
      <group ref={centerRef} />

      <mesh
        ref={hitboxRef}
        onPointerOver={() => {
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "default";
        }}
        onClick={handleClick}
        renderOrder={9999}
      >
        <sphereGeometry args={[1.0, 32, 32]} />
        <meshBasicMaterial
          transparent
          opacity={0}
          depthTest={false}
          depthWrite={false}
          colorWrite={false}
        />
      </mesh>
    </group>
  );
}