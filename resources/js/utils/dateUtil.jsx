export function formatTimeLabel(timestamp, interval = "1h") {
  const date = new Date(timestamp);

  switch (interval) {
    case "1d":
      return date.toLocaleDateString(undefined, { month: "short", day: "numeric" }); // e.g. "May 24"
    case "4h":
    case "1h":
      return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }); // "13:00"
    case "1m":
      return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    default:
      return date.toISOString();
  }
}