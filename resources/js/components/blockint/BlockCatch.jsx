import React, { useContext, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { RootStoreContext } from "@/stores/RootStore";


const BlockCatch = observer(() => {

   // local states
     const [currentBlock, setCurrentBlock] = useState(0);
 
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
       cubes.push({
         size: 100,
         x: Math.random() * w,
         y: Math.random() * h,
         z: Math.random() * 100 - 50,
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
         color: `rgb(${Math.random() * 50 + 50}, 0, ${Math.random() * 100 + 150})`,
         originalColor: `rgb(${Math.random() * 50 + 50}, 0, ${Math.random() * 100 + 150})`, // Za resetovanje boje
         isHovered: false, // Praćenje stanja kada je miš iznad
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
 
     // Detektuj da li se miš nalazi iznad kocke
     function isMouseOverCube(cube) {
         const half = cube.size / 2;
         const mouseX = mousePosition.x;
         const mouseY = mousePosition.y;
 
         return (
             mouseX >= cube.x - half &&
             mouseX <= cube.x + half &&
             mouseY >= cube.y - half &&
             mouseY <= cube.y + half
         );
     }
 
     
 
     // Rotacija i render kocke
     function drawCube(cube) {
       cube.rotationX += cube.rotationSpeedX;
       cube.rotationY += cube.rotationSpeedY;
       cube.rotationZ += cube.rotationSpeedZ;
     
   
       const vertices = [];
       const half = cube.size / 2;
   
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
           
          /*  if (face.length === 4) {
             ctx.font = "12px Arial";
             ctx.fillStyle = "white";
             ctx.textAlign = "center";
             ctx.fillText(cube.crypto, cube.x, cube.y + 10);
         } */
 
             // apply 3D perspective for the text on the face (same as the cubes rotation and everything) - face 4
             if (face.length === 4) {
               const faceCenter = {
                 x: (vertices[face[0]].x + vertices[face[1]].x + vertices[face[2]].x + vertices[face[3]].x) / 4,
                 y: (vertices[face[0]].y + vertices[face[1]].y + vertices[face[2]].y + vertices[face[3]].y) / 4,
                 z: (vertices[face[0]].z + vertices[face[1]].z + vertices[face[2]].z + vertices[face[3]].z) / 4,
               };
             }
           
           const projected = face.map((i) => vertices[i]);
           ctx.moveTo(projected[0].x, projected[0].y);
           projected.forEach((p) => ctx.lineTo(p.x, p.y));
           ctx.closePath();
   
           // Preciznije crtanje
           ctx.lineJoin = "round";
           ctx.lineCap = "round";
   
           if (cube.isHovered) {
               ctx.strokeStyle = "lightblue";
               ctx.lineWidth = 2;
               ctx.shadowColor = "rgba(35, 108, 133, 0.5)";
               ctx.shadowBlur = 20;
           } else {
               ctx.strokeStyle = "transparent";
               ctx.lineWidth = 0;
               ctx.shadowBlur = 0; 
           }
 
           // write crypto name on cube (random from cryptos array)
        
 
          
   
           // Crtanje unutrašnjosti
           ctx.fillStyle = cube.isHovered ? "rgba(0, 119, 255, 0.5)" : cube.color;
           ctx.fill();
   
           // Crtanje ivica
           ctx.stroke();
       });
   }
 
     // Animacija
     let animationFrameId;
    
     function animate() {
         ctx.clearRect(0, 0, w, h);
 
         cubes.forEach((cube) => {
             cube.isHovered = isMouseOverCube(cube); // Proveri da li je miš iznad kocke
 
             if (!cube.isHovered) {
                 cube.x += cube.dx;
                 cube.y += cube.dy;
                 cube.z += cube.dz;
 
                
                 if (cube.x - cube.size / 2 < 0 || cube.x + cube.size / 2 > w) cube.dx *= -1;
                 if (cube.y - cube.size / 2 < 0 || cube.y + cube.size / 2 > h) cube.dy *= -1;
             }
 
             drawCube(cube);
             
         });
 
      
 
         animationFrameId = requestAnimationFrame(animate);
     }
 
     // Ažuriranje pozicije miša
     canvas.addEventListener("mousemove", (e) => {
         const rect = canvas.getBoundingClientRect();
         mousePosition = {
             x: e.clientX - rect.left,
             y: e.clientY - rect.top,
         };
     });
 
   
 
     // Resetuj poziciju miša kada izađe sa canvas-a
     canvas.addEventListener("mouseout", () => {
         mousePosition = { x: -1, y: -1 }; // Postavi koordinate izvan canvas-a
     });
 
     // DODATI ANIMACIJU DA KOCKA SA SVOG POLOŽAJA SE SMANJUJE I DA SE DODAJE U TAJ TRENUTNI BROJ U DONJEM DESNOM KUTU, TJ. IDE PREMA TAMO KAO NEKA FORA ANIMACIJA
 
     // brisanje kocke
     canvas.addEventListener("click", (e) => {
 
         // Pozicija miša
        
         const rect = canvas.getBoundingClientRect();
         const mouseX = ((e.clientX - rect.left) / rect.width) * canvas.width;
         const mouseY = ((e.clientY - rect.top) / rect.height) * canvas.height;
     
 
 
 
       
         const clickedCube = cubes.find((cube) => {
             return (
                 mouseX > cube.x - cube.size / 2 &&
                 mouseX < cube.x + cube.size / 2 &&
                 mouseY > cube.y - cube.size / 2 &&
                 mouseY < cube.y + cube.size / 2
             );
         });
     
         if (clickedCube > 1 ? clickedCube == 1 : clickedCube) {
             // Automatski pozovi setCurrentBlock čim se klikne
             setCurrentBlock((prevBlock) => prevBlock + 1);
     
             // Ciljane koordinate i veličina
             const targetX = w - 32; // Desno, 1rem od ruba
             const targetY = h - 32; // Dolje, 1rem od ruba
             const targetSize = 0;   // Konačna veličina kvadrata
     
             const animationSpeed = 0.08; // Brzina animacije
             clickedCube.isAnimating = true;
     
             function animateCube() {
                 if (!clickedCube.isAnimating) return;
     
                 // Linearna interpolacija za X, Y i veličinu
                   // Interpolacija prema tački miša
             clickedCube.x += (targetX - clickedCube.x) * animationSpeed;
             clickedCube.y += (targetY - clickedCube.y) * animationSpeed;
 
             // Interpolacija prema ciljnoj veličini
             clickedCube.size += (targetSize - clickedCube.size) * animationSpeed;
 
 
     
                 // Provjeri je li kvadrat dovoljno blizu cilja
                 const isCloseToMouse =
                 Math.abs(clickedCube.x - targetX) < 1 &&
                 Math.abs(clickedCube.y - targetY) < 1;
 
             if (isCloseToMouse) {
                 clickedCube.size = targetSize;
                 clickedCube.isAnimating = false;
                 
               
                 const index = cubes.indexOf(clickedCube);
                 if (index !== -1) {
                 cubes.splice(index, 1);
                 }
 
 
             } else {
                 requestAnimationFrame(animateCube);
             }
             }
     
             // Pokreni animaciju
             animateCube();
         } 
     });
 
     animate();
 
     // Cleanup na unmount
     return () => {
         cancelAnimationFrame(animationFrameId);
         canvas.removeEventListener("mousemove", () => {});
         canvas.removeEventListener("mouseout", () => {});
     };
 }, []);

  return (
    <div className="blocks blocks--layout--animated">
       <canvas className="canvas--blocks" id="blocks__animated"></canvas>
     
      <div className="footer footer--hidden">
                <h2 className="footer__subtitle footer__subtitle--bottom">{currentBlock}</h2>
            </div>
    </div>
  );
});

export default BlockCatch;