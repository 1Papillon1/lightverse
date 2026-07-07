// MarketBlocks.jsx
import { useState, useEffect, useContext, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { observer } from "mobx-react-lite";
import { RootStoreContext } from "@/stores/RootStore";
import * as THREE from "three";
import gsap from "gsap";
import { runInAction } from "mobx";
import { MarketBlock } from "./MarketBlock";
import { generateColor } from "./MarketBlock";
import AddIcon from "@/assets/icons/add.svg";



import focusBlockIcon from "@/assets/icons/focus_block.svg";
import removeIcon from "@/assets/icons/remove.svg";


/// Market Blocks Grid View
const MarketBlocks = observer(() => {
  const rootStore = useContext(RootStoreContext);
  const store = rootStore.marketStore;

  const [activeBlock, setActiveBlock] = useState(null);
  const [originalPosition, setOriginalPosition] = useState([0, 0, 0]);
  const [originalRotation, setOriginalRotation] = useState([0, 0, 0]);
  const [isRotating, setIsRotating] = useState(false);
  const [rotationStart, setRotationStart] = useState({ x: 0, y: 0 });
  const controlsRef = useRef();

  const [pageAnimating, setPageAnimating] = useState(false);
  const [displayedMarkets, setDisplayedMarkets] = useState([]);
  const [isTransitioning, setIsTransitioning] = useState(false);


  const [blockScale, setBlockScale] = useState(1);
  const [cameraZ, setCameraZ] = useState(4);

  useEffect(() => {
    store.fetchMarkets();
  }, [store]);

  
  useEffect(() => {
    if (!store.paginatedMarkets.length) {
      setDisplayedMarkets([]);
      return;
    }

    if (displayedMarkets.length > 0) {
      setIsTransitioning(true);
      setPageAnimating("out");

      setTimeout(() => {
        setDisplayedMarkets([]);

        setTimeout(() => {
          setDisplayedMarkets(store.paginatedMarkets);
          setPageAnimating("in");
          setTimeout(() => setIsTransitioning(false), 700);
        }, 200);
      }, 600);
    } else {
      setDisplayedMarkets(store.paginatedMarkets);
      setPageAnimating("in");
    }
  }, [store.paginatedMarkets]);

  // Block click logic (kept same)
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

 

    setActiveBlock(blockRef);
    runInAction(() => store.setSelectedMarket(market));
  };


const handlePointerDown = (e) => {
  if (!activeBlock) return; 
  setIsRotating(true);
  setRotationStart({ x: e.clientX, y: e.clientY });
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


  useEffect(() => {
    const updateScaleAndZoom = () => {
      if (window.innerWidth < 600) {
        setBlockScale(0.8);  
        setCameraZ(3);       
      } else if (window.innerWidth < 1024) {
        setBlockScale(0.9); 
        setCameraZ(3.5);      
      } else {
        setBlockScale(1);  
        setCameraZ(4);      
      }
    };

    updateScaleAndZoom();
    window.addEventListener("resize", updateScaleAndZoom);
    return () => window.removeEventListener("resize", updateScaleAndZoom);
  }, []);


  const mainMarkets = displayedMarkets.filter(
    (m) => !store.comparedMarkets.find((c) => c.id === m.id)
  ); 
  const count = mainMarkets.length;
  const cols = Math.ceil(Math.sqrt(count));
  const spacing = 0.8;

  return (
  <div
    className={`market market--container ${
      store.comparisonMode ? "with-compare" : ""
    }`}
  >

    {store.comparisonMode && (
      <div className="comparison__container">
        <h3 className="comparison__title">Comparison Box</h3>
        <Canvas
          camera={{ position: [0, 0, cameraZ], fov: 50 }}
          className="canvas--compare"
          style={{ background: "transparent" }}
        >
          <OrbitControls enablePan={false} enableZoom={false} enableRotate={false} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[0, 5, 10]} intensity={1.2} />

          {store.comparedMarkets.map((market, idx) => {
            const cols = Math.ceil(Math.sqrt(store.comparedMarkets.length));
            const spacing = 1.2;
            const row = Math.floor(idx / cols);
            const col = idx % cols;
            const x = (col - (cols - 1) / 2) * spacing;
            const y = ((cols - 1) / 2 - row) * spacing;

            const isBase = store.baseMarket?.id === market.id;

            return (
              <group key={market.symbol}>
                <MarketBlock
                  market={market}
                  position={[x, y + (isBase ? 1.0 : 0), 0]} 
                  color={generateColor(idx)}
                  onClick={() => store.removeComparedMarket(market.id)}
                  scale={blockScale}
                  pageAnimating={pageAnimating}
                />

      
                <Html position={[x, (y + blockScale + 0.2) / 2, 0]} center>
                  <div className="compare-actions">
                    <button
                      className="compare-button focus"
                      onClick={(e) => {
                        e.stopPropagation();
                        store.setAsBaseMarket(market);
                      }}
                    >
                      <img src={focusBlockIcon} alt="Focus" />
                    </button>
                    <button
                      className="compare-button remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        store.removeComparedMarket(market.id);
                      }}
                    >
                      <img src={removeIcon} alt="Remove" />
                    </button>
                  </div>
                </Html>
              </group>
            );
          })}
        </Canvas>
      </div>
    )}

   
    {store.loading && mainMarkets.length < 1 && (
      <div className="overlay overlay--loader">
        <div className="overlay__loader">
          <span className="overlay__title">Loading...</span>
        </div>
      </div>
    )}

 
    {!store.loading && mainMarkets.length > 0 && (
      <div className="market__main">
        <Canvas
          camera={{ position: [0, 0, 4], fov: 50 }}
          className="canvas--market"
          style={{ background: "transparent" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <OrbitControls
            ref={controlsRef}
            enableZoom={false}
            enablePan={false}
            enableRotate={false}
          />
          <ambientLight intensity={0.5} />
          <directionalLight position={[0, 5, 10]} intensity={1} />

          {mainMarkets.map((market, idx) => {
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
                delay={(row + col) * 0.05}
                scale={blockScale}
              />
            );
          })}
        </Canvas>
      </div>
    )}

  
    <div className="footer">
       {!store.loading &&
          store.filteredMarkets.length > 0 &&
          !store.selectedMarket && (
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
        <button
          className="button button--secondary button--icon--text"
          onClick={() => {
            if (!store.comparisonMode) store.toggleComparisonMode();
            store.addComparedMarket(store.selectedMarket);
            store.setSelectedMarket(null);
          }}
        >
          <img src={AddIcon} className="button__icon icon" alt="add" />
          <span className="button__text">Compare</span>
        </button>
      )}
    </div>
  </div>
);
});

export default MarketBlocks;
