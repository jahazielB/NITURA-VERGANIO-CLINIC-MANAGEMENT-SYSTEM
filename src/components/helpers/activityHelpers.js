export function formatActivityTime(iso) {
  if (!iso) return "";

  const now = new Date();
  const d = new Date(iso);

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const diffDays = Math.round((startOfToday - startOfDay) / 86400000);

  if (diffDays === 0) {
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  if (diffDays === 1) {
    return "Yesterday";
  }

  if (diffDays >= 2 && diffDays <= 7) {
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  }

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
