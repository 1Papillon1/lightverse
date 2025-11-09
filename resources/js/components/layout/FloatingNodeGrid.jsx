// FloatingNodeGrid.jsx
import FloatingNode from "@/components/visuals/FloatingNode";
import { useContext } from "react";
import { RootStoreContext } from "@/stores/RootStore";
import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import { Inertia } from "@inertiajs/inertia";
import { systems } from "@/config/systems";

export default function FloatingNodeGrid({
  activeSystem = "galaxy",
  onSelect,
  onNodeHover,
}) {
  const rootStore = useContext(RootStoreContext);
  const universeStore = rootStore.universeStore;


  const textures = {
    wallet: useLoader(TextureLoader, "/textures/wallet_node_4k.jpg"),
    markets: useLoader(TextureLoader, "/textures/market_node_4k.jpg"),
    contracts: useLoader(TextureLoader, "/textures/contract_node_4k.jpg"),
    overview: useLoader(TextureLoader, "/textures/roadmap_node_4k.jpg"),
    ai: useLoader(TextureLoader, "/textures/ai_node_4k.jpg"),
  };

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const radius = isMobile ? 4.3 : 15.5;
  const verticalScale = isMobile ? 0.4 : 2.4;

  const nodeSet = systems[activeSystem] || systems.galaxy;
  const systemTexture = textures[activeSystem] || textures.markets;

  return nodeSet.map((node, i) => {
    const angle = (i / nodeSet.length) * Math.PI * 2;
    const x = Math.cos(angle * 0.93) * radius * 1.45;
    const z = Math.sin(angle * 0.95) * radius;
    const y = Math.sin(i * 1.1) * verticalScale * 0.9;

    return (
      <FloatingNode
        key={node.id}
        type={node.id}
        position={[x * 0.7, y * 3.9, z]}
        texture={systemTexture}
        onClick={() => {
         
          universeStore.setActiveSystem({ id: activeSystem, pos: [x, y, z] });
          universeStore.setZoomLevel("node");

      
          Inertia.visit(node.route, {
            preserveState: true,
            preserveScroll: true,
          });
        }}
        onHover={(info) =>
          onNodeHover?.(info ? { ...info, label: node.name } : null)
        }
      />
    );
  });
}
