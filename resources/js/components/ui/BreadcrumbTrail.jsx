// resources/js/components/ui/BreadcrumbTrail.jsx
import { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { RootStoreContext } from '@/stores/RootStore';
import { universeConfig } from '@/config/universe';
import { Inertia } from '@inertiajs/inertia';

const BreadcrumbTrail = observer(() => {
  const { universeStore } = useContext(RootStoreContext);
  
  const galaxyName = universeStore.activeGalaxy?.label ?? null;
const systemName = universeStore.activeSystem?.label ?? null;
const nodeName   = universeStore.activeNode?.label   ?? null;
  
  /* --------------------------------------------------
     🏠 NAVIGATE TO UNIVERSE
  -------------------------------------------------- */
  const handleUniverseClick = () => {
    if (universeStore.zoomLevel === 'universe') return; // Already there
    
    console.log("🏠 Breadcrumb: Navigating to Universe");
    
    // Update store state
    universeStore.setZoomLevel('universe');
    universeStore.setActiveGalaxy(null);
    universeStore.setActiveSystem(null);
    
    // Navigate to dashboard
    Inertia.visit('/dashboard', {
      preserveState: true,
      preserveScroll: true,
    });
  };
  
  /* --------------------------------------------------
     🌌 NAVIGATE TO GALAXY
  -------------------------------------------------- */
  const handleGalaxyClick = () => {
    if (universeStore.zoomLevel === 'galaxy') return; // Already there
    if (!universeStore.activeGalaxy) return; // No galaxy active
    
    console.log("🌌 Breadcrumb: Navigating to Galaxy:", universeStore.activeGalaxy.id);
    
    const galaxy = universeConfig.galaxies.find(g => g.id === universeStore.activeGalaxy.id);
    if (!galaxy) return;
    
    // Update store state
    universeStore.setZoomLevel('galaxy');
    universeStore.setActiveSystem(null);
    
    // Navigate to galaxy route
    Inertia.visit(galaxy.route, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleSystemClick = () => {
      if (universeStore.zoomLevel === 'system') return;
      if (!universeStore.activeSystem || !universeStore.activeGalaxy) return;

      const galaxy = universeConfig.galaxies.find(g => g.id === universeStore.activeGalaxy.id);
      const system = galaxy?.starSystems.find(s => s.id === universeStore.activeSystem.id);
      if (!system) return;

      universeStore.setZoomLevel('system');
      universeStore.setActiveNode(null);

      Inertia.visit(system.route, { preserveState: true, preserveScroll: true });
    };
  
  return (
    <div className="breadcrumb-trail">
      {/* ✅ UNIVERSE - Always clickable unless already there */}
      <span 
        className={universeStore.zoomLevel === 'universe' ? 'active' : 'clickable'}
        onClick={handleUniverseClick}
        style={{ 
          cursor: universeStore.zoomLevel === 'universe' ? 'default' : 'pointer' 
        }}
      >
        Lightverse
      </span>
      
      {/* ✅ GALAXY - Show if active */}
      {galaxyName && (
        <>
          <span className="separator"> → </span>
          <span 
            className={universeStore.zoomLevel === 'galaxy' ? 'active' : 'clickable'}
            onClick={handleGalaxyClick}
            style={{ 
              cursor: universeStore.zoomLevel === 'galaxy' ? 'default' : 'pointer' 
            }}
          >
            {galaxyName}
          </span>
        </>
      )}
      
      {/* ✅ SYSTEM - Show if active, not clickable (current page) */}
     {systemName && (
        <>
          <span className="separator"> → </span>
          <span
            className={universeStore.zoomLevel === 'system' ? 'active' : 'clickable'}
            onClick={handleSystemClick}
            style={{ cursor: universeStore.zoomLevel === 'system' ? 'default' : 'pointer' }}
          >
            {systemName}
          </span>
        </>
      )}

      {/* ✅ NEW: node crumb — always the current leaf, never clickable */}
      {nodeName && (
        <>
          <span className="separator"> → </span>
          <span className="active" style={{ cursor: 'default' }}>
            {nodeName}
          </span>
        </>
      )}
    

    </div>

    
  );
});

export default BreadcrumbTrail;