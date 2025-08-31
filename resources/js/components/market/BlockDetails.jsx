// BlockDetails.jsx
import { useContext, useEffect, useState, useRef, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { observer } from "mobx-react-lite";
import { RootStoreContext } from "@/stores/RootStore";
import { runInAction } from "mobx";
import BlockGraph  from "./BlockGraph";


const BlockDetails = observer(({ symbol }) => {
  const { marketStore: store } = useContext(RootStoreContext);


 const [activeBlock, setActiveBlock] = useState(null);
  const blockRef = useRef();
  const data = store.selectedMarket;
  const cameraRef = useRef();

  const [zoom, setZoom] = useState(1);


  const handleWheel = useCallback(e => {
    e.stopPropagation();
    const delta = -e.deltaY * 0.001;
    setZoom(z => {
      const next = Math.min(Math.max(0.5, z + delta), 3);
      console.log("🔍 zoom →", next.toFixed(2));
      return next;
    });
  }, []);


 
  useEffect(() => {
    async function load() {
      if (store.markets.length === 0) {
        await store.fetchMarkets();
      }
      const m = store.markets.find(
        (c) => c.symbol.toUpperCase() === symbol.toUpperCase()
      );
      runInAction(() => store.setSelectedMarket(m ?? null));
    }
    load();
  }, [symbol, store]);
  

  useEffect(() => {
    if (blockRef.current) {
      setActiveBlock(blockRef.current);
      console.log(activeBlock);
    }
  }, [data]);

  useEffect(() => {
  if (store.selectedMarket) {
    store.loadHistoricalChartData(store.selectedMarket.symbol);
  }
}, [store.selectedMarket, store.priceChangePeriod]);


  if (store.loading || !data) return <div className="loading-spinner">Loading {symbol}…</div>;




  return (
    <div className="flex flex--row">
      
  {/*   <div class="market-single">
      <Canvas
        camera={{ position: [0, 0, 0], fov: 70 }}
        className="canvas--market"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onContextMenu={(e) => e.preventDefault()} // ⬅️ dodano!
      >
        <OrbitControls
          ref={controlsRef}
          enableZoom
          enablePan
          enableRotate={false}
          screenSpacePanning
          minDistance={1}
          maxDistance={9}
          mouseButtons={{
            LEFT: THREE.MOUSE.PAN,
            RIGHT: null,
          }}
        /*   onChange={() => {
                        if (!controlsRef.current) return;
                        const ctrl = controlsRef.current;
                        ctrl.target.x = THREE.MathUtils.clamp(ctrl.target.x, -3, 3);
                        ctrl.target.y = THREE.MathUtils.clamp(ctrl.target.y, -2, 2);
                        ctrl.target.z = 0;
                        const pos = ctrl.object.position;
                        pos.x = THREE.MathUtils.clamp(pos.x, -3, 3);
                        pos.y = THREE.MathUtils.clamp(pos.y, -2, 2);
                        pos.z = Math.max(pos.z, 1);
                        ctrl.object.lookAt(ctrl.target);
                      }} 
        />
        <ambientLight intensity={0.5} />
        <directionalLight position={[0, 5, 10]} intensity={1} />

        <MarketBlock
          ref={(ref) => {
            if (ref) {
              setActiveBlock(ref);
            }
          }}
          market={data}
          position={[0, 0, 0]}
          color={generateColor(0)}
        />
      </Canvas>

      <div className="footer footer--row">

        <div className="footer__container">
        <button
              className="button button--back"
              onClick={() => {
                store.setSelectedMarket(null);
                window.history.back();
              }}
            >
            <img src={ArrowBack} alt="Back" className="footer__icon" />
        </button>
        </div>
      
          <div className="footer__container">
            <button
              className="button button--align"
              onClick={handleAlign}
      
            >
              Align Face
            </button>
          </div>
        
      
      
      </div>
    </div> */}

    <div className="market-container">
      <h2 className="market-title">
        {data.symbol.toUpperCase()} Market
      </h2>
     <Canvas
  camera={{ position: [0, 0, 6], fov: 110 }}
  style={{ width: "100%", height: "80%" }}
  className="canvas--graph"
  onWheel={handleWheel} // dodano
   onCreated={({ camera }) => {
    cameraRef.current = camera;
  }}
>
  <ambientLight intensity={0.3} />
  <directionalLight position={[0, 3, 5]} intensity={0.8} />

  {/* Dodaj OrbitControls za pan-anje */}
  <OrbitControls
    enableZoom={true}      // isključi zoom ako želiš
    enableRotate={false}    // isključi rotaciju
    enablePan={true}        // uključi pan-anje
    panSpeed={1}            // brzina pomicanja mišem
    minDistance={2.8}
    maxDistance={3}
    screenSpacePanning={true}
    // ograniči pan samo horizontalno, spreči vertikalno: 
    // onPan i event handlers bila bi robusnija, ali ovo je OK za osnovu
  />

  <BlockGraph symbol={symbol} zoom={3} />
</Canvas>
    </div> 

    
  </div>
  );
});

export default BlockDetails;
