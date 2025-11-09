import React, { useEffect, useRef, useMemo } from "react";
import { RepeatWrapping, TextureLoader } from "three";
import { useLoader, useThree } from "@react-three/fiber";

export default function Terrain({ type = "token" }) {
  const mesh = useRef();
  const { viewport } = useThree();

  // 🌍 Map of main systems to textures
  const textureMap = {
    wallet: "/textures/wallet_node_4k.jpg",
    markets: "/textures/market_node_4k.jpg",
    contracts: "/textures/contract_node_4k.jpg",
    overview: "/textures/roadmap_node_4k.jpg",
    ai: "/textures/ai_node_4k.jpg",
    token: "/textures/market_node_4k.jpg", // default/fallback
  };

  // 🎨 Resolve URL
  const textureURL = textureMap[type] || textureMap.token;
  console.log("🪐 Terrain type:", type, "→ texture:", textureURL);

  // 🎨 Load texture
  const texture = useLoader(TextureLoader, textureURL);

  useEffect(() => {
    if (!texture) return;
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set(16, 16);
  }, [texture]);

  // 📏 Position + rotation
  const positionY = useMemo(() => {
    if (viewport.width >= 20) return -22;
    if (viewport.width >= 15) return -20;
    if (viewport.width >= 10) return -18;
    return -18;
  }, [viewport.width]);

  const rotationX = useMemo(() => {
    return type === "wallet" ? 2 : 1.6;
  }, [type]);

  return (
    <mesh
      rotation={[-Math.PI / rotationX, 0, 0]}
      position={[0, positionY, -20]}
      ref={mesh}
      scale={[12, 6, 1]}
      receiveShadow
    >
      <planeGeometry args={[140, 140]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}
