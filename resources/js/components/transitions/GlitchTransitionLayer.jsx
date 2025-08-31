// GlitchTransitionLayer.jsx
import { useEffect, useRef } from "react";
import gsap from "gsap";


export default function GlitchTransitionLayer({ active, onComplete }) {
  const layerRefs = useRef([]);

  useEffect(() => {
    if (active) {
      const tl = gsap.timeline({ onComplete });

      // Animate each strip with random delay/skew
      layerRefs.current.forEach((el, i) => {
        const delay = Math.random() * 0.2;
        const direction = Math.random() > 0.5 ? 1 : -1;
        tl.to(
          el,
          {
            duration: 0.5,
            yPercent: direction * 100,
         
            xPercent: direction * 50,
            rotation: direction * 10,
            ease: "power2.inOut",
          },
          delay
        );
      });

      // Fade out entire overlay after strips move
      tl.to(
        "transition transition__glitch--overlay",
        {
          opacity: 0,
          duration: 0.4,
          ease: "power1.out",
        },
        "+=0.3"
      );
    }
  }, [active, onComplete]);

  return (
    <div className="transition transition__glitch--overlay">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="transition__glitch--strip"
          ref={(el) => (layerRefs.current[i] = el)}
        ></div>
      ))}
    </div>
  );
}
