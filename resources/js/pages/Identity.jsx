/*
    Identity.jsx
*/

import { observer } from "mobx-react-lite";
import { Head, usePage } from "@inertiajs/react";
import MainLayout from "@/MainLayout";
import UniverseBackdrop from "@/components/visuals/UniverseBackdrop"; // 🪐 Nebula-style background
/* import Achievements from "@/components/information/Achievements";
import Build from "@/components/information/Build"; */


const Identity = observer(() => {
  const { mode } = usePage().props;

  return (
    <>
      <Head title={`Identity ${mode?.toUpperCase?.() || "System"}`} />

     
      <UniverseBackdrop mode={mode} />

    
  {/*     {mode === "achievements" && <Achievements  />}
      {mode === "build" && <Build />} 
     */}
     
    </>
  );
});

Identity.layout = (page) => <MainLayout>{page}</MainLayout>;
export default Identity;