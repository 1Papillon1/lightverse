import { observer } from "mobx-react-lite";
import { useRootStore } from "@/stores/RootStore";
import AchievementCreate from "./achievements/AchievementCreate";


const AdminPanel = observer(() => {
  const rootStore = useRootStore();
  const { userStore } = rootStore;



  return (
    <div className={`overlay overlay--admin ${
        userStore.overlayClosing ? "closing" : ""
      }`}>

        <div className="overlay__content">
      <h1 className="overlay__title">Admin Control</h1>

     {/*  <section>
        <h3>Achievements</h3>
        <AchievementCreate />
      </section> */}

      </div>
    </div>
  );
});

export default AdminPanel;
