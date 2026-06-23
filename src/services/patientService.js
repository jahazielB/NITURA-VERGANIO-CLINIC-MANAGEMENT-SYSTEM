import { supabase } from "../lib/supabase";

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

function pickLatestDate(a, b) {
  if (!a) return b ?? null;
  if (!b) return a;
  return new Date(b).getTime() > new Date(a).getTime() ? b : a;
}

function buildPatientPayload(input) {
  const first_name = (input.first_name ?? "").trim();
  const last_name = (input.last_name ?? "").trim();
  const middle_name = (input.middle_name ?? "").trim();

  if (!first_name || !last_name || !middle_name) {
    throw new Error("First name, middle name, and last name are required.");
  }
  if (!input.birth_date) {
    throw new Error("Birth date is required.");
  }

  return {
    first_name,
    middle_name,
    last_name,
    birth_date: input.birth_date,
    contact_number: trimOrNull(input.contact_number),
    gender: input.gender || null,
    address: trimOrNull(input.address),
    email: trimOrNull(input.email),
    suffix: trimOrNull(input.suffix),
    notes: trimOrNull(input.notes),
  };
}

export async function searchPatients(query, { limit = 20 } = {}) {
  let request = supabase
    .from("patients")
    .select("*")
    .eq("is_active", true)
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true })
    .limit(limit);

  const term = query?.trim();
  if (term) {
    request = request.or(
      `first_name.ilike.%${term}%,last_name.ilike.%${term}%,middle_name.ilike.%${term}%,contact_number.ilike.%${term}%`,
    );
  }

  const { data, error } = await request;
  assertNoError(error, "Failed to search patients");

  return data ?? [];
}

export async function getPatientsPage({ page = 1, limit = 10, search = "" } = {}) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let request = supabase
    .from("patients")
    .select("*", { count: "exact" })
    .eq("is_active", true)
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true })
    .range(from, to);

  const term = search.trim();
  if (term) {
    const terms = term.split(/\s+/).filter(Boolean);
    const searchClauses = terms
      .map(
        (part) =>
          `first_name.ilike.%${part}%,last_name.ilike.%${part}%,middle_name.ilike.%${part}%,contact_number.ilike.%${part}%,address.ilike.%${part}%`,
      )
      .join(",");
    request = request.or(searchClauses);
  }

  const { data, count, error } = await request;
  assertNoError(error, "Failed to fetch patients");

  const rows = data ?? [];
  const patientIds = rows.map((patient) => patient.id).filter(Boolean);

  if (!patientIds.length) {
    return {
      rows,
      total: count ?? 0,
    };
  }

  const { data: visits, error: visitsError } = await supabase
    .from("visits")
    .select("id, patient_id")
    .in("patient_id", patientIds);
  assertNoError(visitsError, "Failed to fetch patient visits");

  const visitIds = (visits ?? []).map((visit) => visit.id).filter(Boolean);
  if (!visitIds.length) {
    return {
      rows: rows.map((patient) => ({
        ...patient,
        lastLabDate: null,
        lastLabTest: null,
      })),
      total: count ?? 0,
    };
  }

  const { data: labRequests, error: requestsError } = await supabase
    .from("lab_requests")
    .select("visit_id, requested_at, created_at, lab_services(name)")
    .in("visit_id", visitIds)
    .order("requested_at", { ascending: false });
  assertNoError(requestsError, "Failed to fetch patient lab requests");

  const visitToPatientId = new Map(
    (visits ?? []).map((visit) => [visit.id, visit.patient_id]),
  );
  const latestLabDateByPatientId = new Map();
  const latestLabTestByPatientId = new Map();

  (labRequests ?? []).forEach((request) => {
    const patientId = visitToPatientId.get(request.visit_id);
    if (!patientId) return;

    const requestDate = request.requested_at ?? request.created_at ?? null;
    if (!requestDate) return;

    const currentLatest = latestLabDateByPatientId.get(patientId) ?? null;
    latestLabDateByPatientId.set(
      patientId,
      pickLatestDate(currentLatest, requestDate),
    );

    if (!latestLabTestByPatientId.has(patientId)) {
      latestLabTestByPatientId.set(patientId, {
        testType: request.lab_services?.name ?? null,
      });
    }
  });

  return {
    rows: rows.map((patient) => ({
      ...patient,
      lastLabDate: latestLabDateByPatientId.get(patient.id) ?? null,
      lastLabTest: latestLabTestByPatientId.get(patient.id)?.testType ?? null,
    })),
    total: count ?? 0,
  };
}

export async function createPatient(input) {
  const payload = buildPatientPayload(input);

  const { data, error } = await supabase
    .from("patients")
    .insert([payload])
    .select()
    .single();

  assertNoError(error, "Failed to create patient");
  return data;
}

export async function getPatientById(id) {
  if (!id) {
    throw new Error("Patient id is required.");
  }

  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  assertNoError(error, "Failed to fetch patient");

  if (!data) {
    throw new Error("Patient not found");
  }

  return data;
}
