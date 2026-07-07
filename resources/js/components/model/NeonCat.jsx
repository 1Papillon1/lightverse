// NeonCat.jsx
import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

export default function NeonCat(props) {
  const group = useRef();
  const { scene } = useGLTF("/models/wzkr.glb");

  

  // Procedural idle animation (breathing / floating)
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (group.current) {
      // Gentle up-down bobbing
      group.current.position.y = Math.sin(t * 1.1) * 0.01 + (props.position?.[1] || 0);

      // Tiny breathing-like scale pulse
      const scale = 2 + Math.sin(t * 1.1) * 0.01;
      group.current.scale.set(scale, scale, scale);
    }
  });

  return <primitive ref={group} object={scene} {...props} />;
}