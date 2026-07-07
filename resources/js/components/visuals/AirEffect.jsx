// AirEffect.jsx
import React, { useEffect, useRef } from "react";
import Starfield from "./Starfield";

const AirEffect = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const windParticles = [];
    const colors = [
      "rgba(142, 68, 173, 0.12)",
      "rgba(143, 7, 197, 0.12)",
      "rgba(102, 51, 153, 0.12)",
    ];

    function createParticle() {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 2,
        speedX: Math.random() * 2 + 2,
        speedY: Math.random() * 0.5 - 0.25,
        trailLength: Math.random() * 20 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    }

    for (let i = 0; i < 100; i++) {
      windParticles.push(createParticle());
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      windParticles.forEach((particle) => {
        ctx.beginPath();

        const gradient = ctx.createLinearGradient(
          particle.x,
          particle.y,
          particle.x - particle.trailLength,
          particle.y
        );
        gradient.addColorStop(0, particle.color);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.strokeStyle = gradient;
        ctx.lineWidth = particle.radius;
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(particle.x - particle.trailLength, particle.y);
        ctx.stroke();

        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x > canvas.width) {
          particle.x = 0;
          particle.y = Math.random() * canvas.height;
        }
        if (particle.y > canvas.height || particle.y < 0) {
          particle.y = Math.random() * canvas.height;
        }
      });

      requestAnimationFrame(animate);
    }

    animate();

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="canvas--main"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 13,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
        }}
      />
      <Starfield />
    </>
  );
};

export default AirEffect;
