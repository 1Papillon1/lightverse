// About.jsx
import { useState} from "react";
import { observer } from "mobx-react-lite";
import MainLayout from "@/MainLayout";
import arrowBackIcon from "@/assets/icons/arrow_back.svg"
import arrowForwardIcon from "@/assets/icons/arrow_forward.svg";
import { Head } from "@inertiajs/react";


/// About section (3D Rotating Cube)
const About = observer(() => {
   

    const [rotation, setRotation] = useState(0);
    const faces = ["front", "right", "back", "left"];
    const [currentFace, setCurrentFace] = useState(faces[0]);

    const handleRotateForward = () => {
        setRotation((prev) => prev - 90);
        setCurrentFace(faces[(faces.indexOf(currentFace) + 1) % faces.length]);
    };

    const handleRotateBackward = () => {
        setRotation((prev) => prev + 90); 
        setCurrentFace(faces[(faces.indexOf(currentFace) - 1 + faces.length) % faces.length]);
    };

    return (
        <section className="hero">
            <Head title="About" />
        
 
          
        <button className="section__button section__button--back" onClick={handleRotateBackward}>
                <img src={arrowBackIcon} className="section__icon" alt="arrow_back" />
            </button>
           
       


        <div className="section" style={{ transform: `rotateY(${rotation}deg)` }}>
            
           
              
            
                <div className="section__face section__face--front">
                    <div className="section__content">
                        <h1 className="section__title">CChain</h1>
                        <p className="section__subtitle">Welcome to the Future of Crypto Web</p>
                        <p className="section__footer">
                            Dive into the next level of blockchain interactivity. Experience dynamic 3D environments,
                            decentralized platforms, and a revolutionary user experience.
                        </p> 
                        
                    </div>    
                </div>

             
                <div className="section__face section__face--right">
                    <div className="section__content">
                        <h2 className="section__title">🚀 Explore Our Features</h2>
                        <ul className="section__list">
                            <li className="section__list__item">🌍 Decentralized Finance (DeFi) Integration</li>
                            <li className="section__list__item">📊 Real-Time Market Data</li>
                            <li className="section__list__item">🔐 Secure & Private Transactions</li>
                            <li className="section__list__item">🛠 Tools for Crypto Traders & Investors</li>
                        </ul>
                       
                    </div>
                </div>

              
                <div className="section__face section__face--back">
                    <div className="section__content">
                        <h2 className="section__title">🌐 Light Web Vision</h2>
                        <p className="section__subtitle">
                        Beyond blockchain – into the living web.
                        </p>
                        <ul className="section__list">
                        <li className="section__list__item">💡 AI-Driven Interfaces for Seamless UX</li>
                        <li className="section__list__item">⚡ Lightning-Fast Lightweight Architecture</li>
                        <li className="section__list__item">🌈 Accessible on All Devices – Even Low-End</li>
                        <li className="section__list__item">🤖 Integrated AI Agents (like Wzkr.Ai!)</li>
                        <li className="section__list__item">🧠 Modular Design: Plug in any future tech</li>
                        </ul>
                        <p className="section__footer">
                        Welcome to the Light Web. Where decentralization meets clarity, 
                        and every interaction is luminous.
                        </p>
                    </div>
                </div>

                
                <div className="section__face section__face--left">
                    <div className="section__content">
                        <h2 className="section__title">🔒 Secure & Decentralized</h2>
                        <p className="section__subtitle">Your crypto assets, fully protected.</p>
                        <ul className="section__list">
                            <li className="section__list__item">🛡️ End-to-End Encryption</li>
                            <li className="section__list__item">🔐 Non-Custodial Wallets</li>
                            <li className="section__list__item">⚖️ Transparent & Audited Smart Contracts</li>
                        </ul>
                       
                    </div>
                </div>

      
              
             

          </div>

     
          <button className="section__button section__button--forward" onClick={handleRotateForward}>
                <img src={arrowForwardIcon} className="section__icon" alt="arrow_forward" />
            </button> 
            
      
          
          
           
        </section>
    );
});

About.layout = (page) => <MainLayout>{page}</MainLayout>;

export default About;