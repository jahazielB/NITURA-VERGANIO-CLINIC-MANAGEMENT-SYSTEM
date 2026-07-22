import { supabase } from "../lib/supabaseClient";
import { todayISO } from "../components/helpers/labHelpers";
import { defaultVisitDateTime } from "../components/helpers/dateHelper";
import { templateValuesToUpsertPayloads } from "./labResultNormalizer";

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
    full_name,
    lic
  ),
  released_by_profile:user_profiles!released_by (
    id,
    full_name,
    lic,
    role
  ),
  lab_result_items(*)
`;

const LAB_REQUEST_SIDEBAR = `
  *,
  visit:visits!visit_id (
    id,
    created_at,
    scheduled_for,
    patient:patients!patient_id (
      id,
      first_name,
      middle_name,
      last_name,
      birth_date,
      gender,
      address
    )
  ),
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
    full_name,
    lic
  ),
  released_by_profile:user_profiles!released_by (
    id,
    full_name,
    lic,
    role
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

function getLocalDayRange(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
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

export async function resolveLabServiceId(value) {
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
    labServiceId: row.lab_services?.id ?? "",
    priority: row.priority ?? "Routine",
    notes: row.notes ?? "",
    requestedBy: row.requested_by_profile?.full_name ?? "",
    requestedDate: row.requested_at ?? row.created_at ?? "",
    status: row.status ?? "Pending",
    performedBy: row.entered_by_profile?.full_name ?? "",
    performedByLic: row.entered_by_profile?.lic ?? "",
    releasedBy: row.released_by_profile?.full_name ?? "",
    releasedByLic: row.released_by_profile?.lic ?? "",
    releasedByRole: row.released_by_profile?.role ?? "",
    lab_result_items: row.lab_result_items ?? [],
  };
}

function mapSidebarLabRequestRow(row) {
  if (!row) return null;

  const visit = row.visit ?? {};
  const patientList = Array.isArray(visit.patients) ? visit.patients : [];
  const patient = visit.patient ?? patientList[0] ?? {};
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const firstName = (patient.first_name ?? patient.firstName ?? "").trim();
  const middleName = (patient.middle_name ?? patient.middleName ?? "").trim();
  const lastName = (patient.last_name ?? patient.lastName ?? "").trim();
  const middleInitial = middleName
    ? `${middleName.charAt(0).toUpperCase()}.`
    : "";
  const patientName = row.patientName
    ? row.patientName
    : [firstName && cap(firstName), middleInitial, lastName && cap(lastName)]
        .filter(Boolean)
        .join(" ");

  return {
    id: row.id,
    visitId: row.visit_id ?? "",
    visitLabel:
      visit.scheduled_for ??
      visit.visit_date ??
      visit.created_at ??
      row.visit_id ??
      "",
    labServiceId: row.lab_services?.id ?? "",
    patientId: patient.id ?? "",
    patientName,
    birthDate: patient.birth_date ?? null,
    gender: patient.gender ?? null,
    address: patient.address ?? null,
    testType: row.lab_services?.name ?? "",
    priority: row.priority ?? "Routine",
    requestedBy: row.requested_by_profile?.full_name ?? "",
    requestedDate: row.requested_at ?? row.created_at ?? "",
    releasedDate: row.released_at ?? "",
    status: row.status ?? "Pending",
    performedBy: row.entered_by_profile?.full_name ?? "",
    performedByLic: row.entered_by_profile?.lic ?? "",
    releasedBy: row.released_by_profile?.full_name ?? "",
    releasedByLic: row.released_by_profile?.lic ?? "",
    releasedByRole: row.released_by_profile?.role ?? "",
    lab_result_items: row.lab_result_items ?? [],
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
export async function getLabRequests({
  page = 1,
  limit = 10,
  search = "",
  status,
} = {}) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("lab_requests")
    .select(LAB_REQUEST_SIDEBAR, { count: "exact" });

  if (status && status !== "All") {
    query = query.eq("status", status);
  }

  const q = search.trim();
  if (q) {
    const requestIds = new Set();

    try {
      const { data: matchingPatients } = await supabase
        .from("patients")
        .select("id")
        .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%`);

      if (matchingPatients?.length) {
        const { data: matchingVisits } = await supabase
          .from("visits")
          .select("id")
          .in(
            "patient_id",
            matchingPatients.map((p) => p.id),
          );

        const visitIds = matchingVisits?.map((v) => v.id) ?? [];
        if (visitIds.length) {
          const { data: byVisit } = await supabase
            .from("lab_requests")
            .select("id")
            .in("visit_id", visitIds);
          byVisit?.forEach((r) => requestIds.add(r.id));
        }
      }
    } catch {}

    try {
      const { data: matchingServices } = await supabase
        .from("lab_services")
        .select("id")
        .ilike("name", `%${q}%`);

      if (matchingServices?.length) {
        const { data: byService } = await supabase
          .from("lab_requests")
          .select("id")
          .in(
            "lab_service_id",
            matchingServices.map((s) => s.id),
          );
        byService?.forEach((r) => requestIds.add(r.id));
      }
    } catch {}

    if (!requestIds.size) return { rows: [], total: 0 };
    query = query.in("id", [...requestIds]);
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  assertNoError(error, "Failed to fetch lab requests");
  console.log(data);
  return {
    rows: (data ?? []).map(mapSidebarLabRequestRow),
    total: count ?? 0,
  };
}

export async function getTodayLabRequests({ status } = {}) {
  const { start, end } = getLocalDayRange();

  let query = supabase
    .from("lab_requests")
    .select(LAB_REQUEST_SIDEBAR, { count: "exact" })
    .gte("requested_at", start)
    .lte("requested_at", end)
    .order("requested_at", { ascending: false })
    .range(0, 100);

  if (status && status !== "All") {
    query = query.eq("status", status);
  }

  const { data, count, error } = await query;
  assertNoError(error, "Failed to fetch today's lab requests");

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
  if ("releasedDate" in patch)
    updatePayload.released_at = toTimestampWithCurrentTime(patch.releasedDate);
  if ("performedDate" in patch)
    updatePayload.entered_at = toTimestampWithCurrentTime(patch.performedDate);

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

export async function saveLabResults(
  labRequestId,
  templateValues,
  serviceName,
  serviceItems,
) {
  if (!labRequestId) {
    throw new Error("Lab request id is required.");
  }

  const payloads = templateValuesToUpsertPayloads(
    templateValues,
    serviceName,
    labRequestId,
    serviceItems,
  );

  if (payloads.length > 0) {
    const { error } = await supabase.from("lab_result_items").upsert(payloads, {
      onConflict: "lab_request_id,lab_service_item_id",
      ignoreDuplicates: false,
    });

    assertNoError(error, "Failed to upsert lab result items");
  }

  const { data: userData } = await supabase.auth.getUser();
  const authUserId = userData?.user?.id;
  let profileId = null;
  if (authUserId) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("id", authUserId)
      .maybeSingle();
    profileId = profile?.id ?? null;
  }

  return updateLabRequest(labRequestId, {
    status: "Ready",
    performedBy: profileId,
    performedDate: todayISO(),
  });
}
