import React, { useContext, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { RootStoreContext } from "@/stores/RootStore";


const BlocksLayout = observer(() => {

   // local states
    
 
     const rootStore = useContext(RootStoreContext);
     const { cryptoStore } = rootStore;
 
 
      useEffect(() => {
     const canvas = document.getElementById("blocks__animated");
     const ctx = canvas.getContext("2d");
     canvas.width = window.innerWidth;
     canvas.height = window.innerHeight;
     canvas.style.width = `${canvas.width}px`;
     canvas.style.height = `${canvas.height}px`;
 
     const w = canvas.width;
     const h = canvas.height;
 
     const cryptos = ["BTC", "ETH", "SOL", "BCH", "DOGE", "LTC", "XRP"];
     const numCubes = 36; // Broj kocki
     const cubes = [];
     let mousePosition = { x: 0, y: 0 };
 
     // Generiraj niz kocki s nasumičnim svojstvima
     for (let i = 0; i < numCubes; i++) {
      const size = Math.random() * 50 + 30; // Nasumična veličina između 30 i 80
      cubes.push({
        size: size,
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() * 300 - 150, // Veći raspon za osjećaj dubine
        dx: (Math.random() - 0.5) * 0.5,
        dy: (Math.random() - 0.5) * 0.5,
        dz: (Math.random() - 0.5) * 0.5,
        rotationX: Math.random() * 360,
        rotationY: Math.random() * 360,
        rotationZ: Math.random() * 360,
        rotationSpeedX: Math.random() * 0.5,
        rotationSpeedY: Math.random() * 0.5,
        rotationSpeedZ: Math.random() * 0.5,
        crypto: cryptos[Math.floor(Math.random() * cryptos.length)],
        color: `rgb(${Math.random() * 50 + 50}, 0, ${Math.random() * 100 + 150})`, // Random boja
      });
    }
 
     function rotate3D(point, angleX, angleY, angleZ) {
     const radX = (angleX * Math.PI) / 180;
     const radY = (angleY * Math.PI) / 180;
     const radZ = (angleZ * Math.PI) / 180;
 
     // Rotacija oko X ose
     let cosa = Math.cos(radX),
         sina = Math.sin(radX);
     let y = point.y * cosa - point.z * sina;
     let z = point.y * sina + point.z * cosa;
 
     // Rotacija oko Y ose
     let cosb = Math.cos(radY),
         sinb = Math.sin(radY);
     let x = point.x * cosb + z * sinb;
     z = -point.x * sinb + z * cosb;
 
     // Rotacija oko Z ose
     let cosc = Math.cos(radZ),
         sinc = Math.sin(radZ);
     let nx = x * cosc - y * sinc;
     let ny = x * sinc + y * cosc;
 
     return { x: nx, y: ny, z: z };
 }
 
 
     
 
     // Rotacija i render kocke
     function drawCube(cube) {
      cube.rotationX += cube.rotationSpeedX;
      cube.rotationY += cube.rotationSpeedY;
      cube.rotationZ += cube.rotationSpeedZ;
    
      const vertices = [];
      const adjustedSize = cube.size * (1 - cube.z / 500); // Skaliranje veličine ovisno o udaljenosti
      const half = adjustedSize / 2;
    
      const points = [
        { x: -half, y: -half, z: -half },
        { x: half, y: -half, z: -half },
        { x: half, y: half, z: -half },
        { x: -half, y: half, z: -half },
        { x: -half, y: -half, z: half },
        { x: half, y: -half, z: half },
        { x: half, y: half, z: half },
        { x: -half, y: half, z: half },
      ];
    
      for (let i = 0; i < points.length; i++) {
        const rotated = rotate3D(points[i], cube.rotationX, cube.rotationY, cube.rotationZ);
        const perspective = w / (w + rotated.z + 500);
        vertices.push({
          x: rotated.x * perspective + cube.x,
          y: rotated.y * perspective + cube.y,
          z: rotated.z,
        });
      }
    
      const faces = [
        [0, 1, 2, 3], // Front
        [4, 5, 6, 7], // Back
        [0, 1, 5, 4], // Top
        [3, 2, 6, 7], // Bottom
        [0, 3, 7, 4], // Left
        [1, 2, 6, 5], // Right
      ];
    
      faces.forEach((face) => {
        ctx.beginPath();
        const projected = face.map((i) => vertices[i]);
        ctx.moveTo(projected[0].x, projected[0].y);
        projected.forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.closePath();
    
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
    
       
          ctx.strokeStyle = "transparent";
          ctx.lineWidth = 0;
          ctx.shadowBlur = 0;
        
    
          
        ctx.fillStyle = cube.color;
        ctx.fill();
        ctx.stroke();


      });
    
      // Update kocke pozicije (za animaciju)
      cube.x += cube.dx;
      cube.y += cube.dy;
      cube.z += cube.dz;
    
      // Ograniči kretanje unutar platna
      if (cube.x < 0 || cube.x > w) cube.dx *= -1;
      if (cube.y < 0 || cube.y > h) cube.dy *= -1;
      if (cube.z < -250 || cube.z > 250) cube.dz *= -1;
    }
 
     // Animacija
     let animationFrameId;
    
     function animate() {
         ctx.clearRect(0, 0, w, h);
 
         cubes.forEach((cube) => {
           
                 cube.x += cube.dx;
                 cube.y += cube.dy;
                 cube.z += cube.dz;
 
                
                 if (cube.x - cube.size / 2 < 0 || cube.x + cube.size / 2 > w) cube.dx *= -1;
                 if (cube.y - cube.size / 2 < 0 || cube.y + cube.size / 2 > h) cube.dy *= -1;
             
 
             drawCube(cube);
             
         });
 
      
 
         animationFrameId = requestAnimationFrame(animate);
     }

     animate();


 }, []); 



  return (
    <div className="blocks blocks--layout--animated">
      <canvas className="canvas--blocks" id="blocks__animated"></canvas>
     
    </div>
  );
});

export default BlocksLayout;