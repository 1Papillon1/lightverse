import { observer } from "mobx-react-lite";
import { useRootStore } from "@/stores/RootStore";

const UniverseBootLoader = observer(() => {
  const { visualLoadStore } = useRootStore();

   if (visualLoadStore.universeReady) return null; 

  return (
    <div className="universe-boot">
      <div className="universe-boot__core">
        <div className="universe-boot__sigil">💠</div>
        <div className="universe-boot__text">
          Initializing Lightverse…
        </div>
      </div>
    </div>
  );
});

export default UniverseBootLoader;