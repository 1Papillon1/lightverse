// Achievements.jsx
import { useContext, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { RootStoreContext } from "@/stores/RootStore";
import MainLayout from "@/MainLayout";
import { Head } from "@inertiajs/react";
import UniverseBackdrop from "@/components/visuals/UniverseBackdrop";
import arrowBackIcon from "@/assets/icons/arrow_back.svg";
import arrowForwardIcon from "@/assets/icons/arrow_forward.svg";

const slideStyle = (index, activeIndex) => {
  const offset = (index - activeIndex) * 340;
  return {
    transform: `translate(-50%, -50%) translateX(${offset}px)`,
    opacity: index === activeIndex ? 1 : 0,
    pointerEvents: index === activeIndex ? "auto" : "none",
  };
};

const Achievements = observer(() => {
  const rootStore = useContext(RootStoreContext);
  const achievementsStore = rootStore.achievementsStore;
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    achievementsStore.fetchAchievements();
  }, []);

  const achievements = achievementsStore.achievements;
  const slides = [...achievements, { ghost: true }];

  return (
    <>
      <Head title="Achievements" />
      <UniverseBackdrop />

      <section className="achievements">
        <div className="achievements__projector" />

        {slides.map((a, i) => (
          <div
            key={i}
            className={`achievements__card ${a.ghost ? "achievements__card--ghost" : ""}`}
            style={slideStyle(i, activeIndex)}
          >
            <div className="achievements__core">
              {a.ghost ? (
                <>
                  <h3>Unknown Signal</h3>
                  <span>?</span>
                </>
              ) : (
                <>
                  <h3>
                    {(a.name ?? a.code)
                      .replaceAll("_", " ")
                      .replace(/\b\w/g, c => c.toUpperCase())}
                  </h3>
                  
                </>
              )}
            </div>
          </div>
        ))}

        <div className="achievements__controls">
          <button
            className="section__button section__button--back"
            disabled={activeIndex === 0}
            onClick={() => setActiveIndex(i => i - 1)}
          >
            <img src={arrowBackIcon} className="section__icon" />
          </button>

          <button
            className="section__button section__button--forward"
            disabled={activeIndex === slides.length - 1}
            onClick={() => setActiveIndex(i => i + 1)}
          >
            <img src={arrowForwardIcon} className="section__icon" />
          </button>
        </div>
      </section>
    </>
  );
});

Achievements.layout = page => <MainLayout>{page}</MainLayout>;
export default Achievements;
