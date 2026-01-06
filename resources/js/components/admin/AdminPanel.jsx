import { observer } from "mobx-react-lite";
import AchievementCreate from "./achievements/AchievementCreate";

const AdminPanel = observer(() => {
  return (
    <div className="admin-panel">
      <h2>Admin Control</h2>

      <section>
        <h3>Achievements</h3>
        <AchievementCreate />
      </section>
    </div>
  );
});

export default AdminPanel;
