// resources/js/Pages/Galaxy/ArtGalaxy/DigitalCanvas/Gallery.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Head } from "@inertiajs/react";
import { observer } from "mobx-react-lite";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import axios from "axios";
import MainLayout from "@/MainLayout";
import UniverseBackdrop from "@/components/visuals/UniverseBackdrop";
import VoxelPreview from "@/components/visuals/VoxelPreview";

// ─────────────────────────────────────────────────────────────
// LISTA - grid hologram kartica koje "materijaliziraju" iz projektora
// ─────────────────────────────────────────────────────────────

const BuildingCard = ({ building, index, onOpen }) => (
  <div
    className="lumina-codex__card lumina-codex__card--grid"
    style={{ animationDelay: `${Math.min(index * 0.05, 0.6)}s` }}
    onClick={() => onOpen(building.id)}
  >
    <div className="lumina-codex__core">
      <div className="lumina-codex__thumb">
        <Canvas camera={{ position: [40, 30, 40], fov: 45 }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[20, 20, 20]} intensity={1} />
          <VoxelPreview voxels={building.voxel_data} />
        </Canvas>
      </div>
      <h3>{building.title}</h3>
      <div className="lumina-codex__badge">✦ {building.light_received} Light</div>
      <p>by {building.user?.username} · {building.block_count} blocks</p>
      <ul className="lumina-codex__examples">
        <li>💬 {building.comment_count} comments</li>
        <li>★ {building.rating_average || "—"} ({building.rating_count} ratings)</li>
      </ul>
    </div>
  </div>
);

const GalleryList = ({ onOpen }) => {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/buildings")
      .then(({ data }) => setBuildings(data.data ?? data))
      .catch((err) => console.error("Gallery: greška pri dohvaćanju izgradnji", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="lumina-codex__grid">
      {loading && <p style={{ color: "#e0f7ff" }}>Loading...</p>}

      {buildings.map((b, i) => (
        <BuildingCard key={b.id} building={b} index={i} onOpen={onOpen} />
      ))}

      {!loading && buildings.length === 0 && (
        <div className="lumina-codex__empty">
          <h2 className="lumina-codex__empty-title">The Gallery Is Empty</h2>
          <p className="lumina-codex__empty-text">
            No creations have been published yet. Step into Verse Forge, build
            something, and be the first to leave your mark here.
          </p>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// DETALJ - jedna centralna hologram kartica (isti mehanizam kao Earning.jsx)
// ─────────────────────────────────────────────────────────────

const StarRating = ({ myRating, onRate, disabled }) => {
  const [hover, setHover] = useState(null);
  const shown = hover ?? myRating ?? 0;

  return (
    <div className="lumina-codex__stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`lumina-codex__star ${n <= shown ? "lumina-codex__star--filled" : ""}`}
          onClick={() => !disabled && onRate(n)}
          onMouseEnter={() => !disabled && setHover(n)}
          onMouseLeave={() => !disabled && setHover(null)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

const GalleryDetail = ({ buildingId, onBack }) => {
  const [building, setBuilding] = useState(null);
  const [myRating, setMyRating] = useState(null);
  const [hasContributed, setHasContributed] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    axios
      .get(`/api/buildings/${buildingId}`)
      .then(({ data }) => {
        setBuilding(data.building);
        setComments(data.building.comments ?? []);
        setMyRating(data.my_rating);
        setHasContributed(data.has_contributed);
      })
      .catch((err) => console.error("Gallery detail: greška pri dohvaćanju", err))
      .finally(() => setLoading(false));
  }, [buildingId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleContribute = async () => {
    if (busy || hasContributed) return;
    setBusy(true);
    try {
      await axios.post(`/api/buildings/${buildingId}/contribute`);
      setHasContributed(true);
      setBuilding((b) => ({ ...b, light_received: b.light_received + 15 }));
    } catch (err) {
      console.error("Greška pri contribute-u", err);
    } finally {
      setBusy(false);
    }
  };

  const handleRate = async (rating) => {
    if (busy) return;
    setBusy(true);
    const previous = myRating;
    setMyRating(rating);
    try {
      await axios.post(`/api/buildings/${buildingId}/rating`, { rating });
    } catch (err) {
      console.error("Greška pri ocjenjivanju", err);
      setMyRating(previous);
    } finally {
      setBusy(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || busy) return;
    setBusy(true);
    try {
      const { data } = await axios.post(`/api/buildings/${buildingId}/comments`, {
        body: commentText.trim(),
      });
      setComments((c) => [...c, data]);
      setCommentText("");
      setBuilding((b) => ({ ...b, comment_count: b.comment_count + 1 }));
    } catch (err) {
      console.error("Greška pri komentiranju", err);
    } finally {
      setBusy(false);
    }
  };

  if (loading || !building) {
    return (
      <div className="lumina-codex__card" style={{ opacity: 1, pointerEvents: "auto" }}>
        <div className="lumina-codex__core">
          <p style={{ color: "#e0f7ff", textAlign: "center" }}>
            {loading ? "Učitavanje..." : "Izgradnja nije pronađena."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="lumina-codex__card" style={{ opacity: 1, pointerEvents: "auto" }}>
      <div className="lumina-codex__core lumina-codex__core--detail">
        <div className="lumina-codex__thumb">
          <Canvas camera={{ position: [50, 40, 50], fov: 45 }}>
            <ambientLight intensity={0.6} />
            <pointLight position={[30, 30, 30]} intensity={1} />
            <VoxelPreview voxels={building.voxel_data} autoRotate={false} />
            <OrbitControls enablePan={false} />
          </Canvas>
        </div>

        <h3>{building.title}</h3>
        <p style={{ textAlign: "center", marginTop: "-0.5rem" }}>
          by {building.user?.username} · {building.block_count} blokova
        </p>

        <div className="lumina-codex__actions">
          <div className="lumina-codex__badge">✦ {building.light_received} Light</div>
          <StarRating myRating={myRating} onRate={handleRate} disabled={busy} />
          <button
            className="lumina-codex__contribute-btn"
            onClick={handleContribute}
            disabled={hasContributed || busy}
          >
            {hasContributed ? "✓ Podržano" : "Podrži"}
          </button>
        </div>

        <form className="lumina-codex__comment-form" onSubmit={handleComment}>
          <input
            className="lumina-codex__comment-input"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Ostavi komentar..."
            maxLength={500}
          />
        </form>

        <div className="lumina-codex__comment-list">
          {comments.map((c) => (
            <div key={c.id} className="lumina-codex__comment">
              <strong>{c.user?.username}</strong>
              <p>{c.body}</p>
            </div>
          ))}
          {comments.length === 0 && (
            <p style={{ color: "rgba(224,247,255,0.4)", fontSize: "0.8rem" }}>
              No comments yet. Be the first to share your thoughts!
            </p>
          )}
        </div>

        <div className="lumina-codex__footer">
          <span className="slide-indicator" style={{ cursor: "pointer" }} onClick={onBack}>
            ← Back to Gallery
          </span>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// GLAVNA KOMPONENTA
// ─────────────────────────────────────────────────────────────

const Gallery = observer(() => {
  const [activeBuildingId, setActiveBuildingId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("building");
  });

  const openBuilding = (id) => {
    const url = new URL(window.location.href);
    url.searchParams.set("building", id);
    window.history.pushState({}, "", url);
    setActiveBuildingId(id);
  };

  const backToList = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("building");
    window.history.pushState({}, "", url);
    setActiveBuildingId(null);
  };

  return (
    <div onContextMenu={(e) => e.preventDefault()} style={{ width: "100vw", height: "100vh" }}>
      <Head>
        <title>Digital Art Gallery</title>
      </Head>

      <UniverseBackdrop />

      <section className="lumina-codex">
        <div className="lumina-codex__projector" />

        {activeBuildingId ? (
          <GalleryDetail buildingId={activeBuildingId} onBack={backToList} />
        ) : (
          <GalleryList onOpen={openBuilding} />
        )}
      </section>
    </div>
  );
});

Gallery.layout = (page) => <MainLayout children={page} />;
export default Gallery;