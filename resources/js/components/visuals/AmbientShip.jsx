import React, { useRef, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const TRAIL_LENGTH = 10;
const SPEED = 0.6;
const TURN_SPEED = 0.02;
const TRAIL_OFFSET = 1.2;

// 🔑 CHANGE THIS IF NEEDED:
// Try (0,1,0) or (1,0,0) if still sideways
const MODEL_FORWARD = new THREE.Vector3(1, 0, 0);

export default function AmbientShip() {
  const shipGroup = useRef();   // position only
  const model = useRef();       // visual orientation
  const velocity = useRef(new THREE.Vector3());
  const target = useRef(new THREE.Vector3());
  const trailPoints = useRef([]);

  const { viewport } = useThree();
  const { scene } = useGLTF("/resources/models/ships/hover_ship_black.glb");

  /* ----------------------------------
     🎨 Preserve materials
  ---------------------------------- */
  useEffect(() => {
    scene.traverse((obj) => {
      if (obj.isMesh && obj.material) {
        obj.castShadow = false;
        obj.receiveShadow = false;
        obj.material.emissive = new THREE.Color("#6b5cff");
        obj.material.emissiveIntensity = 1.5;
        obj.material.needsUpdate = true;
      }
    });
  }, [scene]);

  /* ----------------------------------
     📍 Init
  ---------------------------------- */
  useEffect(() => {
    shipGroup.current.position.set(0, viewport.height * 0.25, 0);
    pickNewTarget();
  }, [viewport]);

  const pickNewTarget = () => {
    target.current.set(
      THREE.MathUtils.randFloat(-viewport.width * 0.4, viewport.width * 0.4),
      THREE.MathUtils.randFloat(viewport.height * 0.1, viewport.height * 0.45),
      0
    );
  };

  /* ----------------------------------
     🧵 Trail
  ---------------------------------- */
  const trailGeometry = useMemo(
    () =>
      new THREE.BufferGeometry().setFromPoints(
        Array(TRAIL_LENGTH).fill(new THREE.Vector3())
      ),
    []
  );

  /* ----------------------------------
     🧠 Animation
  ---------------------------------- */
  useFrame(() => {
    if (document.hidden) return;

    const ship = shipGroup.current;
    if (!ship) return;

    // Movement
    const dir = target.current.clone().sub(ship.position).normalize();
    velocity.current.lerp(dir.multiplyScalar(SPEED), TURN_SPEED);
    ship.position.add(velocity.current);

    // 🔥 THIS IS THE KEY PART
    // Rotate model so its LOCAL forward matches velocity
    const velocityDir = velocity.current.clone().normalize();
    const quat = new THREE.Quaternion().setFromUnitVectors(
      MODEL_FORWARD,
      velocityDir
    );
    model.current.quaternion.slerp(quat, 0.2);

    // Banking
    ship.rotation.z = -velocity.current.x * 0.4;

    if (ship.position.distanceTo(target.current) < 1) {
      pickNewTarget();
    }

    // Trail behind ship
    const backward = velocityDir.clone().multiplyScalar(-TRAIL_OFFSET);
    trailPoints.current.unshift(ship.position.clone().add(backward));
    if (trailPoints.current.length > TRAIL_LENGTH) trailPoints.current.pop();

    trailGeometry.setFromPoints(trailPoints.current);
    trailGeometry.attributes.position.needsUpdate = true;
  });

  return (
    <>
      <group ref={shipGroup}>
        <primitive ref={model} object={scene} scale={0.6} />
      </group>

      <line geometry={trailGeometry}>
        <lineBasicMaterial color="#7f6bff" transparent opacity={0.1} />
      </line>
    </>
  );
}
