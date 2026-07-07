// PortfolioTowers.jsx
import React, { useMemo } from "react";
import { observer } from "mobx-react-lite";
import { RoundedBox, Text } from "@react-three/drei";

const mockPortfolio = [
  { symbol: "BTC", amount: 1, price: 118000 },
  { symbol: "ETH", amount: 10, price: 2000 },
  { symbol: "XRP", amount: 100, price: 0.5 },
  { symbol: "LTC", amount: 5, price: 150 },
  { symbol: "ADA", amount: 200, price: 0.3 },
  { symbol: "DOT", amount: 50, price: 10 },
  { symbol: "LINK", amount: 30, price: 15 },
];

const colors = [
  "#ffcc00",
  "#00ccff",
  "#9966ff",
  "#ff6699",
  "#33cc33",
  "#ff6600",
  "#66ffff",
  "#cccc00",
];

const PortfolioTowers = observer(({ onHover, onMouseMove, hoveredSymbol }) => {
  const towers = useMemo(() => {
    return mockPortfolio
      .map((asset, i) => {
        const usdValue = asset.amount * asset.price;
        return { ...asset, usdValue, color: colors[i % colors.length] };
      })
      .filter((asset) => asset.usdValue > 50)
      .sort((a, b) => b.usdValue - a.usdValue);
  }, []);

  const terrainY = -22;
  let currentY = terrainY;

  // For width scaling
  const maxValue = towers[0]?.usdValue ?? 1;
  const minValue = towers[towers.length - 1]?.usdValue ?? 1;

  return (
    <>
      {towers.map((asset, index) => {
        // Height (log scaling so it doesn’t explode for BTC)
        const height = Math.log(asset.usdValue + 1) * 0.6;

        // Width scaled relative to USD value (between 2 → 6 units)
        const widthScale =
          2 +
          ((asset.usdValue - minValue) / (maxValue - minValue || 1)) * 4;
        const width = widthScale;
        const depth = widthScale;

        // Stack calculation
        currentY += height / 2;
        const y = currentY;
        currentY += height / 2;

        const isHovered = hoveredSymbol === asset.symbol;

        return (
          <group key={asset.symbol} position={[0, y, 0]}>
            {/* Block */}
            <RoundedBox
              args={[width, height, depth]}
              radius={0.5}
              smoothness={6}
              castShadow
              onPointerEnter={(e) => {
                onHover(asset);
                onMouseMove({ x: e.clientX, y: e.clientY });
              }}
              onPointerMove={(e) => {
                onHover(asset);
                onMouseMove({ x: e.clientX, y: e.clientY });
              }}
              onPointerLeave={() => onHover(null)}
            >
              <meshPhysicalMaterial
                color={asset.color}
                roughness={isHovered ? 0.1 : 0.3}
                metalness={0.2}
                clearcoat={1}
                clearcoatRoughness={0.1}
                sheen={1}
                emissive={asset.color}
                emissiveIntensity={isHovered ? 0.8 : 0.3}
                transparent
                opacity={1}
              />
            </RoundedBox>

            {/* Crypto Symbol Label */}
            <Text
              position={[0, 0, depth / 2 + 0.05]} // just in front of block
              fontSize={0.6}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.04}
              outlineColor="black"
            >
              {asset.symbol}
            </Text>
          </group>
        );
      })}
    </>
  );
});

export default PortfolioTowers;
