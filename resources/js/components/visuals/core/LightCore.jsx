// resources/js/components/visuals/core/LightCore.jsx
import { useRef, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Html, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

const MODEL_PATH = '/resources/models/light_core.glb';

// Množitelj veličine modela - lako podesivo bez diranja ostatka logike.
// Prethodno 0.5, sad znatno veće da tekstura bude uočljiva u centru scene.
const MODEL_SCALE_MULTIPLIER = 3;

// ─────────────────────────────────────────────────────────────
// MODEL - odvojen jer useGLTF suspenda; mora biti unutar <Suspense>.
// ─────────────────────────────────────────────────────────────
const LightCoreModel = ({ coreRef, coreSize }) => {
  const { scene } = useGLTF(MODEL_PATH);

  // Kloniraj scenu (useGLTF cache-a original) - originalni materijal/
  // teksture iz .glb fajla se NE diraju, koriste se kako jesu.
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  return (
    <primitive
      ref={coreRef}
      object={clonedScene}
      scale={coreSize * MODEL_SCALE_MULTIPLIER}
    />
  );
};

useGLTF.preload(MODEL_PATH);

// ─────────────────────────────────────────────────────────────

const LightCore = ({ systemLight = 0 }) => {
  const coreRef = useRef();

  // ✅ Calculate core size based on System Light
  const baseCoreSize = 5;
  const lightGrowth = Math.min((systemLight / 50000) * 8, 12);
  const coreSize = baseCoreSize + lightGrowth;

  // ✅ Determine evolution stage (i dalje se koristi za label i sparkles)
  const getStage = () => {
    if (systemLight < 1000) return 'genesis';
    if (systemLight < 10000) return 'awakening';
    if (systemLight < 50000) return 'radiant';
    return 'cosmic';
  };

  const stage = getStage();

  // ✅ Pulse animacija na modelu
  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (coreRef.current) {
      const pulse = Math.sin(time * 2) * 0.008; // suptilniji pulse nego prije
      const base = coreSize * MODEL_SCALE_MULTIPLIER;
      coreRef.current.scale.setScalar(base * (1 + pulse));
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* ========================================
          CENTRAL CORE - .glb model, originalna tekstura
          ======================================== */}
      <Suspense fallback={null}>
        <LightCoreModel coreRef={coreRef} coreSize={coreSize} />
      </Suspense>

     

      {/* ========================================
          SPARKLES (ostaju - daju osjećaj prostora oko modela
          bez da prekrivaju samu teksturu kao glow sfere)
          ======================================== */}
      <Sparkles
        count={stage === 'genesis' ? 150 : stage === 'awakening' ? 250 : 400}
        scale={coreSize * MODEL_SCALE_MULTIPLIER * 1.5}
        size={stage === 'cosmic' ? 6 : 4}
        speed={stage === 'cosmic' ? 0.5 : 0.3}
        opacity={0.8}
        color="#00ffff"
      />

      {/* ========================================
          LABEL
          ======================================== */}
      <Html position={[0, coreSize * MODEL_SCALE_MULTIPLIER * 1.3, 0]} center sprite>
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
      </Html>
    </group>
  );
};

export default LightCore;