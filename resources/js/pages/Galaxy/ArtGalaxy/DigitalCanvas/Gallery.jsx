// resources/js/Pages/Galaxy/ArtGalaxy/DigitalCanvas/Gallery.jsx
//
// VAŽNO O PUTANJI: DashboardController::resolveNodeComponent() pretvara
// "art-galaxy" -> "ArtGalaxy" (kebabToPascal). Provjeri da li tvoj STVARNI
// folder na disku odgovara ovome, ili je i dalje "Art" (kako je bilo u
// starijem VerseForge.jsx pathu). Ako je "Art" - ili preimenuj folder u
// "ArtGalaxy", ili promijeni galaxy id u universe.js na "art" umjesto
// "art-galaxy". Jedno od to dvoje mora biti točno, inače Inertia baca
// "Page not found" grešku kod resolveanja komponente.

import React, { useEffect, useState, useCallback } from "react";
import { Head } from "@inertiajs/react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import axios from "axios";
import MainLayout from "@/MainLayout";
import VoxelPreview from "@/components/visuals/VoxelPreview";

// ─────────────────────────────────────────────────────────────
// LISTA
// ─────────────────────────────────────────────────────────────

const BuildingCard = ({ building, onOpen }) => (
  <div
    onClick={() => onOpen(building.id)}
    style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(0,242,255,0.15)",
      borderRadius: "8px",
      overflow: "hidden",
      cursor: "pointer",
    }}
  >
    <div style={{ height: "200px" }}>
      <Canvas camera={{ position: [40, 30, 40], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[20, 20, 20]} intensity={1} />
        <VoxelPreview voxels={building.voxel_data} />
      </Canvas>
    </div>
    <div style={{ padding: "12px" }}>
      <h3 style={{ color: "white", fontFamily: "Orbitron", fontSize: "14px", margin: 0 }}>
        {building.title}
      </h3>
      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", margin: "4px 0" }}>
        by {building.user?.username}
      </p>
      <div style={{ display: "flex", gap: "12px", fontSize: "11px", color: "#00f2ff" }}>
        <span>✦ {building.light_received}</span>
        <span>💬 {building.comment_count}</span>
        <span>★ {building.rating_average || "—"} ({building.rating_count})</span>
      </div>
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
    <>
      <h1 style={{ color: "white", fontFamily: "Orbitron", marginBottom: "24px" }}>
        DIGITAL ART GALLERY
      </h1>

      {loading && <p style={{ color: "white" }}>Učitavanje...</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "20px",
        }}
      >
        {buildings.map((b) => (
          <BuildingCard key={b.id} building={b} onOpen={onOpen} />
        ))}
      </div>

      {!loading && buildings.length === 0 && (
        <p style={{ color: "rgba(255,255,255,0.5)" }}>
          Još nema objavljenih izgradnji. Budi prvi!
        </p>
      )}
    </>
  );
};

// ─────────────────────────────────────────────────────────────
// DETALJ
// ─────────────────────────────────────────────────────────────

const StarRating = ({ myRating, onRate, disabled }) => {
  const [hover, setHover] = useState(null);
  const shown = hover ?? myRating ?? 0;

  return (
    <div style={{ display: "flex", gap: "4px" }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          onClick={() => !disabled && onRate(n)}
          onMouseEnter={() => !disabled && setHover(n)}
          onMouseLeave={() => !disabled && setHover(null)}
          style={{
            cursor: disabled ? "default" : "pointer",
            fontSize: "22px",
            color: n <= shown ? "#00f2ff" : "rgba(255,255,255,0.2)",
            transition: "color 0.15s ease",
          }}
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

  if (loading) return <p style={{ color: "white" }}>Učitavanje...</p>;
  if (!building) return <p style={{ color: "white" }}>Izgradnja nije pronađena.</p>;

  return (
    <>
      <button
        onClick={onBack}
        style={{
          background: "none",
          border: "none",
          color: "#00f2ff",
          cursor: "pointer",
          marginBottom: "16px",
          fontSize: "13px",
        }}
      >
        ← Natrag na galeriju
      </button>

      <h1 style={{ color: "white", fontFamily: "Orbitron", marginBottom: "4px" }}>
        {building.title}
      </h1>
      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", marginBottom: "20px" }}>
        by {building.user?.username} · {building.block_count} blokova
      </p>

      <div style={{ height: "420px", background: "rgba(255,255,255,0.03)", borderRadius: "8px" }}>
        <Canvas camera={{ position: [50, 40, 50], fov: 45 }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[30, 30, 30]} intensity={1} />
          <VoxelPreview voxels={building.voxel_data} autoRotate={false} />
          <OrbitControls enablePan={false} />
        </Canvas>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "20px 0" }}>
        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          <span style={{ color: "#00f2ff" }}>✦ {building.light_received} Light primljeno</span>
          <StarRating myRating={myRating} onRate={handleRate} disabled={busy} />
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>
            ({building.rating_average || "—"} / {building.rating_count} ocjena)
          </span>
        </div>

        <button
          onClick={handleContribute}
          disabled={hasContributed || busy}
          style={{
            background: hasContributed ? "rgba(255,255,255,0.05)" : "#00f2ff",
            color: hasContributed ? "rgba(255,255,255,0.4)" : "#000",
            border: "none",
            borderRadius: "6px",
            padding: "10px 20px",
            fontFamily: "Orbitron",
            fontSize: "12px",
            cursor: hasContributed || busy ? "default" : "pointer",
          }}
        >
          {hasContributed ? "✓ Podržano" : "✦ Podrži s Light"}
        </button>
      </div>

      <h3 style={{ color: "white", fontFamily: "Orbitron", fontSize: "14px", marginTop: "32px" }}>
        KOMENTARI ({comments.length})
      </h3>

      <form onSubmit={handleComment} style={{ display: "flex", gap: "8px", margin: "12px 0 20px" }}>
        <input
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Ostavi komentar..."
          maxLength={500}
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "6px",
            padding: "8px 12px",
            color: "white",
          }}
        />
        <button
          type="submit"
          disabled={!commentText.trim() || busy}
          style={{
            background: "rgba(0,242,255,0.15)",
            border: "1px solid #00f2ff",
            color: "#00f2ff",
            borderRadius: "6px",
            padding: "8px 16px",
            cursor: "pointer",
          }}
        >
          Pošalji
        </button>
      </form>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {comments.map((c) => (
          <div key={c.id} style={{ borderLeft: "2px solid rgba(0,242,255,0.3)", paddingLeft: "12px" }}>
            <p style={{ color: "#00f2ff", fontSize: "12px", margin: 0 }}>{c.user?.username}</p>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px", margin: "2px 0" }}>{c.body}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>
            Još nema komentara. Budi prvi.
          </p>
        )}
      </div>
    </>
  );
};

// ─────────────────────────────────────────────────────────────
// GLAVNA KOMPONENTA - jedan node, prebacuje prikaz lokalno
// ─────────────────────────────────────────────────────────────

const Gallery = () => {
  // Čita ?building=42 iz URL-a na mountu - omogućuje shareable link na
  // konkretnu izgradnju bez dodatnog route segmenta.
  const [activeBuildingId, setActiveBuildingId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("building");
  });

  const openBuilding = (id) => {
    const url = new URL(window.location.href);
    url.searchParams.set("building", id);
    window.history.pushState({}, "", url); // ne triggera Inertia/Laravel round-trip
    setActiveBuildingId(id);
  };

  const backToList = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("building");
    window.history.pushState({}, "", url);
    setActiveBuildingId(null);
  };

  return (
    <div style={{ padding: "40px", maxWidth: "900px", margin: "0 auto" }}>
      <Head>
        <title>Digital Art Gallery</title>
      </Head>

      {activeBuildingId ? (
        <GalleryDetail buildingId={activeBuildingId} onBack={backToList} />
      ) : (
        <GalleryList onOpen={openBuilding} />
      )}
    </div>
  );
};

Gallery.layout = (page) => <MainLayout children={page} />;
export default Gallery;