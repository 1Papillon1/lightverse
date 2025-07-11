import React, { useContext } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { RootStoreContext } from "@/stores/RootStore";
import { observer } from "mobx-react-lite";
import Candle from "./Candle";
import e from "cors";
import YAxisLabels from "./YAxisLabels";

const MAX_CANDLES = 50;
const BASE_X_STEP = 0.15;
const GRAPH_HEIGHT = 4;
const HALF_HEIGHT = GRAPH_HEIGHT / 2;



const BlockGraph = observer(({ zoom = 1 }) => {
  const { marketStore } = useContext(RootStoreContext);
  const raw = marketStore.chartData;
  if (!raw.length) return null;

  const data = raw.slice(-MAX_CANDLES);

  // izračun min, max, raspon i centar
  const prices = data.flatMap(d => [d.high, d.low]);
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const priceRange = maxPrice - minPrice || 1;
  const graphCenter = (maxPrice + minPrice) / 2;

  const xStep = BASE_X_STEP * zoom;
  const yScale = GRAPH_HEIGHT / priceRange;
  const graphWidth = (data.length - 1) * xStep;
  const xOffset = -graphWidth / 2;

  const referenceClose = data[0]?.close || 1;

  return (
    <group position={[0, 0, 0]}>
      <YAxisLabels
         yStarting={-graphWidth / 2 - 1}
        minPrice={minPrice}
        maxPrice={maxPrice}
        yScale={yScale}
        graphCenter={graphCenter}
        
      />

      <LineGraph
        data={data}
        xOffset={xOffset}
        xStep={xStep}
        yScale={yScale}
        graphCenter={graphCenter}
      />

      {data.map((candle, idx) => {
  const x = xOffset + idx * xStep;
  const pctChange = ((candle.close - referenceClose) / referenceClose) * 100;

  return (
    <Candle
      key={candle.time}
      x={x}
      open={(candle.open - graphCenter) * yScale}
      close={(candle.close - graphCenter) * yScale}
      high={(candle.high - graphCenter) * yScale}
      low={(candle.low - graphCenter) * yScale}
      time={candle.time}
      timeY={HALF_HEIGHT - 5}
      pctChange={pctChange} // novo
        interval={marketStore.pricePeriods[marketStore.priceChangePeriod].interval}
    />
  );
})}
    </group>
  );
});

const LineGraph = ({ data, xOffset, xStep, yScale, graphCenter }) => {
  const points = data.map((d, i) => {
    const x = xOffset + i * xStep;
    const y = (d.close - graphCenter) * yScale;
    return new THREE.Vector3(x, y, 0);
  });

  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <line>
      <primitive object={geometry} attach="geometry" />
      <lineBasicMaterial
        attach="material"
        color="white"
        transparent
        opacity={0.6}
      />
    </line>
  );
};

export default BlockGraph;