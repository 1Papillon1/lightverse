// LoadingScreen.jsx
import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRootStore } from "@/stores/RootStore";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";

const LoadingScreen = observer(() => {
    
    return (
        <div className="overlay">
            <div className="overlay__loader">
                <span className="overlay__loader-text">Loading...</span>
            </div>
        </div>
    )
});

export default LoadingScreen;