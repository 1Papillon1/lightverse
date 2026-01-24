import { useState, useEffect } from "react";
import { Inertia } from "@inertiajs/inertia";
import { observer } from "mobx-react-lite";

const AchievementList = observer(() => {
  const [achievements, setAchievements] = useState([]);



    return (
    <div className="admin-achievement-list">
        <h2>Achievements</h2>
        {/* Achievement list rendering logic goes here */}
        </div>
    );


});

export default AchievementList;