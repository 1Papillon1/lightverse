// Roadmap.jsx
import { useContext } from "react";
import { observer } from "mobx-react-lite";
import { RootStoreContext } from "@/stores/RootStore";
import MainLayout from "@/MainLayout";
import { Head } from "@inertiajs/react";
import { usePage } from "@inertiajs/react";



const Roadmap = observer(() => {

    // stores and context
    const { auth, symbol } = usePage().props;     
    const rootStore = useContext(RootStoreContext);
    const store = rootStore.marketStore;
    const { navigationState } = rootStore.uiStore;

    return (
        <>
            <Head title="Roadmap" />
            <section className="hero">
                <div className="hero__content">
                    <h1 className="hero__title">Roadmap</h1>
                    <p className="hero__subtitle">Welcome to the Roadmap Page</p>
                    <p className="hero__description">
                        Here you can find our planned features and updates.
                    </p>
                </div>
            </section>
        </>
    );
}
); 
Roadmap.layout = (page) => <MainLayout>{page}</MainLayout>

export default Roadmap;