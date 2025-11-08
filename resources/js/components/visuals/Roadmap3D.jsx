import React, { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { a, useSpring } from "@react-spring/three";

const Roadmap3D = ({ milestones = [] }) => {
  const groupRef = useRef();
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [active, setActive] = useState(null);

  // Default milestones with more lore-rich descriptions and years
  const data = useMemo(
    () =>
      milestones.length
        ? milestones
        : [
            {
              title: "Genesis",
              year: "2023",
              desc: "The conception of the Light Web protocol – the first spark of a decentralized 3D blockchain network born from the fusion of cryptography and virtual topology.",
              y: 0,
            },
            {
              title: "Awakening",
              year: "2024",
              desc: "Initial blockchain integration and light-node testnets deployed across early clusters. The awakening of the first autonomous node-entities.",
              y: 3,
            },
            {
              title: "Expansion",
              year: "2025",
              desc: "Full-scale Light Web network expansion. Launch of immersive 3D universe interface, allowing traversal between functional blockchain planets.",
              y: 6,
            },
            {
              title: "Convergence",
              year: "2026",
              desc: "Smart node contracts merge into the main protocol layer, enabling seamless cross-node data orchestration and planetary contract binding.",
              y: 9,
            },
            {
              title: "Singularity",
              year: "2027",
              desc: "The AI Mesh awakens — Light Web achieves sentience-level adaptive routing, allowing AI-driven evolution of its digital universe.",
              y: 12,
            },
          ],
    [milestones]
  );

  // Handle vertical drag for navigation
  const handlePointerDown = (e) => {
    setDragging(true);
    setDragOffset(e.clientY);
  };

  const handlePointerUp = () => setDragging(false);

  const handlePointerMove = (e) => {
    if (dragging && groupRef.current) {
      const delta = (e.clientY - dragOffset) * 0.01;
      const nextY = THREE.MathUtils.clamp(
        groupRef.current.position.y - delta,
        -3,
        3
      );
      groupRef.current.position.y = nextY;
      setDragOffset(e.clientY);
    }
  };

  // Smooth float motion
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current && !dragging) {
      groupRef.current.rotation.y = Math.sin(t * 0.1) * 0.05;
    }
  });

  return (
    <group
      ref={groupRef}
      position={[0, 1.5, 20]} // pulled closer
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
    >
      {/* Vertical beam */}
      <mesh position={[0, 6, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 14, 16]} />
        <meshStandardMaterial
          emissive={new THREE.Color("#00ffff")}
          emissiveIntensity={2.5}
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Connecting arcs between milestones */}
      {data.map((m, i) => {
        if (i === 0) return null;
        const prev = data[i - 1];
        const midY = (m.y + prev.y) / 2;
        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(0, prev.y, 0),
          new THREE.Vector3(0.6, midY + 0.5, 0),
          new THREE.Vector3(0, m.y, 0)
        );
        const points = curve.getPoints(20);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        return (
          <line key={`arc-${i}`}>
            <bufferGeometry attach="geometry" {...geometry} />
            <lineBasicMaterial
              attach="material"
              color="#00ffff"
              transparent
              opacity={0.3}
            />
          </line>
        );
      })}

      {/* Milestones */}
      {data.map((m, i) => {
        const isActive = active === i;
        const { scale } = useSpring({
          scale: isActive ? 1.4 : 1,
          config: { mass: 1, tension: 180, friction: 12 },
        });

        return (
          <a.group key={i} position={[0, m.y, 0]} scale={scale}>
            <mesh
              onClick={() => setActive(isActive ? null : i)}
              onPointerOver={(e) => (e.stopPropagation(), (document.body.style.cursor = "pointer"))}
              onPointerOut={(e) => (document.body.style.cursor = "auto")}
            >
              <sphereGeometry args={[0.45, 32, 32]} />
              <meshStandardMaterial
                emissive={isActive ? "#00ffff" : "#0077ff"}
                emissiveIntensity={isActive ? 4 : 1.8}
                color={isActive ? "#aaffff" : "#99ccff"}
              />
            </mesh>

            {/* Year Label (Left) */}
            <Html distanceFactor={9} position={[-2.5, 0.2, 0]} style={{ pointerEvents: "none" }}>
              <div
                style={{
                  color: "#00ffff",
                  fontFamily: "Orbitron, sans-serif",
                  fontSize: "0.8rem",
                  textAlign: "right",
                  textShadow: "0 0 6px #00ffff",
                }}
              >
                {m.year}
              </div>
            </Html>

            {/* Floating Label (Right) */}
            <Html distanceFactor={9} position={[1, 0.2, 0]} style={{ pointerEvents: "none" }}>
              <div
                style={{
                  color: "#b8eaff",
                  fontFamily: "Orbitron, sans-serif",
                  fontSize: "0.8rem",
                  textShadow: "0 0 4px #00ffff",
                  userSelect: "none",
                }}
              >
                {m.title}
              </div>
            </Html>

            {/* Active Info Panel */}
            {isActive && (
              <Html distanceFactor={8} position={[2, 0.5, 0]}>
                <div
                  style={{
                    background: "rgba(0, 0, 0, 0.6)",
                    padding: "0.8rem 1rem",
                    borderRadius: "8px",
                    width: "220px",
                    color: "#ccfaff",
                    fontFamily: "Rajdhani, sans-serif",
                    fontSize: "0.75rem",
                    border: "1px solid #00ffff",
                    boxShadow: "0 0 10px #00ffff88",
                    userSelect: "none",
                  }}
                >
                  <strong style={{ color: "#00ffff" }}>{m.title}</strong>
                  <p style={{ marginTop: "0.3rem" }}>{m.desc}</p>
                </div>
              </Html>
            )}
          </a.group>
        );
      })}
    </group>
  );
};

export default Roadmap3D;