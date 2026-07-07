// SparkleFieldGroup.jsx
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import gsap from "gsap";
import * as THREE from "three";



export default function SparkleFieldGroup() {
  const sparkleGroup = useRef();
  const flashTimer = useRef(0);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (sparkleGroup.current) {
      sparkleGroup.current.children.forEach((child, i) => {
        // 💓 Subtle breathing pulse
        const base = 0.6 + Math.sin(t * 0.6 + i * 0.4) * 0.25;

        // ⚡ Occasional random micro-flashes
        const flash =
          Math.random() < 0.005 // 0.5% chance per frame
            ? 0.6 + Math.random() * 0.8
            : 0;

        if (child.material) {
          const pulse = THREE.MathUtils.clamp(base + flash, 0.4, 1);
          child.material.opacity = pulse;
          child.material.emissiveIntensity = 0.5 + pulse * 1.2;
        }
      });
    }

    // 🕓 periodic global surge (every ~10 seconds)
    if (Math.floor(t) % 10 === 0 && flashTimer.current !== Math.floor(t)) {
      flashTimer.current = Math.floor(t);
      if (sparkleGroup.current) {
        sparkleGroup.current.children.forEach((child) => {
          if (child.material) {
            gsap.to(child.material, {
              opacity: 1.2,
              duration: 0.4,
              yoyo: true,
              repeat: 1,
              ease: "power2.inOut",
            });
          }
        });
      }
    }
  });

  return (
    <group ref={sparkleGroup}>
      {/* 🩵 Wide faint dust layer */}
      <Sparkles
        count={800}
        scale={[700, 400, 700]}
        size={1.5}
        opacity={0.35}
        speed={0.25}
        color="#99ccff"
        depthWrite={false}
        noise={1.2}
      />

      {/* 💜 Mid-layer brighter particles */}
      <Sparkles
        count={400}
        scale={[550, 300, 550]}
        size={2.5}
        opacity={0.6}
        speed={0.3}
        color="#b78cff"
        depthWrite={false}
        noise={0.8}
      />

      {/* 💫 Larger energetic clusters */}
      <Sparkles
        count={300}
        scale={[500, 250, 500]}
        size={4}
        opacity={0.8}
        speed={0.35}
        color="#ff99ff"
        depthWrite={false}
        position={[0, 40, -60]}
        noise={0.5}
      />

      {/* ⚡ Random energetic bursts */}
      <Sparkles
        count={180}
        scale={[350, 200, 350]}
        size={6}
        opacity={0.9}
        speed={0.45}
        color="#ff77ff"
        depthWrite={false}
        position={[-100, -40, 100]}
        noise={0.3}
      />

      {/* 🌠 Distant faint halo dust */}
      <Sparkles
        count={500}
        scale={[900, 600, 900]}
        size={1}
        opacity={0.2}
        speed={0.1}
        color="#a3c0ff"
        depthWrite={false}
        position={[0, 0, -200]}
        noise={2}
      />
    </group>
  );
}