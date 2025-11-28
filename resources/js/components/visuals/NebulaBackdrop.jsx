// NebulaBackdrop.jsx
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

export default function NebulaBackdrop({ rotate = false }) {
  const groupRef = useRef();

  // 🌀 Optional slow rotation
  useFrame(() => {
    if (rotate && groupRef.current) {
      groupRef.current.rotation.y += 0.0008 / 12;
    }
  });

  const material = useMemo(() => {
    const size = 4048;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");

    const gradient = ctx.createRadialGradient(
      size / 2.2, size / 2.2, 0,
      size / 2.2, size / 2.2, size / 2.2
    );

    gradient.addColorStop(0.0,  "#0a001a");  
    gradient.addColorStop(0.15, "#0d0022");  
    gradient.addColorStop(0.3,  "#11092d");   
    gradient.addColorStop(0.42, "#160a35");  
    gradient.addColorStop(0.55, "#1a0948");     
    gradient.addColorStop(0.68, "#1f0a4f");     
    gradient.addColorStop(0.82, "#140732");    
    gradient.addColorStop(1.0,  "#000010");     

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const imageData = ctx.getImageData(0, 0, size, size);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const noise = Math.random() * 0.5 - 2;
      imageData.data[i] += noise;
      imageData.data[i + 1] += noise;
      imageData.data[i + 2] += noise;
    }
    ctx.putImageData(imageData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.encoding = THREE.sRGBEncoding;
    texture.needsUpdate = true;

    return new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.BackSide,
      transparent: false,
      depthWrite: false
    });
  }, []);

  return (
    <group ref={groupRef}>
      <mesh scale={[1.5, 1.5, 1.5]}>
        <sphereGeometry args={[290, 122, 122]} />
        <primitive object={material} />
      </mesh>
    </group>
  );
}