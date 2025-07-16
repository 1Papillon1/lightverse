import React, { useEffect, useRef, useMemo } from "react";
import { RepeatWrapping, TextureLoader } from "three";
import { useLoader, useThree } from "@react-three/fiber";

export default function Terrain({ type = "token" }) {
  const mesh = useRef();

  const { viewport } = useThree();

  const textureMap = {
    wallet: "/textures/wallet_node_4k.jpg",
    token: "/textures/token_node_4k.jpg",
    contract: "/textures/contract_node_4k.jpg",
    roadmap: "/textures/roadmap_node_4k.jpg",
    ai: "/textures/ai_node_4k.jpg",
  };

  const textureURL = textureMap[type] || textureMap.token;
  const texture = useLoader(TextureLoader, textureURL);

  useEffect(() => {
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set(1, 1);
  }, [texture]);

  // adjust y position based on viewport width
  const positionY = useMemo(() => {
    if (viewport.width >= 20) return -22;
    if (viewport.width >= 15) return -20;
    if (viewport.width >= 10) return -18;
    return -18; // very narrow screens
  }, [viewport.width]);

  return (
    <mesh
      rotation={[-Math.PI / 1.6, 0, 0]}
      position={[0, positionY, 0]}
      ref={mesh}
      receiveShadow
    >
      <planeGeometry args={[70, 70]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}
