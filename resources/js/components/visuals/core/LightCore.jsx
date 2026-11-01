// resources/js/components/visuals/core/LightCore.jsx
import { useRef, useMemo, useEffect, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Html, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

const MODEL_PATH = '/resources/models/light_core.glb';

// Množitelj veličine modela - lako podesivo bez diranja ostatka logike.
const MODEL_SCALE_MULTIPLIER = 3;

// ─────────────────────────────────────────────────────────────
// TUNING - sve što treba mijenjati za izgled svjetla je ovdje.
// ─────────────────────────────────────────────────────────────
// Globalna jačina SVIH efekata (1 = zadano, 0 = ugašeno, 1.5 = jače).
const FX_STRENGTH = 1;
// Ako glow sjedi pre-blizu ili predaleko od površine modela, mijenjaj ovo
// (radijus se računa iz bounding boxa modela, a model ima i dijelove koji
// strše, pa ga je ponekad treba malo smanjiti/povećati).
const RADIUS_FUDGE = 1;
// Koliko sekundi traje jedan val energije koji se širi od jezgre.
const WAVE_PERIOD = 5;

// Efekti po fazi evolucije. Genesis je već vidljivo "živ", svaka sljedeća
// faza dodaje svjetla, zraka, valova i orbita.
const STAGE_FX = {
  genesis:   { color: '#00ffff', accent: '#8fe9ff', halo: 0.55, rays: 0.35, rim: 1.1, waves: 0.35, rings: 1 },
  awakening: { color: '#35f0ff', accent: '#a8f4ff', halo: 0.7,  rays: 0.5,  rim: 1.3, waves: 0.5,  rings: 2 },
  radiant:   { color: '#7ff6ff', accent: '#ffe6a3', halo: 0.85, rays: 0.7,  rim: 1.5, waves: 0.65, rings: 2 },
  cosmic:    { color: '#c8fbff', accent: '#ffd27a', halo: 1.0,  rays: 0.9,  rim: 1.8, waves: 0.8,  rings: 3 },
};

// Orbite s iskrama koje kruže oko jezgre (tilt = nagib orbite).
const ORBITS = [
  { tilt: [1.2, 0, 0.3],   r: 1.7, speed: 0.35,  motes: 3 },
  { tilt: [-0.5, 0, -0.8], r: 2.1, speed: -0.25, motes: 2 },
  { tilt: [0.2, 0, 1.2],   r: 2.5, speed: 0.18,  motes: 2 },
];

// ─────────────────────────────────────────────────────────────
// TEKSTURE - generirane na canvasu (bijele, boju daje materijal),
// pa ne treba nikakav dodatni asset.
// ─────────────────────────────────────────────────────────────
function canvasTexture(size, draw) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  draw(canvas.getContext('2d'), size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Mekani radijalni sjaj - za halo i iskre.
const makeGlowTexture = () =>
  canvasTexture(256, (ctx, s) => {
    const c = s / 2;
    const g = ctx.createRadialGradient(c, c, 0, c, c, c);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.15, 'rgba(255,255,255,0.55)');
    g.addColorStop(0.4, 'rgba(255,255,255,0.15)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
  });

// Zrake svjetlosti - različitih duljina i debljina, blijede prema van.
const makeRaysTexture = (rayCount = 14) =>
  canvasTexture(512, (ctx, s) => {
    const c = s / 2;
    ctx.translate(c, c);
    for (let i = 0; i < rayCount; i++) {
      ctx.save();
      ctx.rotate((i / rayCount) * Math.PI * 2 + (i % 3) * 0.05);
      const len = c * (0.6 + 0.4 * (((i * 7) % 5) / 4));
      const w = 5 + ((i * 3) % 4) * 3;
      const g = ctx.createLinearGradient(0, 0, len, 0);
      g.addColorStop(0, 'rgba(255,255,255,0.9)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, -w);
      ctx.lineTo(len, 0);
      ctx.lineTo(0, w);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    // Maska: zrake blijede prema rubu teksture.
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'destination-in';
    const mask = ctx.createRadialGradient(c, c, 0, c, c, c);
    mask.addColorStop(0, 'rgba(255,255,255,1)');
    mask.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = mask;
    ctx.fillRect(0, 0, s, s);
  });

// Tanki svijetli prsten - širi se kao val energije.
const makeWaveTexture = () =>
  canvasTexture(256, (ctx, s) => {
    const c = s / 2;
    const g = ctx.createRadialGradient(c, c, 0, c, c, c);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(0.78, 'rgba(255,255,255,0)');
    g.addColorStop(0.92, 'rgba(255,255,255,0.9)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
  });

// ─────────────────────────────────────────────────────────────
// RIM GLOW - ljuska malo veća od modela, svijetli samo na rubu
// (Fresnel), pa izgleda kao da jezgra isijava svjetlo. Sredina je
// prozirna, tako da se tekstura modela i dalje vidi netaknuta.
// ─────────────────────────────────────────────────────────────
const RIM_VERTEX = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewDir = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;
const RIM_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uPower;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    float f = pow(1.0 - abs(dot(normalize(vNormal), normalize(vViewDir))), uPower);
    gl_FragColor = vec4(uColor * (0.6 + f), clamp(f * uIntensity, 0.0, 1.0));
  }
`;

// ─────────────────────────────────────────────────────────────
// GLOW - svi efekti svjetla, skalirani prema stvarnoj veličini modela.
// ─────────────────────────────────────────────────────────────
const additive = {
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  toneMapped: false,
};

const LightCoreGlow = ({ radius, center, fx }) => {
  const glowTex = useMemo(makeGlowTexture, []);
  const raysTex = useMemo(makeRaysTexture, []);
  const waveTex = useMemo(makeWaveTexture, []);

  const rimMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: RIM_VERTEX,
        fragmentShader: RIM_FRAGMENT,
        uniforms: {
          uColor: { value: new THREE.Color(fx.color) },
          uIntensity: { value: fx.rim },
          uPower: { value: 2.4 },
        },
        ...additive,
        side: THREE.FrontSide,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    rimMat.uniforms.uColor.value.set(fx.color);
  }, [fx.color, rimMat]);

  useEffect(
    () => () => {
      glowTex.dispose();
      raysTex.dispose();
      waveTex.dispose();
      rimMat.dispose();
    },
    [glowTex, raysTex, waveTex, rimMat]
  );

  const haloRef = useRef();
  const haloOuterRef = useRef();
  const raysARef = useRef();
  const raysBRef = useRef();
  const waveRefs = useRef([]);
  const spinRefs = useRef([]);

  const orbits = ORBITS.slice(0, fx.rings);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const breathe = 0.88 + 0.12 * Math.sin(t * 1.7);
    const k = FX_STRENGTH;

    rimMat.uniforms.uIntensity.value = fx.rim * k * (0.9 + 0.1 * Math.sin(t * 2));

    if (haloRef.current) haloRef.current.material.opacity = fx.halo * 0.9 * breathe * k;
    if (haloOuterRef.current) haloOuterRef.current.material.opacity = fx.halo * 0.35 * breathe * k;

    if (raysARef.current) {
      raysARef.current.material.rotation = t * 0.06;
      raysARef.current.material.opacity = fx.rays * (0.8 + 0.2 * Math.sin(t * 2.3)) * k;
    }
    if (raysBRef.current) {
      raysBRef.current.material.rotation = -t * 0.04 + 0.4;
      raysBRef.current.material.opacity = fx.rays * 0.6 * (0.8 + 0.2 * Math.sin(t * 1.9 + 1)) * k;
    }

    // Dva vala pomaknuta u fazi - uvijek se nešto širi od jezgre.
    waveRefs.current.forEach((sprite, i) => {
      if (!sprite) return;
      const p = (t / WAVE_PERIOD + i * 0.5) % 1;
      const s = radius * (2 + p * 9);
      sprite.scale.set(s, s, 1);
      sprite.material.opacity = Math.pow(1 - p, 2) * fx.waves * k;
    });

    spinRefs.current.forEach((g, i) => {
      if (g) g.rotation.z += delta * orbits[i].speed;
    });
  });

  return (
    <group position={center}>
      {/* Rim glow ljuska */}
      <mesh material={rimMat} renderOrder={2}>
        <sphereGeometry args={[radius * 1.06, 64, 64]} />
      </mesh>

      {/* Halo - uski jaki i široki slabi sjaj */}
      <sprite ref={haloRef} scale={radius * 5} renderOrder={1}>
        <spriteMaterial map={glowTex} color={fx.color} {...additive} />
      </sprite>
      <sprite ref={haloOuterRef} scale={radius * 11} renderOrder={1}>
        <spriteMaterial map={glowTex} color={fx.color} {...additive} />
      </sprite>

      {/* Zrake - dva sloja koja se vrte u suprotnim smjerovima */}
      <sprite ref={raysARef} scale={radius * 9} renderOrder={1}>
        <spriteMaterial map={raysTex} color={fx.color} {...additive} />
      </sprite>
      <sprite ref={raysBRef} scale={radius * 7} renderOrder={1}>
        <spriteMaterial map={raysTex} color={fx.accent} {...additive} />
      </sprite>

      {/* Valovi energije */}
      {[0, 1].map((i) => (
        <sprite key={`wave-${i}`} ref={(el) => (waveRefs.current[i] = el)} renderOrder={1}>
          <spriteMaterial map={waveTex} color={fx.accent} {...additive} />
        </sprite>
      ))}

      {/* Orbite s iskrama */}
      {orbits.map((o, i) => (
        <group key={`orbit-${i}`} rotation={o.tilt}>
          <mesh renderOrder={1}>
            <ringGeometry args={[radius * o.r, radius * o.r * 1.008, 192]} />
            <meshBasicMaterial
              color={fx.color}
              opacity={0.3 * FX_STRENGTH}
              side={THREE.DoubleSide}
              {...additive}
            />
          </mesh>
          <group ref={(el) => (spinRefs.current[i] = el)}>
            {Array.from({ length: o.motes }, (_, m) => {
              const a = (m / o.motes) * Math.PI * 2;
              return (
                <sprite
                  key={m}
                  position={[Math.cos(a) * radius * o.r, Math.sin(a) * radius * o.r, 0]}
                  scale={radius * 0.35}
                  renderOrder={1}
                >
                  <spriteMaterial map={glowTex} color={fx.accent} {...additive} />
                </sprite>
              );
            })}
          </group>
        </group>
      ))}
    </group>
  );
};

// ─────────────────────────────────────────────────────────────
// MODEL - odvojen jer useGLTF suspenda; mora biti unutar <Suspense>.
// Glow je ovdje jer mu treba izmjerena veličina modela.
// ─────────────────────────────────────────────────────────────
const LightCoreModel = ({ coreRef, coreSize, fx }) => {
  const { scene } = useGLTF(MODEL_PATH);

  // Kloniraj scenu (useGLTF cache-a original) - originalni materijal/
  // teksture iz .glb fajla se NE diraju, koriste se kako jesu.
  const { clonedScene, rawRadius, rawCenter } = useMemo(() => {
    const clone = scene.clone(true);
    clone.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    return {
      clonedScene: clone,
      rawRadius: Math.max(size.x, size.y, size.z) / 2,
      rawCenter: box.getCenter(new THREE.Vector3()),
    };
  }, [scene]);

  const scale = coreSize * MODEL_SCALE_MULTIPLIER;

  return (
    <>
      <primitive ref={coreRef} object={clonedScene} scale={scale} />
      <LightCoreGlow
        radius={rawRadius * scale * RADIUS_FUDGE}
        center={rawCenter.clone().multiplyScalar(scale)}
        fx={fx}
      />
    </>
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

  // ✅ Determine evolution stage (koristi se za label, sparkles i efekte)
  const getStage = () => {
    if (systemLight < 1000) return 'genesis';
    if (systemLight < 10000) return 'awakening';
    if (systemLight < 50000) return 'radiant';
    return 'cosmic';
  };

  const stage = getStage();
  const fx = STAGE_FX[stage];

  // ✅ Pulse animacija na modelu
  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (coreRef.current) {
      const pulse = Math.sin(time * 2) * 0.008;
      const base = coreSize * MODEL_SCALE_MULTIPLIER;
      coreRef.current.scale.setScalar(base * (1 + pulse));
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* ========================================
          CENTRAL CORE - .glb model, originalna tekstura + svjetlosni efekti
          ======================================== */}
      <Suspense fallback={null}>
        <LightCoreModel coreRef={coreRef} coreSize={coreSize} fx={fx} />
      </Suspense>

      {/* ========================================
          SPARKLES
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