// AsteroidField.jsx
import { useRef, useMemo, Fragment } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Sparkles, Trail } from "@react-three/drei";
import { ImprovedNoise } from "three/examples/jsm/math/ImprovedNoise.js";

export default function AsteroidField({
  count = 180,
  radius = 480,
  innerBoundary = 100,
  outerBoundary = 800,
}) {
  const groupRef = useRef();

  const asteroids = useMemo(() => {
    const randomVec = () =>
      new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      ).normalize();

    const arr = [];
    for (let i = 0; i < count; i++) {
      const dir = randomVec();
      const dist = radius * (0.4 + Math.random() * 0.6);
      const clusterIndex = Math.floor(i / 8);

      const clusterOffset = new THREE.Vector3(
        Math.sin(clusterIndex * 1.7) * 80 + (Math.random() - 0.5) * 20,
        Math.cos(clusterIndex * 1.1) * 60 + (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 100
      );

      arr.push({
        position: dir.clone().multiplyScalar(dist).add(clusterOffset),
        velocity: randomVec().multiplyScalar(0.001 + Math.random() * 0.0025),
        rotationSpeed: randomVec().multiplyScalar(0.0003 + Math.random() * 0.0008),
        scale: 0.3 + Math.random() * 1.1,
        color: new THREE.Color().setHSL(0.08 + Math.random() * 0.08, 0.2, 0.33),
        cluster: clusterIndex,
      });
    }
    return arr;
  }, [count, radius]);

  useFrame(() => {
    const t = performance.now() * 0.001;

    groupRef.current.children.forEach((mesh, i) => {
      const asteroid = asteroids[i];
      const pos = mesh.position;

      // 🔹 Dampen velocity (prevents explosion drift)
      asteroid.velocity.multiplyScalar(0.985);

      // Add a subtle micro drift
      asteroid.velocity.add(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.00005,
          (Math.random() - 0.5) * 0.00005,
          (Math.random() - 0.5) * 0.00005
        )
      );

      // Apply movement
      pos.add(asteroid.velocity);

      const dist = pos.length();

      // 🌀 Inner protection field
      if (dist < innerBoundary) {
        const dir = pos.clone().normalize();
        const force = (1 - dist / innerBoundary) * 0.03;
        asteroid.velocity.add(dir.multiplyScalar(force));
      }

      // 🌌 Outer containment field
      if (dist > outerBoundary) {
        const dir = pos.clone().normalize();
        const force = (dist - outerBoundary) / outerBoundary * 0.05;
        asteroid.velocity.add(dir.multiplyScalar(-force));

        // Soft turbulence bounce
        asteroid.velocity.add(
          new THREE.Vector3(
            (Math.random() - 0.5) * 0.003,
            (Math.random() - 0.5) * 0.003,
            (Math.random() - 0.5) * 0.003
          )
        );
      }

      // 🧩 Clamp velocity magnitude
      const maxSpeed = 0.01;
      if (asteroid.velocity.length() > maxSpeed) {
        asteroid.velocity.setLength(maxSpeed);
      }

      // 🌊 Subtle cluster drift
      const wave = Math.sin(t * 0.1 + asteroid.cluster * 2.3) * 0.2;
      pos.x += Math.sin(t * 0.1 + asteroid.cluster) * 0.01 + wave * 0.008;
      pos.y += Math.cos(t * 0.12 + asteroid.cluster) * 0.01 + wave * 0.008;

      // Rotation
      mesh.rotation.x += asteroid.rotationSpeed.x;
      mesh.rotation.y += asteroid.rotationSpeed.y;
      mesh.rotation.z += asteroid.rotationSpeed.z;
    });
  });

  const baseGeom = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1, 2);
    const pos = geo.attributes.position;
    const noise = new ImprovedNoise();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const n = noise.noise(x * 2, y * 2, z * 2);
      const scale = 1 + n * 0.4;
      pos.setXYZ(i, x * scale, y * scale, z * scale);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <group ref={groupRef}>
      {asteroids.map((a, i) => (
        <Fragment key={i}>
          {/* 🚀 Trail */}
          <Trail width={0.4} length={10} decay={0.7} color={a.color} attenuation={(t) => t * t}>
            <mesh
              geometry={baseGeom}
              position={a.position}
              scale={a.scale}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial
                color={a.color}
                roughness={0.95}
                metalness={0.25}
                emissive="#1a0d00"
                emissiveIntensity={0.05}
                flatShading
              />
            </mesh>

          
          </Trail>
        </Fragment>
      ))}
    </group>
  );
}
