// News.jsx
import { useContext} from "react";
import { observer } from "mobx-react-lite";
import { RootStoreContext } from "@/stores/RootStore";
import MainLayout from "@/MainLayout";
import { Head } from "@inertiajs/react";

const News = observer(() => {

    // stores and context
    const { auth, symbol } = usePage().props;     
    const rootStore = useContext(RootStoreContext);
    const store = rootStore.marketStore;
    const { navigationState } = rootStore.uiStore;
    
    return (
        <>
            <Head title="News" />
            <section className="hero">
                <div className="hero__content">
                    <h1 className="hero__title">News</h1>
                    <p className="hero__subtitle">Latest updates and articles</p>
                    <p className="hero__description">
                        Stay informed with the latest news in the crypto world.
                    </p>
                </div>
            </section>
        </>
    );
}
);
News.layout = (page) => <MainLayout>{page}</MainLayout>

export default News;