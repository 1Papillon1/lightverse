// MarketBlock.jsx
import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
} from "react";
import { Text, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";

export const generateColor = (index) => {
  const colors = [
    "#00FF00",
    "#32CD32",
    "#66CDAA",
    "#ADFF2F",
    "#FFD700",
    "#FA8072",
    "#CD5C5C",
    "#DC143C",
    "#FF0000",
  ];
  return colors[index % colors.length];
};

export const MarketBlock = forwardRef(
  ({ market, position, color, onClick, pageAnimating, delay = 0, scale = 1 }, ref) => {
    const groupRef = useRef();
    const meshRef = useRef();
    const [hovered, setHovered] = useState(false);

    useImperativeHandle(ref, () => groupRef.current);

  
    useEffect(() => {
      if (!meshRef.current) return;
      gsap.to(meshRef.current.material, {
        emissiveIntensity: hovered ? 0.9 : 0.3,
        duration: 0.3,
      });
    }, [hovered]);

   
    useEffect(() => {
      if (!meshRef.current) return;

      const labelEls = groupRef.current.children.filter(
        (c) => c.type === "Group"
      );

      if (pageAnimating === "out") {
  gsap.to(meshRef.current.scale, {
    x: 0,
    y: 0,
    z: 0,
    duration: 0.6,
    ease: "power2.in",
    delay,
  });
  gsap.to(meshRef.current.material, {
    emissiveIntensity: 2,
    opacity: 0,
    duration: 0.6,
    ease: "power2.in",
    delay,
  });

  labelEls.forEach((label) => {
    gsap.to(label.position, {
      x: 0,
      y: 0,
      z: 0,
      duration: 0.4,
      ease: "power2.in",
      delay,
    });
    gsap.to(label.scale, {
      x: 0,
      y: 0,
      z: 0,
      duration: 0.4,
      ease: "power2.in",
      delay,
    });
    gsap.to(label.children, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      delay,
    });
  });
}

      if (pageAnimating === "in") {
        meshRef.current.scale.set(0, 0, 0);

        gsap.to(meshRef.current.scale, {
          x: 1,
          y: 1,
          z: 1,
          duration: 0.6,
          ease: "elastic.out(1,0.5)",
          delay,
        });
        gsap.fromTo(
          meshRef.current.material,
          { emissiveIntensity: 2, opacity: 0 },
          { emissiveIntensity: 0.3, opacity: 1, duration: 0.6, delay }
        );

        labelEls.forEach((label) => {
          const origPos = label.userData?.origPos ?? label.position.clone();
          label.userData.origPos = origPos; 

      
          label.position.set(0, 0, 0);
          label.scale.set(0, 0, 0);

 
          gsap.to(label.position, {
            x: origPos.x,
            y: origPos.y,
            z: origPos.z,
            duration: 0.5,
            ease: "back.out(1.7)",
            delay: delay + 0.05,
          });
          gsap.to(label.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: 0.5,
            ease: "back.out(1.7)",
            delay: delay + 0.1,
          });
          gsap.fromTo(
            label.children,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.4,
              ease: "power2.out",
              delay: delay + 0.15,
            }
          );
        });
      }
    }, [pageAnimating, delay]);

    const blockSize = 0.6;
    const half = blockSize / 2;
    const textOffset = 0.001;

    const TwoLines = ({ lines, position, rotation }) => (
      <group position={position} rotation={rotation}>
        <Text 
        frustumCulled={false}      
          position={[0, 0.05, 0]}
          fontSize={0.05}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="black"
          font="/fonts/orbitron/Orbitron-Black.ttf"
        >
          {lines[0]}
        </Text>
        <Text
        frustumCulled={false}
          position={[0, -0.05, 0]}
          fontSize={0.05}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="black"
          font="/fonts/orbitron/Orbitron-Black.ttf"
        >
          {lines[1]}
        </Text>
      </group>
    );

    const q = market.quotes.USD;
    const price = q.price?.toFixed(4) ?? "N/A";
    const percent_change_24h = q.percent_change_24h?.toFixed(2) + "%" ?? "N/A";
    const market_cap = q.market_cap
      ? (q.market_cap / 1e9).toFixed(2) + "B"
      : "N/A";
    const volume_24h = q.volume_24h
      ? (q.volume_24h / 1e9).toFixed(2) + "B"
      : "N/A";
    const percent_change_7d =
      q.percent_change_7d?.toFixed(2) + "%" ?? "N/A";
    const ath_price = q.ath_price?.toFixed(2) ?? "N/A";
    const percent_from_price_ath =
      q.percent_from_price_ath?.toFixed(2) + "%" ?? "N/A";

    return (
      <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
        
         <RoundedBox
    args={[blockSize, blockSize, blockSize]}
    radius={0.12}
    smoothness={4}
    ref={meshRef}
    castShadow
    onPointerOver={() => {
      setHovered(true);
      document.body.style.cursor = "pointer";
    }}
    onPointerOut={() => {
      setHovered(false);
      document.body.style.cursor = "default";
    }}
    onClick={(e) => {
      e.stopPropagation();
      onClick(groupRef.current, position, market);
    }}
  >
    <meshPhysicalMaterial
      color={color}
      roughness={0.4}
      metalness={0.6}
      clearcoat={1}
      clearcoatRoughness={0.1}
      emissive={new THREE.Color(color)}
      emissiveIntensity={hovered ? 1.2 : 0.6}
      transparent
      opacity={1}
      toneMapped={false}  
    />
  </RoundedBox>

        {/* Labels */}
        <TwoLines
          lines={[market.symbol, `$${price}`]}
          position={[0, 0, half + textOffset]}
          rotation={[0, 0, 0]}
        />
        <TwoLines
          lines={["24h Δ", percent_change_24h]}
          position={[0, 0, -half - textOffset]}
          rotation={[0, Math.PI, 0]}
        />
        <TwoLines
          lines={["ATH", `$${ath_price}`]}
          position={[half + textOffset, 0.1, 0]}
          rotation={[0, -Math.PI / 2, 0]}
        />
        <TwoLines
          lines={["from ATH", percent_from_price_ath]}
          position={[half + textOffset, -0.1, 0]}
          rotation={[0, -Math.PI / 2, 0]}
        />
        <TwoLines
          lines={["Market Cap", market_cap]}
          position={[-half - textOffset, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
        />
        <TwoLines
          lines={["24h Vol.", volume_24h]}
          position={[0, half + textOffset, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <TwoLines
          lines={["7d Δ", percent_change_7d]}
          position={[0, -half - textOffset, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        />
      </group>
    );
  }
);
