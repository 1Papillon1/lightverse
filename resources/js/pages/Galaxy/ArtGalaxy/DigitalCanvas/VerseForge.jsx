// resources/js/Pages/Galaxy/Art/DigitalCanvas/VerseForge.jsx
import React from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/MainLayout';
import UniverseBackdrop from '@/components/visuals/UniverseBackdrop';
import VoxelBuilder from '@/components/visuals/VoxelBuilder';

const VerseForge = () => {
    return (
        <div onContextMenu={(e) => e.preventDefault()} style={{ width: '100vw', height: '100vh' }}>
            <Head>
                <title>Verse Forge - Lightverse</title>
            </Head>

            <UniverseBackdrop>
                {/* VoxelBuilder ide UNUTAR jer backdrop sadrži <Canvas> */}
                <VoxelBuilder />
            </UniverseBackdrop>

            {/* 2D UI za selekciju materijala može ići ovdje */}
            <div className="forge-build__overlay" style={{ pointerEvents: 'none' }}>
                <div style={{   position: 'absolute', 
                    bottom: '40px', 
                    left: '40px', 
                    pointerEvents: 'auto'  }}>
                    <p style={{ color: 'white', fontWeight: 'bold', fontFamily: 'Orbitron', textAlign: 'center' }}>
                        LEFT CLICK TO PLACE 
                        <br />
                        ALT+CLICK TO REMOVE
                    </p>
                </div>
            </div>
        </div>
    );
};

VerseForge.layout = page => <MainLayout children={page} />;
export default VerseForge;