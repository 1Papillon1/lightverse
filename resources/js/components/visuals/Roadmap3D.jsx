// Roadmap3D.jsx
import React, { useRef, useState, useMemo, useEffect } from "react";
import { useLoader } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { a, useSpring } from "@react-spring/three";
import conceptMapData from "@/config/lightverse_concept_map.json";

const Roadmap3D = () => {
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

  // ✅ FIXED: Perfect circular orbit on XZ plane (Y=0)
  const phasePositions = useMemo(() => {
    return phases.map((phase, i) => {
      const angle = (i / phases.length) * Math.PI * 2;
      const radius = 12;
      return {
        ...phase,
        position: [
          Math.cos(angle) * radius,
          0, // ✅ All phases at Y=0 for perfect horizontal orbit
          Math.sin(angle) * radius
        ],
        angle,
        radius
      };
    });
  }, [phases]);

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
        controlsRef.current.target.set(position[0], 0, position[2]);
      }
    }
  };

  return (
    <>
      {/* ✅ FIXED: Pan only (up/down/left/right), NO rotation */}
      <OrbitControls
        ref={controlsRef}
        enableRotate={false}  // ✅ Completely disable rotation
        enablePan={true}       // ✅ Allow panning (arrow keys / drag)
        enableZoom={true}
        minDistance={15}
        maxDistance={50}
        minPolarAngle={Math.PI / 2}  // ✅ Lock vertical angle
        maxPolarAngle={Math.PI / 2}  // ✅ Lock vertical angle
        minAzimuthAngle={0}           // ✅ Lock horizontal rotation
        maxAzimuthAngle={0}           // ✅ Lock horizontal rotation
        enableDamping
        dampingFactor={0.05}
        screenSpacePanning={true}     // ✅ Better panning behavior
      />

      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 20]} intensity={2} color="#00ffff" />
      <directionalLight position={[10, 10, 15]} intensity={0.8} />

      {/* Title - stays at top */}
      <Html position={[0, 8, 0]} center style={{ pointerEvents: 'none' }}>
        <div style={{
          color: "#00ffff",
          fontFamily: "Orbitron, sans-serif",
          fontSize: "2rem",
          textShadow: "0 0 16px #00ffff",
          textAlign: "center",
          fontWeight: "bold"
        }}>
          LIGHTVERSE
          <div style={{ fontSize: "1rem", marginTop: "8px", opacity: 0.8 }}>
            Evolution Map
          </div>
        </div>
      </Html>

      {/* Phase Spheres */}
      {phasePositions.map((phase, i) => {
        const isSelected = selectedPhase?.id === phase.id;
        const isHovered = hovered === phase.id;

        const { scale } = useSpring({
          scale: isSelected ? 1.4 : isHovered ? 1.15 : 1,
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
              <sphereGeometry args={[1.2, 32, 32]} />
              <meshStandardMaterial
                map={texture}
                color={isSelected ? "#66ffff" : "#1a4d5c"}
                emissive={isSelected ? "#00ffff" : "#003344"}
                emissiveIntensity={isSelected ? 2.5 : 1.2}
                metalness={0.7}
                roughness={0.2}
              />
            </mesh>

            {/* Phase Label - always visible above */}
            <Html distanceFactor={15} position={[0, 2, 0]} center style={{ pointerEvents: 'none' }}>
              <div style={{
                color: isSelected ? "#00ffff" : "#66b3cc",
                fontFamily: "Orbitron, sans-serif",
                fontSize: isSelected ? "1.1rem" : "0.9rem",
                textShadow: "0 0 10px #00ffff",
                textAlign: "center",
                fontWeight: isSelected ? "bold" : "normal",
                transition: "all 0.3s ease",
                whiteSpace: "nowrap"
              }}>
                {phase.label}
              </div>
            </Html>

            {/* Concept subtitle - always visible below */}
            <Html distanceFactor={15} position={[0, -1.8, 0]} center style={{ pointerEvents: 'none' }}>
              <div style={{
                color: "#88ccdd",
                fontFamily: "Rajdhani, sans-serif",
                fontSize: "0.75rem",
                textShadow: "0 0 6px #00ffff",
                textAlign: "center",
                opacity: 0.7,
                fontStyle: "italic",
                maxWidth: "180px"
              }}>
                {phase.concept}
              </div>
            </Html>

            {/* Expanded Nodes (circular orbit around parent) */}
            {isSelected && phase.nodes && (
              <group>
                {phase.nodes.map((node, nodeIndex) => {
                  const nodeAngle = (nodeIndex / phase.nodes.length) * Math.PI * 2;
                  const nodeRadius = 3.5;
                  
                  const nodePos = [
                    Math.cos(nodeAngle) * nodeRadius,
                    0, // ✅ Keep nodes on same Y=0 plane
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
                        <sphereGeometry args={[0.5, 24, 24]} />
                        <meshStandardMaterial
                          color={completionRate === 1 ? "#00ff88" : "#ff9900"}
                          emissive={completionRate === 1 ? "#00ff88" : "#ff6600"}
                          emissiveIntensity={isNodeSelected ? 2.5 : 1.5}
                          metalness={0.6}
                          roughness={0.3}
                        />
                      </mesh>

                      {/* Node Label */}
                      <Html distanceFactor={12} position={[0, 1, 0]} center style={{ pointerEvents: 'none' }}>
                        <div style={{
                          color: "#b8eaff",
                          fontFamily: "Rajdhani, sans-serif",
                          fontSize: "0.8rem",
                          textShadow: "0 0 6px #00ffff",
                          textAlign: "center",
                          maxWidth: "150px",
                          fontWeight: isNodeSelected ? "bold" : "normal"
                        }}>
                          {node.label}
                        </div>
                      </Html>

                      {/* ✅ 2X LARGER Node Details Panel */}
                      {isNodeSelected && (
                        <Html distanceFactor={4} position={[0, -2, 0]}>
                          <div style={{
                            background: "rgba(0, 0, 0, 0.95)",
                            padding: "28px 32px",        // ✅ 2x padding
                            borderRadius: "16px",        // ✅ Larger radius
                            width: "520px",              // ✅ 2x width (was 380px)
                            color: "#ccfaff",
                            fontFamily: "Rajdhani, sans-serif",
                            fontSize: "1.1rem",          // ✅ 2x font size
                            border: "3px solid #00ffff", // ✅ Thicker border
                            boxShadow: "0 0 32px #00ffff88",
                            maxHeight: "600px",
                            overflowY: "auto"
                          }}>
                            <div style={{ 
                              color: "#00ffff", 
                              fontWeight: "bold", 
                              marginBottom: "16px",
                              fontSize: "1.6rem"         // ✅ 2x title
                            }}>
                              {node.label}
                            </div>
                            {node.tooltip && (
                              <div style={{ 
                                fontSize: "1.05rem",      // ✅ 2x tooltip
                                opacity: 0.9, 
                                marginBottom: "18px",
                                fontStyle: "italic",
                                color: "#88ddff"
                              }}>
                                {node.tooltip}
                              </div>
                            )}
                            <div style={{ marginTop: "16px" }}>
                              {node.description?.map((item, idx) => (
                                <div key={idx} style={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  marginBottom: "12px",
                                  opacity: item.completed ? 1 : 0.7,
                                  lineHeight: "1.6"
                                }}>
                                  <span style={{
                                    marginRight: "16px",
                                    color: item.completed ? "#00ff88" : "#ff9900",
                                    fontSize: "1.4rem",  // ✅ 2x checkmark
                                    flexShrink: 0,
                                    marginTop: "2px"
                                  }}>
                                    {item.completed ? "✓" : "○"}
                                  </span>
                                  <span style={{
                                    textDecoration: item.completed ? "line-through" : "none",
                                    fontSize: "1.05rem"  // ✅ 2x description text
                                  }}>
                                    {item.text}
                                  </span>
                                </div>
                              ))}
                            </div>
                            {node.achievements && node.achievements.length > 0 && (
                              <div style={{
                                marginTop: "20px",
                                paddingTop: "16px",
                                borderTop: "2px solid #00ffff44",
                                fontSize: "0.95rem"      // ✅ 2x achievements
                              }}>
                                <strong style={{ color: "#00ffff" }}>Achievements:</strong>
                                <div style={{ marginTop: "8px", opacity: 0.8 }}>
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
    </>
  );
};

export default Roadmap3D;