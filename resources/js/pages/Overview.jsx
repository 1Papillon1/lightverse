// Overview.jsx
import React from "react";
import { observer } from "mobx-react-lite";
import { Head, usePage } from "@inertiajs/react";
import MainLayout from "@/MainLayout";

import About from "@/components/information/About";
import Roadmap from "@/components/information/Roadmap";
import News from "@/components/information/News";
import Social from "@/components/information/Social";
import UniverseBackdrop from "@/components/visuals/UniverseBackdrop"; // 🪐 Nebula-style background

const Overview = observer(() => {
  const { mode } = usePage().props;

  return (
    <>
      <Head title={`Overview - ${mode?.toUpperCase?.() || "System"}`} />

      {/* 🪐 Shared background for all child routes */}
      <UniverseBackdrop mode={mode} />

      {/* 🪩 Render proper planet content */}
      {mode === "roadmap" && <Roadmap />}
      {mode === "news" && <News />}
      {mode === "social" && <Social />}
      {(mode === "about" || !mode) && <About />}
    </>
  );
});

Overview.layout = (page) => <MainLayout>{page}</MainLayout>;
export default Overview;