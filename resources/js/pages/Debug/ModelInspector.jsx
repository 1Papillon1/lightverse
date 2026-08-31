// resources/js/Pages/Debug/ModelInspector.jsx
// Temporary dev tool - NOT part of the actual builder. Delete once you've
// noted down which files are which shape. Route it however you normally
// wire up a page (e.g. add to routes/web.php temporarily, or just import
// and render it directly in place of another page while testing).
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Text, Grid } from '@react-three/drei';

const BASE = '/resources/models/kenney-building-kit/';

// Paste in whichever set you're currently unsure about. Keep it short
// (5-10 at a time) so each one is big enough on screen to actually see.
const FILES_TO_CHECK = [
  'wall-corner.glb',
  'wall-corner-round.glb',
  'wall-corner-diagonal.glb',
  'wall-doorway-square.glb',
  'wall-doorway-round.glb',
];

const SPACING = 3;

function InspectedModel({ file, index }) {
  const { scene } = useGLTF(`${BASE}${file}`);
  const cloned = React.useMemo(() => scene.clone(true), [scene]);
  const col = index % 3;
  const row = Math.floor(index / 3);

  return (
    <group position={[col * SPACING, 0, row * SPACING]}>
      <primitive object={cloned} />
      <Text
        position={[0, -0.6, 0.8]}
        fontSize={0.15}
        color="black"
        anchorX="center"
      >
        {file}
      </Text>
    </group>
  );
}

export default function ModelInspector() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#eee' }}>
      <Canvas camera={{ position: [4, 4, 8], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 10, 5]} intensity={1} />
        <Grid args={[20, 20]} />
        <OrbitControls />
        {FILES_TO_CHECK.map((file, i) => (
          <InspectedModel key={file} file={file} index={i} />
        ))}
      </Canvas>
    </div>
  );
}