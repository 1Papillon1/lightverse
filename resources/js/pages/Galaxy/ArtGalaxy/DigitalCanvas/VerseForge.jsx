// resources/js/Pages/Galaxy/Art/DigitalCanvas/VerseForge.jsx
import React from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/MainLayout';
import UniverseBackdrop from '@/components/visuals/UniverseBackdrop';
import VoxelBuilder from '@/components/visuals/VoxelBuilder';
import { useRootStore } from '@/stores/RootStore';
import { observer } from 'mobx-react-lite';

const VerseForge = observer(() => {
    const { voxelStore } = useRootStore();
    

    return (
        <div onContextMenu={(e) => e.preventDefault()} style={{ width: '100vw', height: '100vh' }}>
            <Head>
                <title>Verse Forge</title>
            </Head>

            <UniverseBackdrop>
                {/* VoxelBuilder ide UNUTAR jer backdrop sadrži <Canvas> */}
                <VoxelBuilder />
            </UniverseBackdrop>

            {/* 2D UI za selekciju materijala može ići ovdje */}
            <div className="forge-build__overlay" style={{ pointerEvents: 'none' }}>
               <div style={{ position: 'absolute', top: '40px', left: '40px', pointerEvents: 'none' }}>
                    <h2 style={{ color: 'white', fontFamily: 'Orbitron', fontSize: '18px', margin: 0 }}>
                        VOXEL CAPACITY
                    </h2>
                    <div style={{ 
                        width: '200px', height: '4px', background: 'rgba(255,255,255,0.1)', 
                        marginTop: '8px', position: 'relative' 
                    }}>
                        {/* Progress bar koji se puni */}
                        <div style={{ 
                            width: `${(voxelStore.voxels.length / voxelStore.maxBlocks) * 100}%`,
                            height: '100%', background: '#00f2ff', boxShadow: '0 0 10px #00f2ff',
                            transition: 'width 0.3s ease'
                        }} />
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', marginTop: '5px' }}>
                        {voxelStore.voxels.length} / {voxelStore.maxBlocks} BLOCKS USED
                    </p>
                </div>
            </div>
        </div>
    );
});

VerseForge.layout = page => <MainLayout children={page} />;
export default VerseForge;