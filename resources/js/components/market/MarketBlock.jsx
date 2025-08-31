// MarketBlock.jsx
import React, {
  forwardRef,
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
} from "react";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";

export const generateColor = (index) => {
  const colors = [
    "#00FF00", // Najveći rast (jarka zelena)
    "#32CD32", // Srednje jaka zelena
    "#66CDAA", // Svjetlija zelena
    "#ADFF2F", // Najmanji rast (žuto-zelena)
    "#FFD700", // Neutralna (zlatna)
    "#FA8072", // Najmanji pad (narančasto-crvena)
    "#CD5C5C", // Svjetlija crvena
    "#DC143C", // Srednje jaka crvena
    "#FF0000"  // Najveći pad (jarka crvena)
  ];
  return colors[index % colors.length];
};

export const MarketBlock = forwardRef(({ market, position, color, onClick }, ref) => {
  // lokalni ref na group koji ćemo “forwardati” van
  const groupRef = useRef();
  // ref na mesh za glow
  const meshRef  = useRef();
  const [hovered, setHovered] = useState(false);

  // forwardanje groupRef.current u roditeljski ref
  useImperativeHandle(ref, () => groupRef.current);

  // glow efekt
  useEffect(() => {
    if (!meshRef.current) return;
    gsap.to(meshRef.current.material, {
      emissiveIntensity: hovered ? 1 : 0,
      duration: 0.3,
    });
  }, [hovered]);

  // pomoćna komponenta za dva reda teksta
  const TwoLines = ({ lines, position, rotation, zOffset = 0.001, scale = [1,1,1] }) => (
    <group position={position} rotation={rotation} scale={scale}>
      <Text
        position={[0, 0.03, zOffset]}
        fontSize={0.025}
        color="white"
        anchorX="center"
        anchorY="middle"
        font="/fonts/orbitron/Orbitron-Black.ttf"
      >
        {lines[0]}
      </Text>
      <Text
        position={[0, -0.03, zOffset]}
        fontSize={0.025}
        color="white"
        anchorX="center"
        anchorY="middle"
        font="/fonts/orbitron/Orbitron-Black.ttf"
      >
        {lines[1]}
      </Text>
    </group>
  );

  // parsiranje podataka
  const {
    price,
    percent_change_24h,
    market_cap,
    volume_24h,
    percent_change_7d,
    ath_price,
    percent_from_price_ath,
  } = (() => {
    const q = market.quotes.USD;
    return {
      price: q.price?.toFixed(4) ?? "N/A",
      percent_change_24h: q.percent_change_24h?.toFixed(2) + "%" ?? "N/A",
      market_cap:
        q.market_cap != null
          ? (q.market_cap / 1e9).toFixed(2) + "B"
          : "N/A",
      volume_24h:
        q.volume_24h != null
          ? (q.volume_24h / 1e9).toFixed(2) + "B"
          : "N/A",
      percent_change_7d: q.percent_change_7d?.toFixed(2) + "%" ?? "N/A",
      ath_price: q.ath_price?.toFixed(2) ?? "N/A",
      percent_from_price_ath:
        q.percent_from_price_ath?.toFixed(2) + "%" ?? "N/A",
    };
  })();

  return (
    <group ref={groupRef} position={position}> 
      <mesh
        castShadow
        ref={meshRef}
        material={
          new THREE.MeshStandardMaterial({
            color: new THREE.Color(color),
            emissive: new THREE.Color(color),
            emissiveIntensity: 0.1,
          })
        }
        onPointerOver={() => {
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "default";
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          onClick(groupRef.current, position, market);
        }}
      >
        <boxGeometry args={[0.35, 0.35, 0.35]} />
      </mesh>

      {/* FRONT (+Z): Symbol + Price */}
      <TwoLines
        lines={[market.symbol, `$${price}`]}
        position={[0, 0, 0.18]}
        rotation={[0, 0, 0]}
      />

      {/* BACK (–Z): % Change 24h */}
      <TwoLines
        lines={["24h Δ", percent_change_24h]}
        position={[0, 0, -0.18]}
        rotation={[0, Math.PI, 0]}
      />

      {/* RIGHT (+X): ATH & from ATH */}
      <TwoLines
        lines={["ATH", `$${ath_price}`]}
        position={[0.18, 0.10, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        zOffset={0.002}
        scale={[-1, 1, 1]}
      />
      <TwoLines
        lines={["from ATH", percent_from_price_ath]}
        position={[0.18, -0.10, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        zOffset={0.002}
        scale={[-1, 1, 1]}
      />

      {/* LEFT (–X): Market Cap */}
      <TwoLines
        lines={["Market Cap", market_cap]}
        position={[-0.18, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        zOffset={0.002}
        scale={[-1, 1, 1]}
      />

      {/* TOP (+Y): 24h Volume */}
      <TwoLines
        lines={["24h Vol.", volume_24h]}
        position={[0, 0.18, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      />

      {/* BOTTOM (–Y): % Change 7d */}
      <TwoLines
        lines={["7d Δ", percent_change_7d]}
        position={[0, -0.18, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      />
    </group>
  );
});
