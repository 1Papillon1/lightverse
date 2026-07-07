import { useRef, useEffect } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";

export default function SkeletonBot(props) {
  const group = useRef();

  const { scene, animations } = useGLTF(
    "/resources/models/bots/skeleton_bot.glb"
  );


  return (
    <group ref={group} {...props}>
      <primitive object={scene} />
    </group>
  );
}
