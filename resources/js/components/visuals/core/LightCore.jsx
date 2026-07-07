// resources/js/components/visuals/core/LightCore.jsx
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

const LightCore = ({ systemLight = 0 }) => {
  const coreRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const ring3Ref = useRef();

  // ✅ Calculate core size based on System Light
  const baseCoreSize = 3;
  const lightGrowth = Math.min((systemLight / 50000) * 8, 12);
  const coreSize = baseCoreSize + lightGrowth;

  // ✅ Determine evolution stage
  const getStage = () => {
    if (systemLight < 1000) return 'genesis';
    if (systemLight < 10000) return 'awakening';
    if (systemLight < 50000) return 'radiant';
    return 'cosmic';
  };

  const stage = getStage();

  // ✅ Animations
  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Pulse core
    if (coreRef.current) {
      const pulse = Math.sin(time * 2) * 0.15;
      coreRef.current.scale.setScalar(1 + pulse);
    }

    // Rotate rings (different speeds based on stage)
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = time * 0.5;
      ring1Ref.current.rotation.y = time * 0.2;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = time * -0.3;
      ring2Ref.current.rotation.z = time * 0.15;
    }
    if (ring3Ref.current && stage !== 'genesis') {
      ring3Ref.current.rotation.z = time * 0.4;
      ring3Ref.current.rotation.x = time * -0.1;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* ========================================
          CENTRAL CORE (grows with Light)
          ======================================== */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[coreSize * 0.5, 32, 32]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Inner glow */}
      <mesh>
        <sphereGeometry args={[coreSize * 0.7, 32, 32]} />
        <meshBasicMaterial
          color="#00ffff"
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Outer aura */}
      <mesh>
        <sphereGeometry args={[coreSize, 32, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#00ffff"
          emissiveIntensity={2}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* ========================================
          RING 1 (Always visible)
          ======================================== */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[coreSize * 1.8, 0.3, 16, 100]} />
        <meshBasicMaterial
          color="#00ffff"
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* ========================================
          RING 2 (Appears at "awakening" stage)
          ======================================== */}
      {stage !== 'genesis' && (
        <mesh ref={ring2Ref}>
          <torusGeometry args={[coreSize * 2.3, 0.25, 16, 100]} />
          <meshBasicMaterial
            color="#00ffff"
            transparent
            opacity={0.5}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {/* ========================================
          RING 3 (Appears at "radiant" stage)
          ======================================== */}
      {(stage === 'radiant' || stage === 'cosmic') && (
        <mesh ref={ring3Ref}>
          <torusGeometry args={[coreSize * 2.8, 0.2, 16, 100]} />
          <meshBasicMaterial
            color="#00ffff"
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {/* ========================================
          SPARKLES (intensity grows with stage)
          ======================================== */}
      <Sparkles
        count={stage === 'genesis' ? 150 : stage === 'awakening' ? 250 : 400}
        scale={coreSize * 3}
        size={stage === 'cosmic' ? 6 : 4}
        speed={stage === 'cosmic' ? 0.5 : 0.3}
        opacity={0.8}
        color="#00ffff"
      />

      {/* ========================================
          LABEL
          ======================================== */}
      <Html position={[0, coreSize * 2.5, 0]} center sprite>
       

        {/* Stage indicator */}
        <div style={{
          color: "#00ffff",
          fontFamily: "Rajdhani, sans-serif",
          fontSize: "0.9rem",
          marginTop: "60px",
          opacity: 0.7,
          userSelect: "none",
          textAlign: "center",
          letterSpacing: "0.1em",
          textTransform: "uppercase"
        }}>
          {stage === 'genesis' && '✧ Genesis'}
          {stage === 'awakening' && '✧ Awakening'}
          {stage === 'radiant' && '✦ Radiant'}
          {stage === 'cosmic' && '✦ Cosmic'}
        </div>

        {/*  <div style={{
          color: "#ffffff",
          fontFamily: "Rajdhani, sans-serif",
          fontSize: "0.8rem",
          marginTop: "4px",
          opacity: 0.5,
          textAlign: "center"
        }}>
          {systemLight.toLocaleString()} Light
        </div> */}
     
      </Html>
    </group>
  );
};

export default LightCore;