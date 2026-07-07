// Ai.jsx
import React from "react";
import { observer } from "mobx-react-lite";
import { Head, usePage } from "@inertiajs/react";
import MainLayout from "@/MainLayout";

import UniverseBackdrop from "@/components/visuals/UniverseBackdrop";
import ComingSoon from "@/components/information/ComingSoon";

const Ai = observer(() => {
   const { mode } = usePage().props;


  return (
    <>
      <Head title="AI" />

   
      <UniverseBackdrop mode={mode} />

      
      <ComingSoon message="AI features are coming soon. Stay tuned!" />
    </>
  );
});

Ai.layout = (page) => <MainLayout>{page}</MainLayout>;
export default Ai;
