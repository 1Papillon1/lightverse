import { useState } from "react";
import { observer } from "mobx-react-lite";
import MainLayout from "@/MainLayout";
import arrowBackIcon from "@/assets/icons/arrow_back.svg";
import arrowForwardIcon from "@/assets/icons/arrow_forward.svg";
import { Head } from "@inertiajs/react";

const Social = observer(() => {
  const [rotation, setRotation] = useState(0);
  const faces = ["front", "right", "back", "left"];
  const [currentIndex, setCurrentIndex] = useState(0);

  // Disable turning left if on first face, disable turning right if on last face
  const handleRotateForward = () => {
    if (currentIndex < faces.length - 1) {
      setRotation((prev) => prev - 90);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleRotateBackward = () => {
    if (currentIndex > 0) {
      setRotation((prev) => prev + 90);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
     <>
    <section className="hero">
      <Head title="Social" />

      <button
        className="section__button section__button--back"
        onClick={handleRotateBackward}
        disabled={currentIndex === 0}
        style={{ opacity: currentIndex === 0 ? 0.3 : 1 }}
      >
        <img src={arrowBackIcon} className="section__icon" alt="arrow_back" />
      </button>

      <div className="section" style={{ transform: `rotateY(${rotation}deg)` }}>
        {/* FRONT - Instagram */}
        <div className="section__face section__face--front">
          <div className="section__content">
            <h1 className="section__title">Instagram</h1>
            <p className="section__subtitle">To the Living Web 🌐</p>
            <p className="section__footer">
              Not the coded one. Not the owned one.  
              The one that <em>feels</em>. The one that <em>remembers</em>.  
              The networks whisper again — and this time, they’re alive.  
              <br />
              <strong>#LightWeb #Signal808 #DigitalAwakening</strong>
            </p>
           
          </div>
        </div>

        {/* RIGHT - X (Twitter) */}
        <div className="section__face section__face--right">
          <div className="section__content">
            <h2 className="section__title">X (Twitter)</h2>
            <p className="section__subtitle">::SIGNAL_808 DECODED::</p>
            <p className="section__footer">
              The web breathes again.  
              Welcome back, node operator.  
              <br />
              <strong>#LightWeb #WzkrVerse #RebootingReality</strong>
            </p>
           

          </div>
        </div>

        {/* BACK - Facebook */}
        <div className="section__face section__face--back">
          <div className="section__content">
            <h2 className="section__title">Facebook</h2>
            <p className="section__subtitle">The networks whisper again.</p>
            <p className="section__footer">
              What was lost is waking.  
              The Light Web remembers.  
              <br />
              <strong>#LightWeb #WzkrVerse #Signal808</strong>
            </p>
           
          </div>
        </div>

        {/* LEFT - Telegram */}
        <div className="section__face section__face--left">
          <div className="section__content">
            <h2 className="section__title">Telegram</h2>
            <p className="section__subtitle">⚡️ [Transmission Received]</p>
            <p className="section__footer">
              ::SIGNAL_808 DECODED::  
              The web breathes again.  
              The circuits are stirring.  
              <br />
              Welcome to the <strong>Light Web.</strong>  
              <br />
              <strong>#WzkrVerse #Signal808 #AI #Web3</strong>
            </p>
           
          </div>
        </div>
      </div>

      <button
        className="section__button section__button--forward"
        onClick={handleRotateForward}
        disabled={currentIndex === faces.length - 1}
        style={{ opacity: currentIndex === faces.length - 1 ? 0.3 : 1 }}
      >
        <img src={arrowForwardIcon} className="section__icon" alt="arrow_forward" />
      </button>
    </section>


<div className="social-orbit">
  <a
    href="https://www.instagram.com/cchain844/"
    target="_blank"
    rel="noopener noreferrer"
    className={`social-node ${currentIndex === 0 ? "active" : ""}`}
  >
    <i className="fab fa-instagram"></i>
  </a>

  <a
    href="https://x.com/CryptoInt25"
    target="_blank"
    rel="noopener noreferrer"
    className={`social-node ${currentIndex === 1 ? "active" : ""}`}
  >
    <i className="fab fa-x-twitter"></i>
  </a>

  <a
    href="https://www.facebook.com/profile.php?id=61572589478036"
    target="_blank"
    rel="noopener noreferrer"
    className={`social-node ${currentIndex === 2 ? "active" : ""}`}
  >
    <i className="fab fa-facebook-f"></i>
  </a>

  <a
    href="https://t.me/thelightweb"
    target="_blank"
    rel="noopener noreferrer"
    className={`social-node ${currentIndex === 3 ? "active" : ""}`}
  >
    <i className="fab fa-telegram-plane"></i>
  </a>
</div>
</>
  );
});

Social.layout = (page) => <MainLayout>{page}</MainLayout>;

export default Social;
