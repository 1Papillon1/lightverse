// resources/js/components/layout/FloatingNode.jsx
import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";

export default function FloatingNode({ type, position, onClick, texture }) {
  const mesh = useRef();
  const [hovered, setHovered] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const glitchTimer = useRef(null);

  // ✅ Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ⚡ Hover pulse & subtle breathing effect
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const scale = 1 + Math.sin(time * 2) * 0.03;
    if (mesh.current && hovered) {
      mesh.current.scale.set(scale, scale, scale);
    }
  });

  // ⚡ Random glitch flicker like RisingStar
  useEffect(() => {
    if (!hovered && !isMobile) {
      if (glitchTimer.current) clearTimeout(glitchTimer.current);
      return;
    }

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
  }, [hovered, isMobile]);

  const label = type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <group position={position}>
      {/* 🪐 Node mesh */}
      <mesh
        ref={mesh}
        onClick={onClick}
        onPointerOver={() => !isMobile && setHovered(true)}
        onPointerOut={() => !isMobile && setHovered(false)}
      >
        <sphereGeometry args={[0.8, 64, 64]} />
        <meshStandardMaterial
          map={texture}
          metalness={0.3}
          roughness={0.8}
          emissive={"#551177"}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* 📍 Label & line — same as RisingStar */}
      {(isMobile || hovered) && (
        <>
          {/* Neon vertical line */}
          <mesh position={[0, 2.5, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 3.5, 8]} />
            <meshStandardMaterial
              color={"#ff00ff"}
              emissive={"#ff00ff"}
              emissiveIntensity={2.0}
              toneMapped={false}
            />
          </mesh>

          {/* Floating neon-glitch label */}
          <Html position={[0, 4.5, 0]} center>
            <div
              className={`glitch ${glitchActive ? "active" : ""}`}
              data-text={label}
              style={{
                padding: "8px 16px",
                minWidth: "180px",
                color: "#ff33ff",
                fontSize: "18px",
                fontFamily: "Orbitron, monospace",
                textAlign: "center",
                pointerEvents: "none",
                textShadow:
                  "0 0 8px #ff00ff, 0 0 16px #00ffff, 0 0 24px #ff00ff",
                animation: glitchActive ? "glitch-flicker 0.4s ease-in-out" : "none",
              }}
            >
              {label}
            </div>
          </Html>
        </>
      )}
    </group>
  );
}







