import React from 'react';
import { Html, Text } from '@react-three/drei';
import { formatTimeLabel } from '../../utils/dateUtil';

const Candle = ({ x, open, high, low, close, time, timeY, pctChange, interval }) => {
  const wickHeight = high - low;
  const wickCenter = (high + low) / 2;

  const bodyHeight = Math.abs(close - open);
  const bodyCenter = (open + close) / 2;

  const color = close >= open ? "limegreen" : "crimson";
  const pctText = pctChange >= 0 ? `+${pctChange.toFixed(2)}%` : `${pctChange.toFixed(2)}%`;

  const topY = Math.max(high, bodyCenter + bodyHeight / 2) + 0.1;
  const timeText = formatTimeLabel(time, interval);

  return (
    <group position={[x, 0, 0]}>
      {/* wick */}
      <mesh position={[0, wickCenter, 0]}>
        <cylinderGeometry args={[0.02, 0.02, wickHeight, 6]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* body */}
      <mesh position={[0, bodyCenter, 0]}>
        <boxGeometry args={[0.1, bodyHeight, 0.1]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* % label */}
      <Html
        position={[0, topY, 0]}
        style={{
          fontSize: "0.65em",
          color,
          whiteSpace: "nowrap",
          pointerEvents: "none",
        }}
        center
      >
        <div>{pctText}</div>
      </Html>

      {/* time label */}
      <Html
        position={[0, timeY, 0]}
        style={{
          fontSize: "0.80em",
          color: "white",
          whiteSpace: "nowrap",
          pointerEvents: "none",
        }}
        center
      >
        <div>{timeText}</div>

      </Html>
    </group>
  );
};

export default Candle;