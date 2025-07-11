import React, { useContext } from "react";
import { observer } from "mobx-react-lite";
import { RootStoreContext } from "@/stores/RootStore";

import AirEffect from "@/components/visuals/AirEffect"; 
import MainLayout from "@/MainLayout";
import { Head } from "@inertiajs/react";


const Wallet = observer(() => {
    const rootStore = useContext(RootStoreContext);
    return(

            <section className="hero">
              <Head title="Wallet" />
              <AirEffect />  
        

            </section>

    )

})
Wallet.layout = (page) => <MainLayout>{page}</MainLayout>;
export default Wallet