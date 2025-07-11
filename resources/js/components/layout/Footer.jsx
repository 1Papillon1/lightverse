// Footer.jsx
import { useContext } from "react";
import { observer } from "mobx-react-lite";
import { RootStoreContext } from "@/stores/RootStore";


const Footer = observer(() => {
    const rootStore = useContext(RootStoreContext);

    

    return (
        <div className="footer interface">
            <h3 className="footer__text">
                Page {rootStore.marketStore.currentPage} of {rootStore.marketStore.totalPages}
            </h3>
        </div>
    )

})


export default Footer;