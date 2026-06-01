import { APPT_STATUS } from "./appointmentHelpers";
import { pad2, todayISO } from "./labHelpers";

const DB_STATUS = {
  WAITING: "Waiting",
  IN_CONSULT: "In Consult",
  DONE: "Done",
  CANCELLED: "Cancelled",
  SKIPPED: "Skipped",
  CALLED: "Called",
  IN_TRIAGE: "In Triage",
  QUEUED_FOR_DOCTOR: "Queued for Doctor",
};

export function mapDbStatusToUi(dbStatus) {
  if (dbStatus === DB_STATUS.SKIPPED) return APPT_STATUS.NO_SHOW;
  if (
    dbStatus === DB_STATUS.CALLED ||
    dbStatus === DB_STATUS.IN_TRIAGE ||
    dbStatus === DB_STATUS.QUEUED_FOR_DOCTOR
  ) {
    return APPT_STATUS.WAITING;
  }
  return dbStatus;
}

export function mapUiStatusToDb(uiStatus) {
  if (uiStatus === APPT_STATUS.NO_SHOW) return DB_STATUS.SKIPPED;
  if (uiStatus === APPT_STATUS.SCHEDULED) return DB_STATUS.WAITING;
  return uiStatus;
}

function queuedAtToTime(queuedAt) {
  const d = queuedAt ? new Date(queuedAt) : new Date();
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export function mapQueueEntryToRow(entry) {
  const visit = entry.visits ?? null;

  return {
    id: entry.id,
    patientName: entry.display_name ?? "",
    contact: entry.contact_number ?? "",
    reason: entry.chief_complaint ?? "",
    date: entry.queue_date ?? todayISO(),
    time: queuedAtToTime(entry.queued_at),
    status: mapDbStatusToUi(entry.status),
    doctor: "—",
    visitType: visit?.visit_type ?? "—",
    isWalkIn: !entry.visit_id || visit?.visit_type === "Walk-in",
    queueNumber: entry.queue_number,
  };
}

export function mapFormToCreatePayload(form) {
  return {
    display_name: form.patientName.trim(),
    contact_number: form.contact?.trim() || null,
    chief_complaint: form.reason?.trim() || null,
    status: mapUiStatusToDb(form.status ?? APPT_STATUS.WAITING),
    queue_date: form.date ?? todayISO(),
  };
}

export function mapFormToUpdatePatch(form) {
  return {
    display_name: form.patientName.trim(),
    contact_number: form.contact?.trim() || null,
    chief_complaint: form.reason?.trim() || null,
    status: mapUiStatusToDb(form.status),
  };
}
