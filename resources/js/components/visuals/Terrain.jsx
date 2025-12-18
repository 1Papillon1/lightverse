import React, { useRef, useEffect, useMemo } from "react";
import { RepeatWrapping, SRGBColorSpace } from "three";
import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import { useRootStore } from "@/stores/RootStore";

export default function Terrain({ type = "token" }) {
  const mesh = useRef();
  const { visualLoadStore } = useRootStore();

  const textureMap = {
    wallet: "/textures/wallet_node_4k.jpg",
    markets: "/textures/market_node_4k.jpg",
    contracts: "/textures/contract_node_4k.jpg",
    overview: "/textures/roadmap_node_4k.jpg",
    ai: "/textures/ai_node_4k.jpg",
    token: "/textures/market_node_4k.jpg",
  };

  const textureURL = textureMap[type] ?? textureMap.token;

  const texture = useLoader(TextureLoader, textureURL);

  useEffect(() => {
    if (!texture?.image) return;

    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set(16, 16);

    // ✅ THIS FIXES THE DARK / ORANGE ISSUE
    texture.colorSpace = SRGBColorSpace;
    texture.needsUpdate = true;

    // ✅ UNIVERSE IS READY ONLY NOW
    visualLoadStore.markUniverseReady();
  }, [texture, visualLoadStore]);

  return (
    <mesh
      ref={mesh}
      rotation={[-Math.PI / 1.6, 0, 0]}
      position={[0, -22, -20]}
      scale={[12, 6, 1]}
      receiveShadow
    >
      <planeGeometry args={[140, 140]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}
