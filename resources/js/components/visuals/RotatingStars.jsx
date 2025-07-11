import { Stars } from "@react-three/drei";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

function RotatingStars() {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0008 / 12; // slow rotation
    }
  });

  return (
    <group ref={groupRef}>
      <Stars radius={100} depth={30} count={8000} factor={4} fade />
    </group>
  );
}
export default RotatingStars;