import React, { useEffect, useRef } from "react";
import { RepeatWrapping, TextureLoader } from "three";
import { useLoader } from "@react-three/fiber";

export default function Terrain({ type = "token" }) {
  const mesh = useRef();

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

  return (
    <mesh rotation={[-Math.PI / 1.6, 0, 0]} position={[0, -8, 0]} ref={mesh} receiveShadow>
      <planeGeometry args={[70, 70]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}
