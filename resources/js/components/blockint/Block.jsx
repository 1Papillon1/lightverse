import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";


const Cube = ({ boundary = 3, gravity = -0.0005 }) => {
    const meshRef = useRef();
  
    // Početna pozicija kocke
    const [position, setPosition] = useState([0, 0, 0]);
  
    // Početna brzina (nasumičan smjer)
    const [velocity, setVelocity] = useState([
      (Math.random() > 0.5 ? 1 : -1) * 0.01, // X
      (Math.random() > 0.5 ? 1 : -1) * 0.01, // Y
      (Math.random() > 0.5 ? 1 : -1) * 0.01, // Z
    ]);
  
    useFrame(() => {
      setPosition((prev) => {
        let newPos = [
          prev[0] + velocity[0], // Pomicanje X
          prev[1] + velocity[1], // Pomicanje Y
          prev[2] + velocity[2], // Pomicanje Z
        ];
  
        let newVelocity = [...velocity];
  
        // Primijeni gravitaciju
        newVelocity[1] += gravity;
  
        // Detekcija sudara s granicama
        if (Math.abs(newPos[0]) > boundary) newVelocity[0] *= -1; // X smjer
        if (Math.abs(newPos[1]) > boundary) newVelocity[1] *= -1; // Y smjer
        if (Math.abs(newPos[2]) > boundary) newVelocity[2] *= -1; // Z smjer
  
        setVelocity(newVelocity);
        return newPos;
      });
  
      // Lagana rotacija kocke
      if (meshRef.current) {
        meshRef.current.rotation.x += 0.01;
        meshRef.current.rotation.y += 0.01;
      }
    });
  
    return (
      <mesh ref={meshRef} position={position}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="purple" />
        <Text position={[0, 0, 0.51]} fontSize={0.2} color="white">
          BTC
        </Text>
      </mesh>
    );
  };

const Block = () => {
  return (
    <Canvas className="canvas--blocks" camera={{ position: [5, 5, 10] }}>
    <ambientLight intensity={0.5} />
    <pointLight position={[10, 10, 10]} />
    <Cube boundary={3} gravity={-0.0005} />
  </Canvas>
  );
};

export default Block;
