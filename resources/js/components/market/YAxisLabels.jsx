import React from 'react';
import { Html } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';

const YAxisLabels = ({ yStarting, minPrice, maxPrice, yScale, graphCenter }) => {
  const steps = 5;
  const range = maxPrice - minPrice;
  const step = range / steps;

    const decimalPlaces = range < 0.01
    ? 6
    : range < 0.1
    ? 4
    : range < 1
    ? 3
    : 2;

  return (
    <group>
      {Array.from({ length: steps + 1 }).map((_, i) => {
        const price = minPrice + step * i;
        const y = (price - graphCenter) * yScale;

        return (
          <group key={i}>
            <lineSegments>
              <bufferGeometry attach="geometry">
                <bufferAttribute
                  attach="attributes-position"
                  count={2}
                  array={new Float32Array([yStarting, y, 0, 8, y, 0])}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial attach="material" color="gray" transparent opacity={0.3} />
            </lineSegments>

            <Html position={[yStarting, y, 0]}>
               <div style={{
                  color: "#bbb",
                  fontSize: "11px",
                  background: "rgba(0,0,0,0.3)",
                  padding: "2px 4px",
                  borderRadius: "4px",
                  whiteSpace: "nowrap"
                }}>
                   {price.toFixed(decimalPlaces)}
                </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};


export default YAxisLabels;