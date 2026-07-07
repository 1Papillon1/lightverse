// resources/js/components/visuals/GeneratorModel.jsx
import React, { useRef, useEffect, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const HOLOGRAM_PATH = "/resources/models/light_generator/generator_hologram.glb";
const SOLID_PATH    = "/resources/models/light_generator/generator.glb";

// Preload both so there's no delay on swap
useGLTF.preload(HOLOGRAM_PATH);
useGLTF.preload(SOLID_PATH);

export default function GeneratorModel({ isComplete = false }) {
  const holoGLTF  = useGLTF(HOLOGRAM_PATH);
  const solidGLTF = useGLTF(SOLID_PATH);

  const groupRef     = useRef();
  const holoRef      = useRef();
  const solidRef     = useRef();
  const clockRef     = useRef(0);




  // Glitch/materialize state
  const [phase, setPhase]           = useState("hologram"); // "hologram" | "glitching" | "solid"
  const [glitchTimer, setGlitchTimer] = useState(0);
  const prevIsComplete              = useRef(false);

  // Trigger glitch sequence when isComplete flips to true
  useEffect(() => {

    if (isComplete && !prevIsComplete.current) {
      setPhase("glitching");
      setGlitchTimer(0);
    }
    prevIsComplete.current = isComplete;
  }, [isComplete]);

  // Clone scenes so materials can be modified independently
  const holoScene  = React.useMemo(() => {
    const clone = holoGLTF.scene.clone(true);
    clone.traverse(obj => {
      if (obj.isMesh) {
        obj.material = obj.material.clone();
        obj.material.transparent = true;
        obj.material.opacity = 0.75;
      }
    });
    return clone;
  }, [holoGLTF]);

  const solidScene = React.useMemo(() => {
    return solidGLTF.scene.clone(true);
  }, [solidGLTF]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Bob up and down
    clockRef.current += delta;
    groupRef.current.position.y = Math.sin(clockRef.current * 0.8) * 0.15;

    // Glitch sequence — runs for 1.8s then snaps to solid
    if (phase === "glitching") {
      setGlitchTimer(t => {
        const next = t + delta;

        if (holoRef.current) {
          // Flicker opacity rapidly
          const flicker = Math.random() > 0.4 ? Math.random() * 0.9 : 0;
          holoRef.current.traverse(obj => {
            if (obj.isMesh) obj.material.opacity = flicker;
          });

          // Random position jitter
          holoRef.current.position.x = (Math.random() - 0.5) * 0.3;
          holoRef.current.position.z = (Math.random() - 0.5) * 0.3;
        }

        if (next >= 1.8) {
          setPhase("solid");
          return 0;
        }
        return next;
      });
    }

    // Fade in solid model after glitch
    if (phase === "solid" && solidRef.current) {
      solidRef.current.traverse(obj => {
        if (obj.isMesh && obj.material.transparent) {
          obj.material.opacity = Math.min(1, obj.material.opacity + delta * 2);
          if (obj.material.opacity >= 1) obj.material.transparent = false;
        }
      });
    }
  });

  // Prepare solid scene for fade-in
  const solidSceneReady = React.useMemo(() => {
    const clone = solidScene.clone ? solidScene : solidGLTF.scene.clone(true);
    clone.traverse(obj => {
      if (obj.isMesh) {
        obj.material = obj.material.clone();
        obj.material.transparent = true;
        obj.material.opacity = 0;
      }
    });
    return clone;
  }, [solidScene]);

  

  return (
   <group ref={groupRef} position={[-7, -8, 15]} scale={[5, 5, 5]}>
      {/* Hologram — visible during build and glitch */}
      {(phase === "hologram" || phase === "glitching") && (
        <primitive
          ref={holoRef}
          object={holoScene}
        />
      )}

      {/* Solid — fades in after glitch */}
      {phase === "solid" && (
        <primitive
          ref={solidRef}
          object={solidSceneReady}
        />
      )}

      {/* Glow point light at core */}
      <pointLight
        color={phase === "solid" ? "#ffaa00" : "#00ffee"}
        intensity={phase === "glitching" ? Math.random() * 8 : 3}
        distance={8}
        position={[0, 0.5, 0]}
      />
    </group>
  );
}