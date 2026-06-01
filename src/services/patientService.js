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
