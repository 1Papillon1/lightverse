import React, { useContext } from "react";
import { observer } from "mobx-react-lite";
import { RootStoreContext } from "@/stores/RootStore";

const Watchlist = observer(() => {
    const rootStore = useContext(RootStoreContext);

    return(
        <>
        
        </>
    )

})

export default Watchlist;