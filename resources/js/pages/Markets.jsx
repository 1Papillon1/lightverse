/*
    Markets.jsx
*/

import React, { useContext, useEffect, useState, useRef } from "react";
import { observer } from "mobx-react-lite";
import { Head, usePage } from "@inertiajs/react";
import MainLayout from "@/MainLayout";
import UniverseBackdrop from "@/components/visuals/UniverseBackdrop";
import ComingSoon from "@/components/information/ComingSoon";

const Markets = observer(() => {

    const { mode } = usePage().props;

  return (
     <>
      <Head title="Markets" />

   
      <UniverseBackdrop mode={mode} />

      
      <ComingSoon message="Market features are coming soon. Stay tuned!" />
    </>
  );
});

Markets.layout = (page) => <MainLayout>{page}</MainLayout>;
export default Markets;