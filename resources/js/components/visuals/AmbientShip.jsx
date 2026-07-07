import React, { useRef, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const TRAIL_LENGTH = 10;
const SPEED = 0.6;
const TURN_SPEED = 0.02;
const TRAIL_OFFSET = 1.2;

// Adjust if model faces wrong direction
const MODEL_FORWARD = new THREE.Vector3(1, 0, 0);

export default function AmbientShip() {
  const shipGroup = useRef();
  const model = useRef();

  const velocity = useRef(new THREE.Vector3());
  const target = useRef(new THREE.Vector3());
  const trailPoints = useRef([]);

  const { viewport } = useThree();
  const { scene } = useGLTF("/resources/models/ships/hover_ship_black.glb");

  /* ----------------------------------
     🎨 Preserve original materials
  ---------------------------------- */
  useEffect(() => {
    scene.traverse((obj) => {
      if (!obj.isMesh || !obj.material) return;

      obj.castShadow = false;
      obj.receiveShadow = false;

      // Ensure correct color space for textures
      if (obj.material.map) {
        obj.material.map.colorSpace = THREE.SRGBColorSpace;
      }

      // VERY subtle emissive boost (keeps texture intact)
      if (obj.material.emissive) {
        obj.material.emissive.set("#6b5cff");
        obj.material.emissiveIntensity = 0.15;
      }

      obj.material.needsUpdate = true;
    });
  }, [scene]);

  /* ----------------------------------
     📍 Initial position
  ---------------------------------- */
  useEffect(() => {
    if (!shipGroup.current) return;

    shipGroup.current.position.set(
      0,
      viewport.height * 0.25,
      0
    );

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
     🧵 Trail geometry
  ---------------------------------- */
  const trailGeometry = useMemo(() => {
    const points = Array.from({ length: TRAIL_LENGTH }, () => new THREE.Vector3());
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  /* ----------------------------------
     🧠 Animation loop
  ---------------------------------- */
  useFrame(() => {
    if (document.hidden) return;

    const ship = shipGroup.current;
    if (!ship || !model.current) return;

    // Movement
    const dir = target.current.clone().sub(ship.position).normalize();
    velocity.current.lerp(dir.multiplyScalar(SPEED), TURN_SPEED);
    ship.position.add(velocity.current);

    // Orientation (model-local forward → velocity)
    const velocityDir = velocity.current.clone().normalize();
    const targetQuat = new THREE.Quaternion().setFromUnitVectors(
      MODEL_FORWARD,
      velocityDir
    );
    model.current.quaternion.slerp(targetQuat, 0.2);

    // Banking
    ship.rotation.z = -velocity.current.x * 0.4;

    // New target
    if (ship.position.distanceTo(target.current) < 1) {
      pickNewTarget();
    }

    // Trail
    const backward = velocityDir.clone().multiplyScalar(-TRAIL_OFFSET);
    trailPoints.current.unshift(ship.position.clone().add(backward));
    if (trailPoints.current.length > TRAIL_LENGTH) {
      trailPoints.current.pop();
    }

    trailGeometry.setFromPoints(trailPoints.current);
    trailGeometry.attributes.position.needsUpdate = true;
  });

  return (
    <>
      <group ref={shipGroup}>
        <primitive ref={model} object={scene} scale={0.6} />
      </group>

      <line geometry={trailGeometry}>
        <lineBasicMaterial
          color="#7f6bff"
          transparent
          opacity={0.15}
        />
      </line>
    </>
  );
}
