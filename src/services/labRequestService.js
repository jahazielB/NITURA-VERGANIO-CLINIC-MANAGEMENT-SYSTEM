import { supabase } from "../lib/supabaseClient";
import { todayISO } from "../components/helpers/labHelpers";
import { templateValuesToLabResultItemsPayloads } from "../components/helpers/labResultMapper";
import { defaultVisitDateTime } from "../components/helpers/dateHelper";

const LAB_REQUEST_SELECT = `
  *,
  lab_services (
    id,
    name
  ),
  requested_by_profile:user_profiles!requested_by (
    id,
    full_name
  ),
  entered_by_profile:user_profiles!entered_by (
    id,
    full_name
  ),
  released_by_profile:user_profiles!released_by (
    id,
    full_name
  ),
  lab_result_items(*)
`;

const profileIdCache = new Map();
const labServiceIdCache = new Map();

function assertNoError(error, context) {
  if (error) {
    const err = new Error(error.message || context);
    err.cause = error;
    throw err;
  }
}

function trimOrNull(value) {
  const trimmed = (value ?? "").trim();
  return trimmed || null;
}

function toTimestampWithCurrentTime(dateValue) {
  const baseDate = trimOrNull(dateValue);
  if (!baseDate) return todayISO();

  if (baseDate.includes("T")) return baseDate;

  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");

  return `${baseDate}T${hh}:${mm}:${ss}`;
}

async function resolveProfileId(value) {
  const key = trimOrNull(value);
  if (!key) return null;

  if (profileIdCache.has(key)) return profileIdCache.get(key);

  const promise = (async () => {
    const byId = await supabase
      .from("user_profiles")
      .select("id")
      .eq("id", key)
      .maybeSingle();

    assertNoError(byId.error, "Failed to resolve user profile");
    if (byId.data?.id) return byId.data.id;

    const byName = await supabase
      .from("user_profiles")
      .select("id")
      .eq("full_name", key)
      .maybeSingle();

    assertNoError(byName.error, "Failed to resolve user profile");
    return byName.data?.id ?? null;
  })();

  profileIdCache.set(key, promise);
  return promise;
}

async function resolveLabServiceId(value) {
  const key = trimOrNull(value);
  if (!key) return null;

  if (labServiceIdCache.has(key)) return labServiceIdCache.get(key);

  const promise = (async () => {
    const byId = await supabase
      .from("lab_services")
      .select("id")
      .eq("id", key)
      .maybeSingle();

    assertNoError(byId.error, "Failed to resolve lab service");
    if (byId.data?.id) return byId.data.id;

    const byName = await supabase
      .from("lab_services")
      .select("id")
      .eq("name", key)
      .maybeSingle();

    assertNoError(byName.error, "Failed to resolve lab service");
    return byName.data?.id ?? null;
  })();

  labServiceIdCache.set(key, promise);
  return promise;
}

export function mapLabRequestRow(row) {
  if (!row) return null;

  return {
    id: row.id,
    visitId: row.visit_id ?? "",
    testType: row.lab_services?.name ?? "",
    priority: row.priority ?? "Routine",
    notes: row.notes ?? "",
    requestedBy: row.requested_by_profile?.full_name ?? "",
    requestedDate: row.created_at ?? "",
    status: row.status ?? "Pending",
    performedBy: row.entered_by_profile?.full_name ?? "",
    releasedBy: row.released_by_profile?.full_name ?? "",
    lab_result_items: row.lab_result_items ?? [],
  };
}

function mapSidebarLabRequestRow(row) {
  if (!row) return null;

  const visit = row.visit ?? {};
  const patientList = Array.isArray(visit.patients) ? visit.patients : [];
  const patient = visit.patient ?? patientList[0] ?? {};
  const firstName = (patient.first_name ?? patient.firstName ?? "").trim();
  const middleName = (patient.middle_name ?? patient.middleName ?? "").trim();
  const lastName = (patient.last_name ?? patient.lastName ?? "").trim();
  const patientName = row.patientName
    ? row.patientName
    : [lastName, [firstName, middleName].filter(Boolean).join(" ")]
        .filter(Boolean)
        .join(", ");

  return {
    id: row.id,
    visitId: row.visit_id ?? "",
    visitLabel:
      visit.scheduled_for ?? visit.visit_date ?? visit.created_at ?? row.visit_id ?? "",
    patientName,
    testType: row.lab_services?.name ?? "",
    priority: row.priority ?? "Routine",
    requestedBy: row.requested_by_profile?.full_name ?? "",
    requestedDate: row.created_at ?? "",
    status: row.status ?? "Pending",
  };
}
export async function getLabRequestsByVisitIds(
  visitIds = [],
  { page = 1, pageSize = 5 } = {},
) {
  if (!visitIds.length) return { rows: [], total: 0 };

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count, error } = await supabase
    .from("lab_requests")
    .select(LAB_REQUEST_SELECT, { count: "exact" })
    .in("visit_id", visitIds)
    .order("created_at", { ascending: false })
    .range(from, to);
  assertNoError(error, "Failed to fetch lab requests");

  return { rows: (data ?? []).map(mapLabRequestRow), total: count ?? 0 };
}
export async function getLabRequests({ page = 1, limit = 10 } = {}) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count, error } = await supabase
    .from("lab_requests")
    .select(LAB_REQUEST_SELECT, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  assertNoError(error, "Failed to fetch lab requests");
  return {
    rows: (data ?? []).map(mapSidebarLabRequestRow),
    total: count ?? 0,
  };
}

export function subscribeToLabRequestChanges(callback) {
  return supabase
    .channel("lab_requests_changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "lab_requests" },
      callback,
    )
    .subscribe();
}

export async function createLabRequest(payload) {
  const [labServiceId, requestedById, enteredById, releasedById] =
    await Promise.all([
      resolveLabServiceId(payload.testType ?? payload.labServiceId),
      resolveProfileId(payload.requestedBy),
      resolveProfileId(payload.enteredBy),
      resolveProfileId(payload.releasedBy),
    ]);

  const insertPayload = {
    visit_id: payload.visitId,
    lab_service_id: labServiceId,
    priority: payload.priority ?? "Routine",
    notes: trimOrNull(payload.notes),
    requested_by: requestedById,
    entered_by: enteredById,
    released_by: releasedById,

    status: payload.status ?? "Pending",
  };

  const { data, error } = await supabase
    .from("lab_requests")
    .insert([insertPayload])
    .select(LAB_REQUEST_SELECT)
    .single();

  assertNoError(error, "Failed to create lab request");
  return mapLabRequestRow(data);
}

export async function updateLabRequest(id, patch) {
  if (!id) {
    throw new Error("Lab request id is required.");
  }

  const updatePayload = {};
  const [labServiceId, requestedById, enteredById, releasedById] =
    await Promise.all([
      "testType" in patch
        ? resolveLabServiceId(patch.testType)
        : Promise.resolve(null),
      "requestedBy" in patch
        ? resolveProfileId(patch.requestedBy)
        : Promise.resolve(null),
      "performedBy" in patch
        ? resolveProfileId(patch.performedBy)
        : Promise.resolve(null),
      "releasedBy" in patch
        ? resolveProfileId(patch.releasedBy)
        : Promise.resolve(null),
    ]);

  if ("visitId" in patch) updatePayload.visit_id = patch.visitId;
  if ("testType" in patch) updatePayload.lab_service_id = labServiceId;
  if ("priority" in patch) updatePayload.priority = patch.priority;
  if ("notes" in patch) updatePayload.notes = trimOrNull(patch.notes);
  if ("requestedBy" in patch) updatePayload.requested_by = requestedById;
  if ("requestedDate" in patch)
    updatePayload.created_at = toTimestampWithCurrentTime(patch.requestedDate);
  if ("status" in patch) updatePayload.status = patch.status;
  if ("performedBy" in patch) updatePayload.entered_by = enteredById;
  if ("releasedBy" in patch) updatePayload.released_by = releasedById;

  const { data, error } = await supabase
    .from("lab_requests")
    .update(updatePayload)
    .eq("id", id)
    .select(LAB_REQUEST_SELECT)
    .single();

  assertNoError(error, "Failed to update lab request");
  return mapLabRequestRow(data);
}

export async function deleteLabRequest(id) {
  if (!id) {
    throw new Error("Lab request id is required.");
  }

  const { error } = await supabase.from("lab_requests").delete().eq("id", id);

  assertNoError(error, "Failed to delete lab request");
}

export async function saveLabResults(labRequestId, templateValues) {
  if (!labRequestId) {
    throw new Error("Lab request id is required.");
  }

  const rows = templateValuesToLabResultItemsPayloads(templateValues, {
    extraFields: { lab_request_id: labRequestId },
  });

  const { error: deleteError } = await supabase
    .from("lab_result_items")
    .delete()
    .eq("lab_request_id", labRequestId);

  assertNoError(deleteError, "Failed to clear existing lab result items");

  if (rows.length > 0) {
    const { error: insertError } = await supabase
      .from("lab_result_items")
      .insert(rows);

    assertNoError(insertError, "Failed to save lab result items");
  }

  return updateLabRequest(labRequestId, { status: "Ready" });
}
