// resources/js/Pages/Galaxy/ArtGalaxy/DigitalCanvas/VerseForge.jsx

import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/MainLayout';
import UniverseBackdrop from '@/components/visuals/UniverseBackdrop';
import VoxelBuilder from '@/components/visuals/VoxelBuilder';
import { useRootStore } from '@/stores/RootStore';
import { observer } from 'mobx-react-lite';

// ─────────────────────────────────────────────────────────────
// PUBLISH MODAL - reuse-a postojeće .overlay klase iz overlay.scss,
// bez ijedne nove SCSS klase potrebne za ovo.
// ─────────────────────────────────────────────────────────────

const PublishModal = ({ onClose, onPublish, busy }) => {
  const [title, setTitle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || busy) return;
    onPublish(title.trim());
  };

  return (
    <div className="overlay overlay--centered overlay--blurred" data-interactive="false">
      <div className="overlay__content">
        <h2 className="overlay__title">PUBLISH</h2>
        <p className="overlay__text">
          Give your creation a name. Once published, it appears in the public
          Gallery exactly as it is right now - a permanent snapshot.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            placeholder="Name your creation..."
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid rgba(0,255,255,0.4)',
              background: 'rgba(0,0,0,0.3)',
              color: '#fff',
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '14px',
              textAlign: 'center',
              marginBottom: '1.5rem',
            }}
          />

          <div className="overlay__buttons-bar" style={{ position: 'static', transform: 'none' }}>
            <button
              type="button"
              className="overlay__button overlay__button--skip"
              onClick={onClose}
              disabled={busy}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="overlay__button"
              disabled={!title.trim() || busy}
            >
              {busy ? '...' : 'Publish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────

const VerseForge = observer(() => {
    const { voxelStore } = useRootStore();
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [publishError, setPublishError] = useState(null);

    const handlePublish = async (title) => {
        setPublishing(true);
        setPublishError(null);

        const result = await voxelStore.publishBuilding(title);

        setPublishing(false);

        if (result) {
            setShowPublishModal(false);
            // Ovdje bi bilo lijepo pokazati kratku "Published!" potvrdu -
            // ostavljam otvoreno, ovisi imaš li već toast/notification sustav
            // (vidio sam da imaš NotificationController - moglo bi se spojiti).
        } else {
            setPublishError('Something went wrong. Please try again.');
        }
    };

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

                {/* Publish gumb - pointerEvents auto jer je klikabilan,
                    dok mu je parent pointerEvents:none (HUD passthrough) */}
                <div style={{ position: 'absolute', top: '40px', right: '40px', pointerEvents: 'auto' }}>
                    <button
                        onClick={() => setShowPublishModal(true)}
                        disabled={voxelStore.voxels.length === 0}
                        style={{
                            background: voxelStore.voxels.length === 0
                                ? 'rgba(255,255,255,0.05)'
                                : 'linear-gradient(90deg, #00ffff, #8f00ff)',
                            color: voxelStore.voxels.length === 0 ? 'rgba(255,255,255,0.3)' : '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '10px 20px',
                            fontFamily: 'Orbitron',
                            fontWeight: 'bold',
                            fontSize: '13px',
                            textTransform: 'uppercase',
                            cursor: voxelStore.voxels.length === 0 ? 'default' : 'pointer',
                            boxShadow: voxelStore.voxels.length === 0 ? 'none' : '0 0 10px #00ffff80',
                        }}
                    >
                        ✦ Publish to Gallery
                    </button>
                    {publishError && (
                        <p style={{ color: '#ff0088', fontSize: '11px', marginTop: '6px', textAlign: 'right' }}>
                            {publishError}
                        </p>
                    )}
                </div>

                {/* TESTING TOOL - briše sve blokove odjednom. Namjerno lijevo DOLJE,
                    daleko od Publish gumba (gore desno) da se ne klikne slučajno.
                    Ukloni ovaj blok kad dekoracijski sustav bude gotov i stabilan -
                    ovo je alat za tebe dok testiraš rotacije/skalu modela, ne
                    finalna korisnička funkcionalnost. */}
                <div style={{ position: 'absolute', bottom: '40px', left: '40px', pointerEvents: 'auto' }}>
                    <button
                        onClick={() => {
                            if (window.confirm('Obriši SVE blokove? Ovo se ne može poništiti.')) {
                                voxelStore.clearAll();
                            }
                        }}
                        disabled={voxelStore.voxels.length === 0}
                        style={{
                            background: 'rgba(255,0,136,0.15)',
                            border: '1px solid rgba(255,0,136,0.6)',
                            color: voxelStore.voxels.length === 0 ? 'rgba(255,255,255,0.2)' : '#ff0088',
                            borderRadius: '8px',
                            padding: '8px 16px',
                            fontFamily: 'Orbitron',
                            fontSize: '11px',
                            textTransform: 'uppercase',
                            cursor: voxelStore.voxels.length === 0 ? 'default' : 'pointer',
                        }}
                    >
                        🗑 Clear All (testing)
                    </button>
                </div>
            </div>

            {showPublishModal && (
                <PublishModal
                    busy={publishing}
                    onClose={() => setShowPublishModal(false)}
                    onPublish={handlePublish}
                />
            )}
        </div>
    );
});

VerseForge.layout = page => <MainLayout children={page} />;
export default VerseForge;