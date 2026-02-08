import { observer } from "mobx-react-lite";
import { useRootStore } from "@/stores/RootStore";
import { useEffect } from "react";


const UniverseBootLoader = observer(() => {
  const { visualLoadStore } = useRootStore();

   if (visualLoadStore.universeReady) return null; 

/*    const tips = [
    "Tip: The Lightverse is a vast, interconnected web of knowledge and experience. Take your time to explore and discover its wonders.",
    "Tip: The Lightverse is not just a place to learn, but a place to connect. Engage with others and share your insights to enrich the collective understanding.",
    "Tip: The Lightverse is ever-evolving. New content and experiences are added regularly, so check back often to see what's new.",
    "Tip: The Lightverse is designed to be intuitive and user-friendly. Don't hesitate to explore and experiment with different features and tools.",
    "Tip: The Lightverse is a community-driven platform. Your contributions and feedback are valuable in shaping its future development."
  ];

  useEffect(() => {

    const timer = setTimeout(() => {
      visualLoadStore.setUniverseReady(true);
    }, 3000); 

    return () => clearTimeout(timer);
  }, [visualLoadStore]); */

  return (
    <div className="universe-boot">
      <div className="universe-boot__core">
        <div className="universe-boot__sigil">💠</div>
        <div className="universe-boot__text">
          Initializing Lightverse…
        </div>
        {/* <div className="universe-boot__tip">
          {tips[Math.floor(Math.random() * tips.length)]}
        </div> */}
      </div>
    </div>
  );
});

export default UniverseBootLoader;