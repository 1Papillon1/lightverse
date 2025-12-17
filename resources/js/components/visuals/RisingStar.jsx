import React, { useRef, useState, useEffect } from "react";
import { MeshWobbleMaterial, Sparkles, Html } from "@react-three/drei";
import { observer } from "mobx-react-lite";
import { Inertia } from "@inertiajs/inertia";
import { systems } from "@/config/systems";

const starConfigs = systems.galaxy.map((node, index) => {
  const positions = [
    [-40, 2, 105],
    [59, 15, 85],
    [85, -35, -17],
    [-65, -15, 8],
    [25, 15, -60],
  ];
  const themes = ["black", "orange", "gray", "darkbrown", "lightbrown"];

  return {
    id: node.id,
    label: node.name,
    theme: themes[index % themes.length],
    position: positions[index % positions.length],
  };
});

const RisingStar = observer(({ position, theme = "default", label = "🚧 Work in Progress", interactive = true }) => {
  const mesh = useRef();
  const containerRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);
  const glitchTimer = useRef(null);
  const shellCount = 24;

  // 🧠 Automatically resolve node routes
  const lowerLabel = label.toLowerCase().replace(/\s+/g, "");
  const nodeSet = systems[lowerLabel] || [];
  const routeList = nodeSet.length ? nodeSet : [{ id: lowerLabel, name: label, route: `/${lowerLabel}` }];

  // 🎨 Theme palette
  const themes = {
    default: { core: "#ffcc88", emissive: "#ff0080" },
    black: { core: "#111111", emissive: "#ff00ff" },
    orange: { core: "#ffaa33", emissive: "#ff5500" },
    gray: { core: "#888888", emissive: "#00e0ff" },
    darkbrown: { core: "#3b2a1f", emissive: "#ff8800" },
    lightbrown: { core: "#a07955", emissive: "#ffcc00" },
  };
  const { core, emissive } = themes[theme] || themes.default;

  const showPanel = true;

  // 🌫️ Fade in/out transition
  useEffect(() => {
    setHovered(false);
  }, []);

  // ⚡ Glitch timer
  useEffect(() => {
    const loop = () => {
      const delay = 1000 + Math.random() * 3000;
      glitchTimer.current = setTimeout(() => {
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 400);
        loop();
      }, delay);
    };
    loop();
    return () => clearTimeout(glitchTimer.current);
  }, []);

  // 🪐 Render
  return (
    <group position={position}>
      {/* 🌟 Star core */}
      <mesh
        ref={mesh}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          color={core}
          emissive={emissive}
          emissiveIntensity={hovered ? 1.2 : 0.8}
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

      {/* 📍 Info Panel */}
      {interactive && showPanel && (
        <>
          {/* Line */}
          <mesh position={[0, 15, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 35, 5]} />
            <meshStandardMaterial
              color={emissive}
              emissive={emissive}
              emissiveIntensity={2.2}
              toneMapped={false}
            />
          </mesh>

          <Html position={[0, 38, 0]} center>
            <div
              ref={containerRef}
              onPointerOver={() => setHovered(true)}
              onPointerOut={() => setHovered(false)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                background: "rgba(10, 10, 20, 0.45)",
                border: hovered
                  ? "1px solid rgba(255, 0, 255, 0.65)"
                  : "1px solid rgba(255, 0, 255, 0.25)",
                borderRadius: "12px",
                padding: hovered ? "14px 20px" : "6px 8px",
                boxShadow: hovered
                  ? "0 0 25px rgba(255, 0, 255, 0.7), 0 0 50px rgba(0, 255, 255, 0.5)"
                  : "0 0 15px rgba(255, 0, 255, 0.3)",
                transform: hovered ? "scale(1.08)" : "scale(1.0)",
                transition: "all 0.3s ease",
              }}
              className="r3f-html"
            >
              <div
                className={`glitch ${glitchActive ? "active" : ""}`}
                data-text={label}
                style={{
                  color: "#ff33ff",
                  fontSize: hovered ? "18px" : "13px",
                  fontFamily: "Orbitron, monospace",
                  textAlign: "center",
                  textShadow: "0 0 8px #ff00ff, 0 0 16px #00ffff",
                  marginBottom: "4px",
                }}
              >
                {label}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  alignItems: "center",
                }}
              >
                {routeList.map((node) => (
                  <div
                    key={node.id}
                    onClick={() =>
                      Inertia.visit(node.route, {
                        preserveState: true,
                        preserveScroll: true,
                      })
                    }
                    style={{
                      padding: "3px 8px",
                      minWidth: "100px",
                      color: "#00ffcc",
                      fontSize: hovered ? "14px" : "11px",
                      fontFamily: "Orbitron, monospace",
                      textAlign: "center",
                      textShadow: "0 0 8px #00ffff, 0 0 16px #ff00ff",
                      borderRadius: "6px",
                      background: hovered ? "rgba(0,255,255,0.05)" : "rgba(0,0,0,0.2)",
                      cursor: "pointer",
                      transition: "all 0.25s ease",
                    }}
                  >
                    {node.name}
                  </div>
                ))}
              </div>
            </div>
          </Html>
        </>
      )}
    </group>
  );
});

export default RisingStar;
