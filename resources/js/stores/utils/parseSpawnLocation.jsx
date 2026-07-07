// parseSpawnLocation.jsx

export default function parseSpawnLocation(loc) {
  if (!loc || typeof loc !== "string") return null;

  const [type, value] = loc.split(":");

  return {
    type,   // "page" | "system" | "galaxy"
    value,  // "overview.about"
  };
}

