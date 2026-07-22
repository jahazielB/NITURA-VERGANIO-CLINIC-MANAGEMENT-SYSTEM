import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

function friendlyError(message: string, status = 400): Response {
  return json({ success: false, error: message }, status);
}

const TABLES_WITH_VISIT_ID = [
  "vitals",
  "soap_notes",
  "lab_requests",
  "prescription_orders",
  "billings",
  "queue_entries",
];

async function hasClinicalRecords(
  supabaseAdmin: ReturnType<typeof createClient>,
  visitId: string,
): Promise<string | null> {
  for (const table of TABLES_WITH_VISIT_ID) {
    const { count, error } = await supabaseAdmin
      .from(table)
      .select("*", { count: "exact", head: true })
      .eq("visit_id", visitId);

    if (error) {
      console.error(`Error checking ${table}:`, error);
      continue;
    }

    if (count && count > 0) {
      return `This visit already contains clinical records and cannot be deleted.`;
    }
  }
  return null;
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return friendlyError("Only POST requests are allowed.", 405);
  }

  try {
    const body = (await req.json()) as { visitId?: string };
    const visitId = String(body.visitId ?? "").trim();

    if (!visitId) {
      return friendlyError("visitId is required.", 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      console.error("Missing Supabase environment variables.");
      return friendlyError(
        "Unable to process request. Please contact the administrator.",
        500,
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Validate the caller's JWT
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseJwtClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: caller }, error: callerError } =
      await supabaseJwtClient.auth.getUser();

    if (callerError || !caller?.id) {
      return friendlyError("Authentication required.", 401);
    }

    // Look up the caller's role
    const { data: callerProfile, error: callerProfileError } =
      await supabaseJwtClient
        .from("user_profiles")
        .select("role")
        .eq("id", caller.id)
        .maybeSingle();

    if (callerProfileError) {
      console.error("Error fetching caller profile:", callerProfileError);
      return friendlyError(
        "Unable to verify permissions. Please contact the administrator.",
        500,
      );
    }

    if (!callerProfile) {
      return friendlyError("User profile not found.", 403);
    }

    const role = callerProfile.role;

    // Doctor cannot delete visits at all
    if (role === "Doctor") {
      return friendlyError("Doctors cannot delete visits.", 403);
    }

    // Only Admin and Nurse can delete visits
    if (role !== "Admin" && role !== "Nurse") {
      return friendlyError("You do not have permission to delete visits.", 403);
    }

    // Check for clinical records before allowing deletion
    const conflict = await hasClinicalRecords(supabaseAdmin, visitId);
    if (conflict) {
      return friendlyError(conflict, 400);
    }

    // Perform the deletion
    const { error: deleteError } = await supabaseAdmin
      .from("visits")
      .delete()
      .eq("id", visitId);

    if (deleteError) {
      console.error("Error deleting visit:", deleteError);
      return friendlyError(
        "Unable to delete visit. Please contact the administrator.",
        500,
      );
    }

    // Log activity (best-effort)
    try {
      await supabaseAdmin.rpc("log_activity", {
        p_user_id: caller.id,
        p_action: "visit_deleted",
        p_description: `Deleted visit ${visitId}`,
        p_severity: "info",
      });
    } catch (logErr) {
      console.error("Failed to log activity:", JSON.stringify(logErr));
    }

    return json({ success: true });
  } catch (error) {
    console.error("Delete Visit Error", error);
    return friendlyError(
      "Unable to delete visit. Please contact the administrator.",
      500,
    );
  }
});
