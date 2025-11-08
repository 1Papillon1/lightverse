import { useContext, useState, useEffect } from "react";
import RisingStar from "@/components/visuals/RisingStar";
import { RootStoreContext } from "@/stores/RootStore";

const starConfigs = [
  { id: "wallet", label: "Wallet", theme: "black", position: [-40, 2, 105] },
  { id: "markets", label: "Markets", theme: "orange", position: [59, 15, 85] },
  { id: "contracts", label: "Contracts", theme: "gray", position: [85, -35, -17] },
  { id: "overview", label: "Overview", theme: "darkbrown", position: [-65, -15, 8] },
  { id: "ai", label: "Wzkr AI", theme: "lightbrown", position: [25, 15, -60] },
];

export default function RisingStarGrid({ onSelect }) {
  const { universeStore } = useContext(RootStoreContext);
  const [activeStar, setActiveStar] = useState(null);

  // 🧠 Auto-close on outside click (left or right)
  useEffect(() => {
    const close = (e) => {
      if (e.button === 0 || e.button === 2) setActiveStar(null);
    };
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, []);

  return (
    <>
      {starConfigs.map((star) => (
        <group key={star.id}>
          <RisingStar
            position={star.position}
            theme={star.theme}
            label={star.label}
            systemId={star.id}
            isActive={activeStar === star.id}
            onToggleContext={() =>
              setActiveStar((prev) => (prev === star.id ? null : star.id))
            }
          />
          <mesh
            position={star.position}
            onClick={() => {
              universeStore.setActiveSystem({ id: star.id, pos: star.position });
              universeStore.setZoomLevel("system");
              onSelect?.(star.id, star.position);
            }}
          >
            <sphereGeometry args={[3.2, 32, 32]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        </group>
      ))}
    </>
  );
}
