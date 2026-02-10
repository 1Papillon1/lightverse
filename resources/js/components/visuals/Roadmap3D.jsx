// Roadmap3D.jsx
import React, { useRef, useState, useMemo, useEffect } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { a, useSpring } from "@react-spring/three";
import conceptMapData from "@/config/lightverse_concept_map.json";

const Roadmap3D = () => {
  const groupRef = useRef();
  const controlsRef = useRef();
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [hovered, setHovered] = useState(null);

  const textureUrl = "/textures/circle_texture.jpg";
  const texture = useLoader(THREE.TextureLoader, textureUrl);

  useEffect(() => {
    if (texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
    }
  }, [texture]);

  const phases = useMemo(() => conceptMapData.phases, []);

  // ✅ FIXED: Perfect orbital circle positioning
  const phasePositions = useMemo(() => {
    return phases.map((phase, i) => {
      const angle = (i / phases.length) * Math.PI * 2;
      const radius = 12;
      return {
        ...phase,
        position: [
          Math.cos(angle) * radius,
          0, // ✅ All on same Y plane for perfect circle
          Math.sin(angle) * radius
        ],
        angle,
        radius
      };
    });
  }, [phases]);

  // 🌌 Gentle rotation
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current && !selectedPhase) {
      groupRef.current.rotation.y = t * 0.05;
    }
  });

  // 🎯 Zoom into selected phase
  const handlePhaseClick = (phase, position) => {
    if (selectedPhase?.id === phase.id) {
      setSelectedPhase(null);
      setSelectedNode(null);
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0);
      }
    } else {
      setSelectedPhase(phase);
      setSelectedNode(null);
      if (controlsRef.current) {
        controlsRef.current.target.set(...position);
      }
    }
  };

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        minDistance={8}
        maxDistance={40}
        enableDamping
        dampingFactor={0.05}
      />

      <ambientLight intensity={0.4} />
      <pointLight position={[0, 0, 0]} intensity={2} color="#00ffff" />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />

      {/* Central Genesis Core */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshStandardMaterial
          color="#0a0a2e"
          emissive="#00ffff"
          emissiveIntensity={1.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      <Html position={[0, 2.5, 0]} center>
        <div style={{
          color: "#00ffff",
          fontFamily: "Orbitron, sans-serif",
          fontSize: "1.4rem",
          textShadow: "0 0 12px #00ffff",
          textAlign: "center",
          pointerEvents: "none"
        }}>
          LIGHTVERSE
          <div style={{ fontSize: "0.8rem", marginTop: "6px", opacity: 0.8 }}>
            Evolution Map
          </div>
        </div>
      </Html>

      <group ref={groupRef}>
        {/* Phase Orbs */}
        {phasePositions.map((phase, i) => {
          const isSelected = selectedPhase?.id === phase.id;
          const isHovered = hovered === phase.id;

          const { scale } = useSpring({
            scale: isSelected ? 1.5 : isHovered ? 1.2 : 1,
            config: { tension: 200, friction: 20 }
          });

          return (
            <a.group
              key={phase.id}
              position={phase.position}
              scale={scale}
            >
              {/* Phase Sphere */}
              <mesh
                onClick={() => handlePhaseClick(phase, phase.position)}
                onPointerOver={() => setHovered(phase.id)}
                onPointerOut={() => setHovered(null)}
              >
                <sphereGeometry args={[0.8, 32, 32]} />
                <meshStandardMaterial
                  map={texture}
                  color={isSelected ? "#66ffff" : "#1a4d5c"}
                  emissive={isSelected ? "#00ffff" : "#003344"}
                  emissiveIntensity={isSelected ? 3 : 1.2}
                  metalness={0.6}
                  roughness={0.3}
                />
              </mesh>

              {/* Phase Label */}
              <Html distanceFactor={15} position={[0, 1.5, 0]} center>
                <div style={{
                  color: isSelected ? "#00ffff" : "#66b3cc",
                  fontFamily: "Orbitron, sans-serif",
                  fontSize: isSelected ? "1rem" : "0.85rem",
                  textShadow: "0 0 10px #00ffff",
                  textAlign: "center",
                  pointerEvents: "none",
                  fontWeight: isSelected ? "bold" : "normal",
                  transition: "all 0.3s ease"
                }}>
                  {phase.label}
                </div>
              </Html>

              {/* Concept description under phase label */}
              {!isSelected && (
                <Html distanceFactor={15} position={[0, 0.8, 0]} center>
                  <div style={{
                    color: "#88ccdd",
                    fontFamily: "Rajdhani, sans-serif",
                    fontSize: "0.7rem",
                    textShadow: "0 0 6px #00ffff",
                    textAlign: "center",
                    pointerEvents: "none",
                    opacity: 0.7,
                    fontStyle: "italic"
                  }}>
                    {phase.concept}
                  </div>
                </Html>
              )}

              {/* Expanded Nodes */}
              {isSelected && phase.nodes && (
                <group>
                  {phase.nodes.map((node, nodeIndex) => {
                    const nodeAngle = (nodeIndex / phase.nodes.length) * Math.PI * 2;
                    const nodeRadius = 3.5;
                    const nodePos = [
                      Math.cos(nodeAngle) * nodeRadius,
                      0, // ✅ Keep nodes on same plane
                      Math.sin(nodeAngle) * nodeRadius
                    ];

                    const completionRate = node.description
                      ? node.description.filter(d => d.completed).length / node.description.length
                      : 0;

                    const isNodeSelected = selectedNode?.id === node.id;

                    return (
                      <group key={node.id} position={nodePos}>
                        {/* Node Sphere */}
                        <mesh
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedNode(selectedNode?.id === node.id ? null : node);
                          }}
                        >
                          <sphereGeometry args={[0.35, 20, 20]} />
                          <meshStandardMaterial
                            color={completionRate === 1 ? "#00ff88" : "#ff9900"}
                            emissive={completionRate === 1 ? "#00ff88" : "#ff6600"}
                            emissiveIntensity={isNodeSelected ? 2.5 : 1.5}
                          />
                        </mesh>

                        {/* Node Label */}
                        <Html distanceFactor={12} position={[0, 0.8, 0]} center>
                          <div style={{
                            color: "#b8eaff",
                            fontFamily: "Rajdhani, sans-serif",
                            fontSize: "0.75rem",
                            textShadow: "0 0 6px #00ffff",
                            textAlign: "center",
                            pointerEvents: "none",
                            maxWidth: "140px",
                            fontWeight: isNodeSelected ? "bold" : "normal"
                          }}>
                            {node.label}
                          </div>
                        </Html>

                        {/* ✅ ENLARGED Node Details Panel */}
                        {isNodeSelected && (
                          <Html distanceFactor={6} position={[0, -1.2, 0]}>
                            <div style={{
                              background: "rgba(0, 0, 0, 0.92)",
                              padding: "18px 22px",
                              borderRadius: "12px",
                              width: "380px", // ✅ Made wider
                              color: "#ccfaff",
                              fontFamily: "Rajdhani, sans-serif",
                              fontSize: "0.9rem", // ✅ Larger font
                              border: "2px solid #00ffff",
                              boxShadow: "0 0 24px #00ffff88",
                              maxHeight: "400px",
                              overflowY: "auto"
                            }}>
                              <div style={{ 
                                color: "#00ffff", 
                                fontWeight: "bold", 
                                marginBottom: "12px",
                                fontSize: "1.1rem" // ✅ Larger title
                              }}>
                                {node.label}
                              </div>
                              {node.tooltip && (
                                <div style={{ 
                                  fontSize: "0.85rem", 
                                  opacity: 0.9, 
                                  marginBottom: "14px",
                                  fontStyle: "italic",
                                  color: "#88ddff"
                                }}>
                                  {node.tooltip}
                                </div>
                              )}
                              <div style={{ marginTop: "12px" }}>
                                {node.description?.map((item, idx) => (
                                  <div key={idx} style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    marginBottom: "8px",
                                    opacity: item.completed ? 1 : 0.7,
                                    lineHeight: "1.5"
                                  }}>
                                    <span style={{
                                      marginRight: "12px",
                                      color: item.completed ? "#00ff88" : "#ff9900",
                                      fontSize: "1rem",
                                      flexShrink: 0,
                                      marginTop: "2px"
                                    }}>
                                      {item.completed ? "✓" : "○"}
                                    </span>
                                    <span style={{
                                      textDecoration: item.completed ? "line-through" : "none",
                                      fontSize: "0.85rem"
                                    }}>
                                      {item.text}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              {node.achievements && node.achievements.length > 0 && (
                                <div style={{
                                  marginTop: "16px",
                                  paddingTop: "12px",
                                  borderTop: "1px solid #00ffff44",
                                  fontSize: "0.75rem"
                                }}>
                                  <strong style={{ color: "#00ffff" }}>Achievements:</strong>
                                  <div style={{ marginTop: "6px", opacity: 0.8 }}>
                                    {node.achievements.join(" • ")}
                                  </div>
                                </div>
                              )}
                            </div>
                          </Html>
                        )}
                      </group>
                    );
                  })}
                </group>
              )}
            </a.group>
          );
        })}
      </group>
    </>
  );
};

export default Roadmap3D;