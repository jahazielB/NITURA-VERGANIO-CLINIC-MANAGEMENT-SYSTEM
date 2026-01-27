export function pad2(n) {
  return String(n).padStart(2, "0");
}

export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function statusColor(status) {
  if (status === "Pending") return "warning";
  if (status === "Ready") return "info";
  if (status === "Released") return "success";
  return "default";
}

export function latestVisitIdFrom(visits) {
  if (!visits?.length) return "";
  return [...visits].sort((a, b) => new Date(b.date) - new Date(a.date))[0].id;
}
