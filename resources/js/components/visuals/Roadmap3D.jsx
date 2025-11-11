import React, { useRef, useState, useMemo, useEffect } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { a, useSpring } from "@react-spring/three";

const Roadmap3D = ({ milestones = [] }) => {
  const groupRef = useRef();
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [active, setActive] = useState(null);

  const textureUrl = "/textures/circle_texture.jpg";
  const texture = useLoader(THREE.TextureLoader, textureUrl);

  useEffect(() => {
    if (texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1, 1);
    }
  }, [texture]);

  // 🪐 2025–2028 Vision Roadmap
  const data = useMemo(
    () =>
      milestones.length
        ? milestones
        : [
            {
              title: "Genesis – The Spark",
              year: "2025 • Phase 0",
              desc: "Birth of the Light Web — conceptual spark of the decentralized 3D blockchain. Core architecture, protocol design, and universe topology defined.",
              y: 0,
            },
            {
              title: "Formation – Universe Systems",
              year: "2025 • Phase 1",
              desc: "Universe implementation begins. Laravel + React + Three.js foundation established. Stars, systems, and node mapping structure created.",
              y: 3,
            },
            {
              title: "Resonance – Node Environments",
              year: "2025 • Phase 2",
              desc: "Node scenes defined as 3D data planets. Each node visualizes live blockchain metrics, connecting functional blockchain layers in space.",
              y: 6,
            },
            {
              title: "Fusion – Wallet & Market",
              year: "2026 • Phase 3",
              desc: "Wallet and market exchange nodes integrated. Real-time trading, blockchain data flow, and smart contract interactions in 3D space.",
              y: 9,
            },
            {
              title: "Expansion – Outer Exchanges",
              year: "2026 • Phase 4",
              desc: "Acceptance of outer exchanges and multi-chain connectivity. External APIs visualized as orbiting stars; user-defined nodes introduced.",
              y: 12,
            },
            {
              title: "Awareness – Wzkr AI",
              year: "2027 • Phase 5",
              desc: "The AI Navigator awakens — adaptive routing, predictive analytics, and guided navigation between nodes powered by Wzkr AI.",
              y: 15,
            },
            {
              title: "Convergence – Self-Organizing Network",
              year: "2027 • Phase 6",
              desc: "Nodes gain autonomy through on-chain governance. Cross-node coordination, user clusters, and self-balancing data flow established.",
              y: 18,
            },
            {
              title: "Singularity – Holographic Web",
              year: "2028 • Phase 7",
              desc: "The Light Web transcends screen-space — holographic 3D interfaces and AR/VR projection of live blockchain data achieved.",
              y: 21,
            },
          ],
    [milestones]
  );


  // 🌌 Gentle float motion
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current && !dragging) {
      groupRef.current.rotation.y = Math.sin(t * 0.1) * 0.05;
    }
  });

  return (
    <group
      ref={groupRef}
      position={[0, 2, 20]}
     
    >
      {/* Central beam */}
      <mesh position={[0, 10.5, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 24, 16]} />
        <meshStandardMaterial
          emissive={new THREE.Color("#00ffff")}
          emissiveIntensity={2.2}
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Interconnecting arcs */}
      {data.map((m, i) => {
        if (i === 0) return null;
        const prev = data[i - 1];
        const midY = (m.y + prev.y) / 2;
        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(0, prev.y, 0),
          new THREE.Vector3(0.6, midY + 0.4, 0),
          new THREE.Vector3(0, m.y, 0)
        );
        const points = curve.getPoints(24);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        return (
          <line key={`arc-${i}`}>
            <bufferGeometry attach="geometry" {...geometry} />
            <lineBasicMaterial
              attach="material"
              color="#00ffff"
              transparent
              opacity={0.25}
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
              onPointerOver={(e) => (document.body.style.cursor = "pointer")}
              onPointerOut={() => (document.body.style.cursor = "auto")}
            >
              <sphereGeometry args={[0.45, 32, 32]} />
              <meshStandardMaterial
                map={texture}
                emissive={isActive ? "#00ffff" : "#113344"}
                emissiveIntensity={isActive ? 4 : 1.8}
                color={isActive ? "#66ffff" : "#88ccff"}
              />
            </mesh>

            {/* Label Left (Year + Phase) */}
            <Html distanceFactor={9} position={[-2, 0.2, 0]} style={{ pointerEvents: "none" }}>
              <div
                style={{
                  color: "#00ffff",
                  fontFamily: "Orbitron, sans-serif",
                  fontSize: "0.8rem",
                  textAlign: "right",
                  textShadow: "0 0 6px #00ffff",
                  userSelect: "none",
                  minWidth: "100px",
                }}
              >
                {m.year}
              </div>
            </Html>

            {/* Label Right (Title) */}
            <Html distanceFactor={9} position={[1, 0.2, 0]} style={{ pointerEvents: "none" }}>
              <div
                style={{
                  color: "#b8eaff",
                  fontFamily: "Orbitron, sans-serif",
                  fontSize: "0.85rem",
                  textShadow: "0 0 4px #00ffff",
                  userSelect: "none",
                  minWidth: "160px",
                }}
              >
                {m.title}
              </div>
            </Html>

            {/* Active Info */}
            {isActive && (
              <Html distanceFactor={8} position={[2.2, 0.6, 0]}>
                <div
                  style={{
                    background: "rgba(0, 0, 0, 0.6)",
                    padding: "0.8rem 1rem",
                    borderRadius: "8px",
                    width: "240px",
                    color: "#ccfaff",
                    fontFamily: "Rajdhani, sans-serif",
                    fontSize: "0.75rem",
                    border: "1px solid #00ffff",
                    boxShadow: "0 0 12px #00ffff88",
                  }}
                >
                  <strong style={{ color: "#00ffff" }}>{m.title}</strong>
                  <p style={{ marginTop: "0.4rem" }}>{m.desc}</p>
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
