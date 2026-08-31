// resources/js/components/visuals/Terrain.jsx
import React, { useRef, useEffect } from "react";
import { useLoader } from "@react-three/fiber";
import { TextureLoader, RepeatWrapping, SRGBColorSpace } from "three";
import { useRootStore } from "@/stores/RootStore";

export default function Terrain({ type = "token" }) {
  const mesh = useRef();
  const { visualLoadStore } = useRootStore();
  const currentUrl = window.location.pathname;

  const textureMap = {
    wallet: "/textures/wallet_node_4k.jpg",
    markets: "/textures/market_node_4k.jpg",
    contracts: "/textures/contract_node_4k.jpg",
    overview: "/textures/roadmap_node_4k.jpg",
    identity: "/textures/identity_node_4k.jpg",
    ai: "/textures/ai_node_4k.jpg",
    token: "/textures/market_node_4k.jpg",
    digital: "/textures/futuristic-panels_4k.png",
  };

  // ✅ POPRAVAK: Koristimo 'let' jer ćemo možda redefinirati vrijednost
  // Ili još bolje, odredimo je odmah u jednom koraku:
  const isForge = currentUrl === "/galaxy/art-galaxy/digital-canvas/verse-forge";
  /* const textureURL = isForge ? textureMap.digital : (textureMap[type] ?? textureMap.token); */
  const textureURL = textureMap.digital; // Trenutno forsiramo digitalnu teksturu za sve, jer je to vizualni efekt koji želimo u svim slučajevima.

  const texture = useLoader(TextureLoader, textureURL);

  useEffect(() => {
    if (!texture?.image) return;

    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set(16, 16);
    texture.colorSpace = SRGBColorSpace;
    texture.needsUpdate = true;

    visualLoadStore.markUniverseReady();
  }, [texture, visualLoadStore]);

  return (
    <mesh
      ref={mesh}
      // Koristimo isForge varijablu za lakšu čitljivost nagiba
      rotation={isForge ? [-Math.PI / 1.95, 0, 0] : [-Math.PI / 1.6, 0, 0]}
      position={[0, -25, -20]}
      scale={[12, 4, 1]}
      receiveShadow
    >
      <planeGeometry args={[140, 140]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}