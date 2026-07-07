// Roadmap.jsx
import { useContext } from "react";
import { observer } from "mobx-react-lite";
import { RootStoreContext } from "@/stores/RootStore";
import MainLayout from "@/MainLayout";
import { Head } from "@inertiajs/react";
import { usePage } from "@inertiajs/react";
import Roadmap3D from "@/components/visuals/Roadmap3D";
import UniverseBackdrop from "@/components/visuals/UniverseBackdrop";

const Roadmap = observer(() => {

    // stores and context
    const { auth, symbol } = usePage().props;     
    const rootStore = useContext(RootStoreContext);
    const store = rootStore.marketStore;
    const { navigationState } = rootStore.uiStore;

    return (
        <>
               <Head title="Roadmap" />
                    <UniverseBackdrop mode="roadmap">
                        <Roadmap3D />
                    </UniverseBackdrop>
                    </>
    );
}
); 
Roadmap.layout = (page) => <MainLayout>{page}</MainLayout>

export default Roadmap;