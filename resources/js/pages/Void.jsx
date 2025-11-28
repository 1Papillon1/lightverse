// void.jsx
import React from "react";
import { observer } from "mobx-react-lite";
import { Head, usePage } from "@inertiajs/react";
import MainLayout from "@/MainLayout";

import UniverseBackdrop from "@/components/visuals/UniverseBackdrop";
import ComingSoon from "@/components/information/ComingSoon";

const Void = observer(() => {

    return (
        <div>
            <Head title="Void" />
        </div>
    )
})