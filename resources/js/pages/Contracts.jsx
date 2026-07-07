// Authorization.jsx
import React from "react";
import { observer } from "mobx-react-lite";
import { Head, usePage } from "@inertiajs/react";
import MainLayout from "@/MainLayout";
import UniverseBackdrop from "@/components/visuals/UniverseBackdrop"; 
import ComingSoon from "@/components/information/ComingSoon";

const Contracts = observer(() => {
  const { mode } = usePage().props; 

  return (
    <>
      <Head title="Contracts" />

      
      <UniverseBackdrop mode={mode} />


      <ComingSoon message="Smart contract features are coming soon. Stay tuned!" />
    </>
  );
}
);

Contracts.layout = (page) => <MainLayout>{page}</MainLayout>;
export default Contracts;