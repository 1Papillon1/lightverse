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
import AddIcon from "@/assets/icons/add.svg";

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

  const [pageAnimating, setPageAnimating] = useState(false);
  const [displayedMarkets, setDisplayedMarkets] = useState([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    store.fetchMarkets();
  }, [store]);

  // Handle page change smoothly
  useEffect(() => {
  if (!store.paginatedMarkets.length) {
    setDisplayedMarkets([]);
    return;
  }

  if (displayedMarkets.length > 0) {
    // Animate out
    setIsTransitioning(true);
    setPageAnimating("out");

    setTimeout(() => {
      setDisplayedMarkets([]);

      setTimeout(() => {
        setDisplayedMarkets(store.paginatedMarkets);
        setPageAnimating("in");
        setTimeout(() => setIsTransitioning(false), 700); // after animation finishes
      }, 200);
    }, 600);
  } else {
    setDisplayedMarkets(store.paginatedMarkets);
    setPageAnimating("in");
  }
}, [store.paginatedMarkets]);

  const handleBlockClick = (blockRef, position, market) => {
    if (!blockRef) return;

    const camera = controlsRef.current?.object;
    if (!camera) return;

    if (activeBlock === blockRef) {
      gsap.to(blockRef.position, {
        x: originalPosition[0],
        y: originalPosition[1],
        z: originalPosition[2],
        duration: 0.5,
        ease: "power2.out",
      });
      gsap.to(blockRef.rotation, {
        x: originalRotation[0],
        y: originalRotation[1],
        z: originalRotation[2],
        duration: 0.5,
        ease: "power2.out",
      });
      setActiveBlock(null);
      runInAction(() => store.setSelectedMarket(null));
      rootStore.uiStore.setNavigationState("main");
      return;
    }

    if (activeBlock) {
      gsap.to(activeBlock.position, {
        x: originalPosition[0],
        y: originalPosition[1],
        z: originalPosition[2],
        duration: 0.5,
        ease: "power2.out",
      });
      gsap.to(activeBlock.rotation, {
        x: originalRotation[0],
        y: originalRotation[1],
        z: originalRotation[2],
        duration: 0.5,
        ease: "power2.out",
      });
    }

    rootStore.uiStore.setNavigationState("blockPreview");

    setOriginalPosition([...position]);
    setOriginalRotation([
      blockRef.rotation.x,
      blockRef.rotation.y,
      blockRef.rotation.z,
    ]);

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
      ease: "power2.out",
    });

    gsap.to(blockRef.quaternion, {
      x: targetQuaternion.x,
      y: targetQuaternion.y,
      z: targetQuaternion.z,
      w: targetQuaternion.w,
      duration: 0.5,
      ease: "power2.out",
    });

    setActiveBlock(blockRef);
    runInAction(() => store.setSelectedMarket(market));
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

  const count = displayedMarkets.length;
  const cols = Math.ceil(Math.sqrt(count));
  const spacing = 0.8;

  return (
    <div className="market market--container">
      {store.loading && <div className="loading-spinner">Loading...</div>}

      {!store.loading && store.filteredMarkets.length === 0 && !isTransitioning && (
        <div className="no-results">No results found.</div>
      )}

      {!store.loading && displayedMarkets.length > 0 && (
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
            enablePan={false}             // 🚫 prevent dragging
            enableRotate={!activeBlock}
            minDistance={2}
            maxDistance={9}
            maxPolarAngle={Math.PI / 2}   // stop below horizon
            minPolarAngle={0}             // stop flipping upside down
            maxAzimuthAngle={Math.PI / 3} // horizontal limit
            minAzimuthAngle={-Math.PI / 3}
            mouseButtons={{ LEFT: THREE.MOUSE.PAN, RIGHT: THREE.MOUSE.ROTATE }}
          />
          <ambientLight intensity={0.5} />
          <directionalLight position={[0, 5, 10]} intensity={1} />

          {displayedMarkets.map((market, idx) => {
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
                pageAnimating={pageAnimating}
                delay={(row + col) * 0.05} // ripple effect
              />
            );
          })}

          {explodedFragments}
        </Canvas>
      )}

      <div className="footer">
        {!store.loading && store.filteredMarkets.length > 0 && (
          <div className="pagination">
            <button
              onClick={() => store.prevPage()}
              disabled={store.currentPage === 1}
              className="pagination__button pagination__button--left"
            >
              ◀
            </button>
            <span className="pagination__text">
              Page {store.currentPage} / {store.totalPages}
            </span>
            <button
              onClick={() => store.nextPage()}
              disabled={store.currentPage === store.totalPages}
              className="pagination__button pagination__button--right"
            >
              ▶
            </button>
          </div>
        )}

        
        {store.selectedMarket && (
          <button className="button button--secondary button--icon--text">
         
             <img
                src={AddIcon}
                className="button__icon icon"
                alt="add"
                
              />
            <span className="button__text">Compare</span>

            
          </button>
        )}


      </div>
    </div>
  );
});

export default MarketBlocks;
