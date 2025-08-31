// Starfield.jsx
import React, { useEffect, useRef } from "react";

const Starfield = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars = [];
    const starCount = 150;

    function createStarsFullScreen() {
      for (let i = 0; i < starCount; i++) {
        const bias = Math.random();

        stars.push({
          x: Math.random() * canvas.width,
          y: Math.pow(bias, 0.7) * canvas.height,
          radius: Math.random() * 1.8 + 0.2,
          alpha: Math.random(),
          alphaDirection: Math.random() > 0.5 ? 1 : -1,
        });
      }
    }

    createStarsFullScreen();

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.fill();

        star.alpha += 0.01 * star.alphaDirection;
        if (star.alpha >= 1 || star.alpha <= 0.5) {
          star.alphaDirection *= -1;
        }
      });

      requestAnimationFrame(animate);
    }

    animate();

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      stars.length = 0;
      createStarsFullScreen();
    };

    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="canvas--main"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: -1,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
      }}
    />
  );
};

export default Starfield;
