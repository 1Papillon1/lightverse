// Wallet.jsx

import { useContext } from "react";
import { observer } from "mobx-react-lite";
import { Head, usePage } from "@inertiajs/react";
import { RootStoreContext } from "@/stores/RootStore";
import MainLayout from "@/MainLayout";

import AirEffect from "@/components/visuals/AirEffect"; 
import WalletBackdrop from "@/components/visuals/WalletBackdrop";

const Wallet = observer(() => {

    const { mode } = usePage().props;
    const rootStore = useContext(RootStoreContext);
    

    return(
      <>
        <Head title="Wallet" />
        <AirEffect />  
        
        <WalletBackdrop mode="wallet" />
        


      </>
    )

})
Wallet.layout = (page) => <MainLayout>{page}</MainLayout>;
export default Wallet