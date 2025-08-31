// VolumetricFog.jsx
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function VolumetricFog() {
  const meshRef = useRef();


  const shaderMaterial = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: false,
    uniforms: {
      time: { value: 0 },
      fogColor: { value: new THREE.Color(0x552299) },
      intensity: { value: 0.3 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float time;
      uniform vec3 fogColor;
      uniform float intensity;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float smoothNoise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);

        float a = hash(i + vec2(0.0, 0.0));
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));

        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      void main() {
        float n = smoothNoise(vUv * 4.0 + time * 0.05);
        float fade = 1.0 - vUv.y; // vertical fade
        float alpha = smoothstep(0.4, 0.7, n) * intensity * fade;
        gl_FragColor = vec4(fogColor, max(alpha, 0.02));
      }
    `
  }), []);

  useFrame((state) => {
    shaderMaterial.uniforms.time.value = state.clock.getElapsedTime();
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 4]} renderOrder={-1}>
      <planeGeometry args={[10, 10]} />
      <shaderMaterial attach="material" args={[shaderMaterial]} />
    </mesh>
  );
}
