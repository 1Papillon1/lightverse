// Achievements.jsx
import { useContext } from "react";
import { observer } from "mobx-react-lite";
import { RootStoreContext } from "@/stores/RootStore";
import MainLayout from "@/MainLayout";
import { Head } from "@inertiajs/react";
import { usePage } from "@inertiajs/react";
import UniverseBackdrop from "@/components/visuals/UniverseBackdrop";

const Build = observer(() => {

    // stores and context
    const { auth, symbol } = usePage().props;     
    const rootStore = useContext(RootStoreContext);
    const store = rootStore.marketStore;
    const { navigationState } = rootStore.uiStore;

    return (
        <>
               <Head title="Build" />
                   
                    </>
    );
}
); 
Build.layout = (page) => <MainLayout>{page}</MainLayout>

export default Build;