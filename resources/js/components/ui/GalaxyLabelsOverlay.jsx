// resources/js/components/ui/GalaxyLabelsOverlay.jsx
import { useEffect, useState, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import * as THREE from 'three';

const GalaxyLabelsOverlay = observer(({ 
  galaxies, 
  camera, 
  centeredGalaxyId, 
  hoveredGalaxyId 
}) => {
  const [labelPositions, setLabelPositions] = useState({});
  const frameRef = useRef();

  useEffect(() => {
    if (!camera) return;

    const updatePositions = () => {
      const newPositions = {};

      galaxies.forEach((galaxy) => {
        const vector = new THREE.Vector3(...galaxy.position);
        vector.project(camera);

        const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
        const y = (vector.y * -0.5 + 0.5) * window.innerHeight;

        // Check if behind camera
        const isBehind = vector.z > 1;

        newPositions[galaxy.id] = {
          x,
          y: y - 80, // ✅ Reduced offset (was 120)
          visible: !isBehind,
        };
      });

      setLabelPositions(newPositions);
      frameRef.current = requestAnimationFrame(updatePositions);
    };

    updatePositions();

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [galaxies, camera]);

  return (
    <div className="galaxy-labels-overlay">
      {galaxies.map((galaxy) => {
        const pos = labelPositions[galaxy.id];
        if (!pos || !pos.visible) return null;

        const isCentered = centeredGalaxyId === galaxy.id;
        const isHovered = hoveredGalaxyId === galaxy.id;

        // ✅ ONLY SHOW if hovered OR centered
        const shouldShow = isHovered || isCentered;

        return (
          <div
            key={galaxy.id}
            className={`galaxy-label ${isCentered ? 'galaxy-label--centered' : ''} ${isHovered ? 'galaxy-label--hovered' : ''} ${shouldShow ? 'galaxy-label--visible' : ''}`}
            style={{
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              '--label-color': galaxy.color,
            }}
          >
            <div className="galaxy-label__name">
              {galaxy.label}
            </div>

            {galaxy.description && (
              <div className="galaxy-label__description">
                {galaxy.description}
              </div>
            )}

            {isCentered && !isHovered && (
              <div className="galaxy-label__hint">
                <span className="galaxy-label__hint-icon">→</span>
                Click again to enter
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});

export default GalaxyLabelsOverlay;