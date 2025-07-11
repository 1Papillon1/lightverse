// FloatingNodeGrid.jsx
import FloatingNode from "@/components/visuals/FloatingNode";

const nodeData = [
  { type: "wallet", name: "Wallet", id: "wallet", route: "/wallet" },
  { type: "token", name: "Market", id: "market", route: "/dashboard" },
  { type: "contract", name: "Contracts", id: "contract", route: "/contracts" },
  { type: "roadmap", name: "Roadmap", id: "roadmap", route: "/roadmap" },
  { type: "ai", name: "Wzkr AI", id: "ai", route: "/ai" }
];

export default function FloatingNodeGrid({ onSelect, onNodeHover }) {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const radius = isMobile ? 2.3 : 7.5;
  const verticalScale = isMobile ? 0.4 : 2.4;

  return nodeData.map((node, i) => {
    const angle = (i / nodeData.length) * Math.PI * 2;
    const x = Math.cos(angle * 0.91) * radius * 1.45;
    const z = Math.sin(angle * 0.9) * radius;
    const y = Math.sin(i * 0.1) * verticalScale * 0.8;

    return (
      <FloatingNode
        key={node.id}
        type={node.type}
        position={[x * 0.7, y * 3.7, z]}
          onClick={() => {
  onSelect?.(node.id, [x * 0.7, y * 3.7, z], node.route); // ← pass position and route
}}

        onHover={(info) =>
          onNodeHover?.(info ? { ...info, label: node.name } : null)
        }
      />
    );
  });
}
