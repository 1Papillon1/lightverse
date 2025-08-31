// Terrain.jsx
import React, { useEffect, useRef, useMemo } from "react";
import { RepeatWrapping, TextureLoader } from "three";
import { useLoader, useThree } from "@react-three/fiber";

export default function Terrain({ type = "token" }) {
  const mesh = useRef();

  const { viewport } = useThree();

  const textureMap = {
    wallet: "/textures/wallet_node_4k.jpg",
    token: "/textures/market_node_4k.jpg",
    contract: "/textures/contract_node_4k.jpg",
    roadmap: "/textures/roadmap_node_4k.jpg",
    ai: "/textures/ai_node_4k.jpg",
  };

  const textureURL = textureMap[type] || textureMap.token;
  const texture = useLoader(TextureLoader, textureURL);

useEffect(() => {
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(16, 16); 
}, [texture]);


  const positionY = useMemo(() => {
    if (viewport.width >= 20) return -22;
    if (viewport.width >= 15) return -20;
    if (viewport.width >= 10) return -18;
    return -18; 
  }, [viewport.width]);

const rotationX = useMemo(() => {
    if (type === "wallet") return 2;
    return 1.6;
  }, [type]);

  const argsScale = useMemo(() => {
    if (type === "wallet") return [140, 140];
    return [140, 140];
  }, [type]);


  return (
    <mesh
      rotation={[-Math.PI / rotationX, 0, 0]}
      position={[0, positionY, -20]}
      ref={mesh}
      scale={[12, 6, 1]}
      receiveShadow
      >
      <planeGeometry args={argsScale} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}
