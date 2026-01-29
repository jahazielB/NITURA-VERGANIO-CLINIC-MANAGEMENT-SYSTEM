export function patientDisplayName(p) {
  if (!p) return "";
  if (p.name) return p.name;
  if (p.lastName || p.firstName)
    return `${p.lastName || ""}, ${p.firstName || ""}`.trim();
  return "";
}

/**
 * Enrich lab items with patientName + visitLabel + requestedBy fallback.
 * visits expected: [{ id, date, patientId, doctor }]
 * patients expected: [{ id, firstName, lastName } or { id, name }]
 */
export function enrichLabItems({ labItems = [], visits = [], patients = [] }) {
  const visitById = new Map((visits || []).map((v) => [v.id, v]));
  const patientById = new Map((patients || []).map((p) => [p.id, p]));

  return (labItems || []).map((x) => {
    const visit = visitById.get(x.visitId);
    const patient = visit?.patientId ? patientById.get(visit.patientId) : null;

    const patientName = x.patientName || patientDisplayName(patient) || "—";
    const visitLabel = x.visitLabel || visit?.date || x.visitId || "—";
    const requestedBy = x.requestedBy || visit?.doctor || "—";

    return {
      ...x,
      patientName,
      visitLabel,
      requestedBy,
      _visit: visit,
      _patient: patient,
    };
  });
}
