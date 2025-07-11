import React, { useContext } from "react";
import { observer } from "mobx-react-lite";
import { RootStoreContext } from "@/stores/RootStore"; 
import Navigation from "@/components/layout/Navigation";
import MainLayout from "@/MainLayout";
import { Head } from "@inertiajs/react";


const Settings = observer(() => {
   const rootStore = useContext(RootStoreContext);

    const toggleAnimated = () => {
        rootStore.uiStore.toggleAnimated();
        console.log(rootStore.uiStore.animated);
    }; 

    return (
        <section className="hero">
            
            <Head title="Settings" />

                <div className="section">
                    <div className="section__container">
                        <div className="section__content interface">
                            <h1 className="section__title">Settings</h1>
                            
                        

                            <div className="settings__item">
                                <span className="settings__label">Animated</span>
                                <label className="settings__switch">
                                    <input 
                                        type="checkbox" 
                                        checked={rootStore.uiStore.animated} 
                                        onChange={toggleAnimated} 
                                    />
                                    <span className="settings__slider"></span>
                                </label>
                            </div>

                        </div> 
                    </div>
                </div> 
        </section>
    );
});

Settings.layout = (page) => <MainLayout>{page}</MainLayout>;

export default Settings;
