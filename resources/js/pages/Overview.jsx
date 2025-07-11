import React from "react";
import { observer } from "mobx-react-lite";
import { Head, usePage } from "@inertiajs/react";
import { RootStoreContext } from "@/stores/RootStore";
import MainLayout from "@/MainLayout";

import About from "@/components/information/About";
import Roadmap from "@/components/information/Roadmap";
import News from "@/components/information/News";
import UniverseBackdrop from "@/components/visuals/UniverseBackdrop"; // 🪐 Import here
import NebulaBackdrop from "../components/visuals/NebulaBackdrop";

const Overview = observer(() => {
  const { mode } = usePage().props;

  return (
    <>
      <Head title="Overview" />

      {/* 🪐 Add it once to apply to all child views */}
      <UniverseBackdrop mode={mode} />

      {/* ✨ Content overlays go here */}
      {mode === "roadmap" && <Roadmap />}
      {mode === "news" && <News />}
      {(mode !== "roadmap" && mode !== "news") && <About />}
    </>
  );
});

Overview.layout = (page) => <MainLayout>{page}</MainLayout>;
export default Overview;
