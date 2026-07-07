// RotatingStars.jsx
import { Stars } from "@react-three/drei";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

function RotatingStars() {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.00008 / 12;
    }
  });

  return (
    <group ref={groupRef}>
      <Stars radius={400} depth={160} count={8000} factor={5} fade />
    </group>
  );
}
export default RotatingStars;