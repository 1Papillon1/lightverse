import { useState } from "react";
import { Inertia } from "@inertiajs/inertia";

export default function AchievementCreate() {
  const [code, setCode] = useState("");
  const [data, setData] = useState("{}");
  const [error, setError] = useState(null);

  const submit = () => {
    try {
      JSON.parse(data);
    } catch {
      setError("Invalid JSON");
      return;
    }

    Inertia.post("/admin/achievements", {
      code,
      data: JSON.parse(data),
    });
  };

  return (
    <div className="admin-achievement-create">
      <input
        placeholder="achievement_code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <textarea
        placeholder='{"drops_created":5}'
        value={data}
        onChange={(e) => setData(e.target.value)}
      />

      {error && <div className="error">{error}</div>}

      <button onClick={submit}>Create Achievement</button>
    </div>
  );
}
