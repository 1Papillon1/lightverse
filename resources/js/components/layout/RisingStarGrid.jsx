// resources/js/components/layout/RisingStarGrid.jsx
import { useContext } from "react";
import RisingStar from "@/components/visuals/RisingStar";
import { RootStoreContext } from "@/stores/RootStore";
import { universeConfig } from "@/config/universe";

/// Starfield - representing star systems within a galaxy
export default function RisingStarGrid({ galaxyId, onSelect }) {
  const { universeStore } = useContext(RootStoreContext);

  // Get the active galaxy's star systems
  const galaxy = universeConfig.galaxies.find(g => g.id === galaxyId);
  
  if (!galaxy) return null;

  // Map star systems to configs with themes
  const starConfigs = galaxy.starSystems.map((system, index) => {
    const themes = ["black", "orange", "gray", "darkbrown", "lightbrown", "purple"];
    return {
      id: system.id,
      label: system.label,
      theme: themes[index % themes.length],
      position: system.position,
    };
  });

  return (
    <>
      {starConfigs.map((star) => (
        <group key={star.id}>
          <RisingStar
            position={star.position}
            theme={star.theme}
            label={star.label}
            interactive={true}
          />

          {/* Invisible click target */}
          <mesh
            position={star.position}
            onClick={() => {
              universeStore.setActiveSystem({ id: star.id, pos: star.position });
              universeStore.setZoomLevel("system");
              onSelect?.(star.id, star.position);
            }}
            onPointerOver={(e) => {
              document.body.style.cursor = "pointer";
              e.stopPropagation();
            }}
            onPointerOut={() => {
              document.body.style.cursor = "auto";
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