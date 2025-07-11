import React, { useState, useEffect, useContext, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { observer } from "mobx-react-lite";
import { RootStoreContext } from "@/stores/RootStore";
import * as THREE from "three";
import gsap from "gsap";
import { Inertia } from "@inertiajs/inertia";
import { runInAction } from "mobx";
import { MarketBlock } from "./MarketBlock";
import { generateColor } from "./MarketBlock";
import { MiniCube } from "./MiniCube";

const MarketBlocks = observer(() => {
  const rootStore = useContext(RootStoreContext);
  const store = rootStore.marketStore;

  const [activeBlock, setActiveBlock] = useState(null);
  const [originalPosition, setOriginalPosition] = useState([0, 0, 0]);
  const [originalRotation, setOriginalRotation] = useState([0, 0, 0]);
  const [isRotating, setIsRotating] = useState(false);
  const [rotationStart, setRotationStart] = useState({ x: 0, y: 0 });
  const [explodedFragments, setExplodedFragments] = useState([]);
  const controlsRef = useRef();

  useEffect(() => {
    store.fetchMarkets();
  }, [store]);

  const handleBlockClick = (blockRef, position, market) => {
    if (!blockRef) return;

    const camera = controlsRef.current?.object;
    if (!camera) return;

    // Deselect
    if (activeBlock === blockRef) {
      gsap.to(blockRef.position, {
        x: originalPosition[0],
        y: originalPosition[1],
        z: originalPosition[2],
        duration: 0.5,
        ease: "power2.out"
      });
      gsap.to(blockRef.rotation, {
        x: originalRotation[0],
        y: originalRotation[1],
        z: originalRotation[2],
        duration: 0.5,
        ease: "power2.out"
      });
      setActiveBlock(null);
      runInAction(() => store.setSelectedMarket(null));
      rootStore.uiStore.setNavigationState("main");
      return;
    }

    // Reset previous selection
    if (activeBlock) {
      gsap.to(activeBlock.position, {
        x: originalPosition[0],
        y: originalPosition[1],
        z: originalPosition[2],
        duration: 0.5,
        ease: "power2.out"
      });
      gsap.to(activeBlock.rotation, {
        x: originalRotation[0],
        y: originalRotation[1],
        z: originalRotation[2],
        duration: 0.5,
        ease: "power2.out"
      });
    }

    rootStore.uiStore.setNavigationState("blockPreview");

    setOriginalPosition([...position]);
    setOriginalRotation([blockRef.rotation.x, blockRef.rotation.y, blockRef.rotation.z]);

    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    const targetPos = camera.position.clone().add(direction.multiplyScalar(1.2));

    const dummy = new THREE.Object3D();
    dummy.position.copy(targetPos);
    dummy.up.set(0, 1, 0);
    dummy.lookAt(camera.position);
    const targetQuaternion = dummy.quaternion.clone();

    gsap.to(blockRef.position, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: 0.5,
      ease: "power2.out"
    });

    gsap.to(blockRef.quaternion, {
      x: targetQuaternion.x,
      y: targetQuaternion.y,
      z: targetQuaternion.z,
      w: targetQuaternion.w,
      duration: 0.5,
      ease: "power2.out"
    });

    setActiveBlock(blockRef);
    runInAction(() => store.setSelectedMarket(market));
  };

  const miniExplodeActiveBlock = () => {
    if (!activeBlock) return;

    const blockSize = 1;
    const miniSize = 0.15;
    const count = 6;
    const half = (count * miniSize) / 2;
    const origin = activeBlock.position.clone();

    const fragments = [];

    for (let x = 0; x < count; x++) {
      for (let y = 0; y < count; y++) {
        for (let z = 0; z < count; z++) {
          const px = (origin.x - half + x * miniSize);
          const py = (origin.y - half + y * miniSize);
          const pz = origin.z - half + z * miniSize; 

          fragments.push(
            <MiniCube
              key={`${x}-${y}-${z}`}
              position={[px + 0.005, py + 0.01, 4]}
              origin={[origin.x, origin.y, origin.z]}
              delay={Math.random() * 0.3}
            />
          );
        }
      }
    }

    activeBlock.visible = false;
    setExplodedFragments(fragments);

   setTimeout(() => {
      const symbol = store.selectedMarket.symbol.toLowerCase();
      Inertia.visit(`/markets/${symbol}`); 
    
   
    }, 3000);
  };

  useEffect(() => {
    if (rootStore.uiStore.triggerExplosion && activeBlock) {
      miniExplodeActiveBlock();
      rootStore.uiStore.resetExplosion();
    }
  }, [rootStore.uiStore.triggerExplosion]);

  const handleAlign = () => {
    if (!activeBlock) return;
    const { y } = activeBlock.rotation;
    const targetY = Math.round(y / (Math.PI / 2)) * (Math.PI / 2);
    gsap.to(activeBlock.rotation, {
      x: 0,
      y: targetY,
      z: 0,
      duration: 0.5,
      ease: "power2.out"
    });
  };

  const handlePointerDown = (e) => {
    if (activeBlock) {
      setIsRotating(true);
      setRotationStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handlePointerMove = (e) => {
    if (!isRotating || !activeBlock) return;
    const dx = e.clientX - rotationStart.x;
    const dy = e.clientY - rotationStart.y;
    activeBlock.rotation.y += dx * 0.005;
    activeBlock.rotation.x += dy * 0.005;
    setRotationStart({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = () => setIsRotating(false);

  const paginated = store.paginatedMarkets;
  const count = paginated.length;
  const cols = Math.ceil(Math.sqrt(count));
  const spacing = 0.5;

  return (
    <div className="market-container">
      {store.loading && <div className="loading-spinner">Loading...</div>}
      {!store.loading && paginated.length === 0 && <div className="no-results">No results found.</div>}

      {!store.loading && paginated.length > 0 && (
        <Canvas
          camera={{ position: [0, 0, 4], fov: 50 }}
          className="canvas--market"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <OrbitControls
            ref={controlsRef}
            enableZoom={!activeBlock}
            enablePan={!activeBlock}
            enableRotate={!activeBlock}
            screenSpacePanning
            minDistance={1}
            maxDistance={9}
            mouseButtons={{ LEFT: THREE.MOUSE.PAN, RIGHT: THREE.MOUSE.ROTATE }}
            onChange={() => {
              const ctrl = controlsRef.current;
              if (!ctrl) return;
              ctrl.target.x = THREE.MathUtils.clamp(ctrl.target.x, -3, 3);
              ctrl.target.y = THREE.MathUtils.clamp(ctrl.target.y, -2, 2);
              ctrl.target.z = 0;
              ctrl.object.position.x = THREE.MathUtils.clamp(ctrl.object.position.x, -3, 3);
              ctrl.object.position.y = THREE.MathUtils.clamp(ctrl.object.position.y, -2, 2);
              ctrl.object.position.z = Math.max(ctrl.object.position.z, 1);
              ctrl.object.lookAt(ctrl.target);
            }}
          />

          <ambientLight intensity={0.5} />
          <directionalLight position={[0, 5, 10]} intensity={1} />

          {paginated.map((market, idx) => {
            const row = Math.floor(idx / cols);
            const col = idx % cols;
            const x = (col - (cols - 1) / 2) * spacing;
            const y = ((cols - 1) / 2 - row) * spacing;
            return (
              <MarketBlock
                key={market.symbol}
                market={market}
                position={[x, y, 0]}
                color={generateColor(idx)}
                onClick={handleBlockClick}
              />
            );
          })}

          {explodedFragments}
        </Canvas>
      )}

      <div className="footer">
        {!store.loading && store.filteredMarkets.length > 0 && (
          <div className="pagination">
            <button onClick={() => store.prevPage()} disabled={store.currentPage === 1} className="pagination__button pagination__button--left">◀</button>
            <span className="pagination__text">Page {store.currentPage} / {store.totalPages}</span>
            <button onClick={() => store.nextPage()} disabled={store.currentPage === store.totalPages} className="pagination__button pagination__button--right">▶</button>
          </div>
        )}
      </div>
    </div>
  );
});

export default MarketBlocks;
