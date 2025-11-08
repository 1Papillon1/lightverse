import React, { useEffect, useRef, useMemo } from "react";
import { RepeatWrapping, TextureLoader } from "three";
import { useLoader, useThree } from "@react-three/fiber";

export default function Terrain({ type = "token" }) {
  const mesh = useRef();
  const { viewport } = useThree();

  // 🌍 Map of main systems to textures
  const textureMap = {
    wallet: "/textures/wallet_node_4k.jpg",
    token: "/textures/market_node_4k.jpg",
    contract: "/textures/contract_node_4k.jpg",
    roadmap: "/textures/roadmap_node_4k.jpg",
    ai: "/textures/ai_node_4k.jpg",
    overview: "/textures/roadmap_node_4k.jpg", // fallback for Overview system
  };

  // 🌐 Map subnodes → parent terrain
  const fallbackMap = {
    about: "overview",
    roadmap: "overview",
    news: "overview",
    social: "overview",

    overview: "overview", // safe default
    compare: "markets",
    watchlist: "markets",
  };

  // 🧠 Resolve the correct texture type
  const resolvedType = useMemo(() => {
    // If this is a subnode, inherit its parent terrain type
    if (fallbackMap[type]) return fallbackMap[type];
    // Otherwise, use type directly
    return type;
  }, [type]);

  // 🎨 Load appropriate texture
  const textureURL = textureMap[resolvedType] || textureMap.token;
  const texture = useLoader(TextureLoader, textureURL);

  useEffect(() => {
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set(16, 16);
  }, [texture]);

  // 📏 Adjust terrain Y-position & rotation per viewport
  const positionY = useMemo(() => {
    if (viewport.width >= 20) return -22;
    if (viewport.width >= 15) return -20;
    if (viewport.width >= 10) return -18;
    return -18;
  }, [viewport.width]);

  const rotationX = useMemo(() => {
    if (resolvedType === "wallet") return 2;
    return 1.6;
  }, [resolvedType]);

  const argsScale = useMemo(() => {
    return [140, 140];
  }, [resolvedType]);

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

