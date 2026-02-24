// resources/js/components/visuals/galaxies/SpiralGalaxy.jsx
import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';

const SpiralGalaxy = ({ 
  position, 
  color = "#00ffff", 
  label = "Galaxy",
  description = "",
  size = 20,
  isCentered = false,
  onClick,
  onDoubleClick,
  onPointerOver,
  onPointerOut
}) => {
  const galaxyGroupRef = useRef();
  const particlesRef = useRef();
  const coreRef = useRef();
  
  const [isHovered, setIsHovered] = useState(false);
  const [hoverProgress, setHoverProgress] = useState(0);
  const [pulseIntensity, setPulseIntensity] = useState(1);
  
  // Generate spiral galaxy particles
  const { positions, colors, sizes } = useMemo(() => {
    const particleCount = 5000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    const colorObj = new THREE.Color(color);
    const coreColor = new THREE.Color("#ffffff");
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      const radius = Math.random() * size;
      const spinAngle = radius * 1.5;
      const branchAngle = ((i % 5) / 5) * Math.PI * 2;
      
      const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.8;
      const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.2;
      const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.8;
      
      positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
      positions[i3 + 1] = randomY * 0.3;
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;
      
      const mixedColor = coreColor.clone();
      mixedColor.lerp(colorObj, radius / size);
      
      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;
      
      sizes[i] = Math.random() * 6 * (1 - radius / size) + 0.5;
    }
    
    return { positions, colors, sizes };
  }, [color, size]);
  
  // Animation loop
  useFrame((state) => {
    if (galaxyGroupRef.current) {
      galaxyGroupRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      
      const targetProgress = isHovered ? 1 : 0;
      setHoverProgress(prev => THREE.MathUtils.lerp(prev, targetProgress, 0.1));
      
      const targetScale = 1 + hoverProgress * 0.15;
      galaxyGroupRef.current.scale.setScalar(
        THREE.MathUtils.lerp(galaxyGroupRef.current.scale.x, targetScale, 0.1)
      );
    }
    
    if (coreRef.current && isHovered) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.3;
      setPulseIntensity(pulse);
    } else if (coreRef.current) {
      setPulseIntensity(THREE.MathUtils.lerp(pulseIntensity, 1, 0.1));
    }
  });
  
  const handlePointerOver = (e) => {
    e.stopPropagation();
    setIsHovered(true);
    document.body.style.cursor = "pointer";
    onPointerOver?.(e);
  };
  
  const handlePointerOut = (e) => {
    setIsHovered(false);
    document.body.style.cursor = "auto";
    onPointerOut?.(e);
  };
  
  const handleClick = (e) => {
    e.stopPropagation();
    onClick?.(e);
  };
  
  const handleDoubleClick = (e) => {
    e.stopPropagation();
    onDoubleClick?.(e);
  };
  
  return (
    <group position={position}>
      {/* ROTATING GROUP (galaxy visuals) */}
      <group rotation={[Math.PI / 2, 0, 0]} ref={galaxyGroupRef}>
        {/* Spiral particle system */}
        <points ref={particlesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={positions.length / 3}
              array={positions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              count={colors.length / 3}
              array={colors}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-size"
              count={sizes.length}
              array={sizes}
              itemSize={1}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.12}
            sizeAttenuation={true}
            depthWrite={false}
            vertexColors={true}
            blending={THREE.AdditiveBlending}
            transparent={true}
            opacity={0.9 + hoverProgress * 0.1}
          />
        </points>
        
        {/* Sparkles */}
        <Sparkles
          count={300}
          scale={size * 1.5}
          size={3 + hoverProgress * 1.5}
          speed={0.1 + hoverProgress * 0.2}
          opacity={0.4 + hoverProgress * 0.3}
          color={color}
        />
        
        {/* INTERACTIVE CORE */}
        <mesh
          ref={coreRef}
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <sphereGeometry args={[size * 0.08, 32, 32]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive={color}
            emissiveIntensity={1.5 * pulseIntensity}
            transparent
            opacity={0.9 + hoverProgress * 0.1}
          />
        </mesh>
        
        {/* HOVER GLOW RING */}
        {isHovered && (
          <mesh rotation={[0, 0, 0]}>
            <ringGeometry args={[size * 0.12, size * 0.18, 64]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.6 * hoverProgress}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
        
        {/* CENTERED STATE RING */}
        {isCentered && (
          <mesh rotation={[0, 0, 0]}>
            <ringGeometry args={[size * 0.15, size * 0.22, 64]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.8}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
      </group>
    </group>
  );
};

export default SpiralGalaxy;