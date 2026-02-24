// resources/js/components/ui/BreadcrumbTrail.jsx
import { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { RootStoreContext } from '@/stores/RootStore';
import { universeConfig } from '@/config/universe';
import { Inertia } from '@inertiajs/inertia';

const BreadcrumbTrail = observer(({ onNavigate }) => {
  const { universeStore } = useContext(RootStoreContext);
  
  // Get galaxy and system names from config
  const galaxyName = universeStore.activeGalaxy
    ? universeConfig.galaxies.find(g => g.id === universeStore.activeGalaxy.id)?.label
    : null;
  
  const systemName = universeStore.activeSystem
    ? (() => {
        const galaxy = universeConfig.galaxies.find(g =>
          g.starSystems.some(s => s.id === universeStore.activeSystem.id)
        );
        return galaxy?.starSystems.find(s => s.id === universeStore.activeSystem.id)?.label;
      })()
    : null;
  
  // Navigation handlers
  const handleUniverseClick = () => {
    if (universeStore.zoomLevel === 'universe') return;
    
    universeStore.setZoomLevel('universe');
    universeStore.setActiveGalaxy(null);
    universeStore.setActiveSystem(null);
    
    // Trigger parent component's navigation (UniverseScene.returnToUniverseCenter)
    onNavigate?.('universe');
  };
  
  const handleGalaxyClick = () => {
    if (universeStore.zoomLevel === 'galaxy' || !universeStore.activeGalaxy) return;
    
    const galaxy = universeConfig.galaxies.find(g => g.id === universeStore.activeGalaxy.id);
    if (!galaxy) return;
    
    universeStore.setZoomLevel('galaxy');
    universeStore.setActiveSystem(null);
    
    // Navigate back to galaxy view
    Inertia.visit(galaxy.route, {
      preserveState: true,
      preserveScroll: true,
    });
  };
  
  return (
    <div className="breadcrumb-trail">
      <span 
        className={universeStore.zoomLevel === 'universe' ? 'active' : 'clickable'}
        onClick={handleUniverseClick}
      >
        Lightverse
      </span>
      
      {galaxyName && (
        <>
          <span className="separator"> → </span>
          <span 
            className={universeStore.zoomLevel === 'galaxy' ? 'active' : 'clickable'}
            onClick={handleGalaxyClick}
          >
            {galaxyName}
          </span>
        </>
      )}
      
      {systemName && (
        <>
          <span className="separator"> → </span>
          <span className="active">{systemName}</span>
        </>
      )}
    </div>
  );
});

export default BreadcrumbTrail;