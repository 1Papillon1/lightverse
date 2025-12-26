// Achievements.jsx
import { useContext } from "react";
import { observer } from "mobx-react-lite";
import { RootStoreContext } from "@/stores/RootStore";
import MainLayout from "@/MainLayout";
import { Head } from "@inertiajs/react";
import { usePage } from "@inertiajs/react";
import UniverseBackdrop from "@/components/visuals/UniverseBackdrop";
/* import SkeletonBot  from "@/components/model/SkeletonBot"; */

const Build = observer(() => {

    // stores and context
    const { auth, symbol } = usePage().props;     
    const rootStore = useContext(RootStoreContext);
    const store = rootStore.marketStore;
    const { navigationState } = rootStore.uiStore;

    return (
        <>
               <Head title="Build" />
                    {/*  <UniverseBackdrop mode="identity">
                        
                        <SkeletonBot
                        position={[0, -2, 22]}
                        scale={1.5}
                        rotation={[0, -360/Math.PI, 0.2]}
                        />
                    </UniverseBackdrop> */}
                    </>
    );
}
); 
Build.layout = (page) => <MainLayout>{page}</MainLayout>

export default Build;