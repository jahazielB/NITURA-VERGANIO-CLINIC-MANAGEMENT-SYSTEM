import { supabase } from "../lib/supabase";
import { todayISO } from "../components/helpers/labHelpers";

const QUEUE_SELECT = `
  *,
  patients ( id, first_name, middle_name, last_name, contact_number ),
  visits ( id, visit_type, status, scheduled_for, chief_complaint )
`;

const UPDATE_ALLOWED_KEYS = new Set([
  "status",
  "display_name",
  "contact_number",
  "chief_complaint",
  "notes",
  "patient_id",
  "visit_id",
  "queue_number",
]);

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

function pickAllowedPatch(patch) {
  const safe = {};
  for (const [key, value] of Object.entries(patch ?? {})) {
    if (UPDATE_ALLOWED_KEYS.has(key)) {
      safe[key] = value;
    }
  }
  return safe;
}

async function getNextQueueNumber(queueDate) {
  const { data, error } = await supabase
    .from("queue_entries")
    .select("queue_number")
    .eq("queue_date", queueDate)
    .order("queue_number", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  assertNoError(error, "Failed to resolve next queue number");

  return (data?.queue_number ?? 0) + 1;
}

async function resolveCreatedBy() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    assertNoError(error, "Failed to resolve current user");
  }
  return data?.session?.user?.id ?? null;
}

export async function getTodayQueue() {
  const { data, error } = await supabase
    .from("queue_entries")
    .select(QUEUE_SELECT)
    .eq("queue_date", todayISO())
    .order("queue_number", { ascending: true, nullsFirst: false })
    .order("queued_at", { ascending: true });

  assertNoError(error, "Failed to fetch today's queue");
  return data ?? [];
}

export async function createQueueEntry(entry) {
  const display_name = (entry?.display_name ?? "").trim();
  if (!display_name) {
    throw new Error("Display name is required.");
  }

  const queue_date = entry.queue_date ?? todayISO();
  const [queue_number, created_by] = await Promise.all([
    getNextQueueNumber(queue_date),
    resolveCreatedBy(),
  ]);

  const payload = {
    display_name,
    queue_date,
    queue_number,
    status: entry.status ?? "Waiting",
    contact_number: trimOrNull(entry.contact_number),
    chief_complaint: trimOrNull(entry.chief_complaint),
    notes: trimOrNull(entry.notes),
    patient_id: entry.patient_id ?? null,
    visit_id: entry.visit_id ?? null,
    created_by,
  };

  const { data, error } = await supabase
    .from("queue_entries")
    .insert([payload])
    .select(QUEUE_SELECT)
    .single();

  assertNoError(error, "Failed to create queue entry");
  return data;
}

export async function updateQueueEntry(id, patch) {
  if (!id) {
    throw new Error("Queue entry id is required.");
  }

  const safePatch = pickAllowedPatch(patch);
  if (Object.keys(safePatch).length === 0) {
    throw new Error("No valid fields provided to update.");
  }

  const { data, error } = await supabase
    .from("queue_entries")
    .update(safePatch)
    .eq("id", id)
    .select(QUEUE_SELECT)
    .single();

  assertNoError(error, "Failed to update queue entry");
  return data;
}

export async function deleteQueueEntry(id) {
  if (!id) {
    throw new Error("Queue entry id is required.");
  }

  const { error } = await supabase.from("queue_entries").delete().eq("id", id);

  assertNoError(error, "Failed to delete queue entry");
  return { id };
}
