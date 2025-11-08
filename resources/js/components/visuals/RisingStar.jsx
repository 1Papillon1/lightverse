import React, { useRef, useState, useEffect } from "react";
import { MeshWobbleMaterial, Sparkles, Html } from "@react-three/drei";
import { observer } from "mobx-react-lite";
import { Inertia } from "@inertiajs/inertia";
import { a, useSpring } from "@react-spring/three";

const RisingStar = observer(
  ({ position, theme = "default", label, systemId, isActive, onToggleContext }) => {
    const mesh = useRef();
    const [hovered, setHovered] = useState(false);
    const shellCount = 24;

    const nodeMap = {
      wallet: ["Overview", "Transactions", "Settings"],
      markets: ["Market Overview", "News", "Trends"],
      contracts: ["Deploy", "Audit", "Interact"],
      overview: ["About", "Roadmap", "News", "Social"],
      ai: ["Models", "Training", "Insights"],
    };
    const nodes = nodeMap[systemId] || [];

    const themes = {
      default: { core: "#ffcc88", emissive: "#ff0080" },
      black: { core: "#111111", emissive: "#ff00ff" },
      orange: { core: "#ffaa33", emissive: "#ff5500" },
      gray: { core: "#888888", emissive: "#00e0ff" },
      darkbrown: { core: "#3b2a1f", emissive: "#ff8800" },
      lightbrown: { core: "#a07955", emissive: "#ffcc00" },
    };
    const { core, emissive } = themes[theme] || themes.default;

    // 🌠 fade animation
    const spring = useSpring({
      opacity: isActive ? 1 : 0,
      scale: isActive ? 1 : 0.9,
      config: { tension: 180, friction: 24 },
    });

    return (
      <group position={position}>
        {/* 🌟 Star Core */}
        <mesh
          ref={mesh}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onContextMenu={(event) => {
            // Fix crash — only trigger for real events
            if (event && event.preventDefault) {
              event.preventDefault();
              event.stopPropagation();
              onToggleContext?.();
            }
          }}
        >
          <sphereGeometry args={[2, 64, 64]} />
          <meshStandardMaterial
            color={core}
            emissive={emissive}
            emissiveIntensity={0.8}
            metalness={0.3}
            roughness={0.5}
          />
        </mesh>

        {/* 🌌 Glow shells */}
        {Array.from({ length: shellCount }, (_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[2 + (i + 1) * 0.3, 64, 64]} />
            <MeshWobbleMaterial
              color={core}
              emissive={emissive}
              emissiveIntensity={0.1 / (i + 1)}
              factor={0.4 + (i + 1) * 0.1}
              speed={1 - (i + 1) * 0.1}
              transparent
              opacity={0.15 / (i + 1)}
            />
          </mesh>
        ))}

        <Sparkles count={120} scale={30} size={5} speed={0.5} opacity={0.8} color={core} />

        {/* 🟣 Hover label (always visible when hovered, even if not active) */}
        {hovered && !isActive && (
          <>
            <mesh position={[0, 9, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 15, 5]} />
              <meshStandardMaterial
                color={emissive}
                emissive={emissive}
                emissiveIntensity={2.2}
                toneMapped={false}
              />
            </mesh>
            <Html position={[0, 19, 0]} center>
              <div
                style={{
                  color: "#ff33ff",
                  fontSize: "18px",
                  fontFamily: "Orbitron, monospace",
                  textAlign: "center",
                  textShadow: "0 0 8px #ff00ff, 0 0 16px #00ffff",
                }}
              >
                {label}
              </div>
            </Html>
          </>
        )}

        {/* ✨ Persistent context menu when active */}
        {isActive && (
          <a.group position={[0, 9, 0]} scale={spring.scale}>
            {/* Neon Line */}
            <mesh>
              <cylinderGeometry args={[0.04, 0.04, 15, 5]} />
              <a.meshStandardMaterial
                color={emissive}
                emissive={emissive}
                emissiveIntensity={2.2}
                transparent
                opacity={spring.opacity}
                toneMapped={false}
              />
            </mesh>

            {/* Main label */}
            <Html position={[0, 10, 0]} center>
              <a.div
                style={{
                  opacity: spring.opacity.to((v) => v),
                  transform: spring.scale.to((v) => `scale(${v})`),
                  color: "#ff33ff",
                  fontSize: "18px",
                  fontFamily: "Orbitron, monospace",
                  textAlign: "center",
                  textShadow: "0 0 8px #ff00ff, 0 0 16px #00ffff",
                }}
              >
                {label}
              </a.div>
            </Html>

            {/* 🌐 Node links vertically aligned below */}
            {nodes.map((nodeLabel, i) => {
              const spacing = 12 / (nodes.length + 1);
              const y = 6 - spacing * (i + 1);
              return (
                <Html key={nodeLabel} position={[1.8, y, 0]}>
                  <a.div
                    style={{
                      opacity: spring.opacity.to((v) => v),
                      transform: spring.scale.to((v) => `scale(${v})`),
                      color: "#b8eaff",
                      fontFamily: "Orbitron, monospace",
                      fontSize: "0.85rem",
                      textShadow: "0 0 6px #00ffff",
                      cursor: "pointer",
                      transition: "color 0.2s ease",
                    }}
                    onClick={() =>
                      Inertia.visit(`/${systemId}/${nodeLabel.toLowerCase()}`)
                    }
                    onMouseOver={(e) => (e.target.style.color = "#ffffff")}
                    onMouseOut={(e) => (e.target.style.color = "#b8eaff")}
                  >
                    {nodeLabel}
                  </a.div>
                </Html>
              );
            })}
          </a.group>
        )}
      </group>
    );
  }
);

export default RisingStar;
