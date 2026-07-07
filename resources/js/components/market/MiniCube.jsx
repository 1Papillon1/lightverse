// MiniCube.jsx
import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';


/// Mini Cube animated explosion effect
export const MiniCube = ({ position, origin, delay = 0, opacity }) => {
  const ref = useRef();

    useEffect(() => {
    const direction = new THREE.Vector3(
      position[0] - origin[0],
      position[1] - origin[1],
      position[2] - origin[2]
    ).normalize().multiplyScalar(1.2);

    gsap.to(ref.current.position, {
      x: position[0] + direction.x,
      y: position[1] + direction.y,
      z: position[2] + direction.z,
      duration: 3,
      delay,
      ease: 'power3.out'
    });


    // return to origin
 /*   direction.multiplyScalar(-0.4);
    gsap.to(ref.current.position, {
      x: origin[0] - direction.x,
      y: origin[1] - direction.y,
      z: origin[2] - direction.z,
      duration: 1,
      delay: delay + 1,
      ease: 'expo.in'
    }); */

 
  }, []);

  return (
    <mesh ref={ref} position={position} castShadow receiveShadow> 
      <boxGeometry args={[0.1, 0.1, 0.1]}  />
      <meshStandardMaterial color={'orange'} />
    </mesh>
  );
};
