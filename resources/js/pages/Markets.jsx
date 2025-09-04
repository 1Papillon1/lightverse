/*
    Markets.jsx
*/

import React, { useContext, useEffect, useState, useRef } from "react";
import { observer } from "mobx-react-lite";
import { Head, usePage } from "@inertiajs/react";
import MainLayout from "@/MainLayout";
import UniverseBackdrop from "@/components/visuals/UniverseBackdrop";
import ComingSoon from "@/components/information/ComingSoon";
import { RootStoreContext } from "@/stores/RootStore";
import MarketBlocks from "@/components/market/MarketBlocks";

const Markets = observer(() => {

  const { mode, symbol } = usePage().props;
  const RootStore = useContext(RootStoreContext);
  const store = useContext(RootStoreContext).marketStore;
  const [selectedMarket, setSelectedMarket] = useState(null);

  useEffect(() => {
    if (symbol) {
      store.setSearchQuery(symbol);

      store.setSelectedMarket(
        store.markets.find((m) => m.symbol.toUpperCase() === symbol.toUpperCase())
      );
    }
  }, [symbol, store]);




  return (
     <>
      <Head title="Markets" />

   
      <UniverseBackdrop mode={mode} />

      
      <MarketBlocks />
    </>
  );
});

Markets.layout = (page) => <MainLayout>{page}</MainLayout>;
export default Markets;