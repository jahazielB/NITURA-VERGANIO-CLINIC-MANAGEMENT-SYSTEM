import { todayISO, pad2 } from "./labHelpers";

export const APPT_STATUS = {
  WAITING: "Waiting",
  IN_CONSULT: "In Consult",
  DONE: "Done",
  SCHEDULED: "Scheduled",
  CANCELLED: "Cancelled",
  NO_SHOW: "No-show",
};

export const APPT_TAB = {
  TODAY: "today",
  UPCOMING: "upcoming",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export function nowTimeHM() {
  const d = new Date();
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export function toHumanDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export function toHumanTime(hm) {
  if (!hm) return "";
  const [h, m] = hm.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function isToday(iso) {
  return iso === todayISO();
}

export function isUpcoming(iso) {
  return new Date(iso) > new Date(todayISO());
}

export function matchesSearch(appt, q) {
  if (!q) return true;
  const s = q.toLowerCase();
  return (
    `${appt.patientName}`.toLowerCase().includes(s) ||
    `${appt.contact || ""}`.toLowerCase().includes(s)
  );
}
