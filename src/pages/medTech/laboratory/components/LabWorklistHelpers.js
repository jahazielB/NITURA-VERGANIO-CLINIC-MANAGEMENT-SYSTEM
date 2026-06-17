export const LAB_STATUS = ["Pending", "Processing", "Ready", "Released"];
export const LAB_PRIORITY = ["Routine", "Urgent"];

export const statusColor = (s) => {
  if (s === "Pending") return "warning";
  if (s === "Processing") return "info";
  if (s === "Ready") return "success";
  if (s === "Released") return "default";
  return "default";
};

export const priorityColor = (p) => (p === "Urgent" ? "error" : "default");

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const isToday = (dt) => String(dt || "").slice(0, 10) === todayISO();
