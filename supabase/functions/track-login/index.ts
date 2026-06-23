import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type TrackLoginBody = {
  action?: "login" | "logout";
  user_id?: string;
  session_id?: string | null;
};

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
  return json(
    {
      success: false,
      error: message,
    },
    status,
  );
}

Deno.serve(async (request: Request): Promise<Response> => {
  if (request.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (request.method !== "POST") {
    return friendlyError("Only POST requests are allowed.", 405);
  }

  try {
    const body = (await request.json()) as TrackLoginBody;

    const action = body.action;
    const userId = String(body.user_id ?? "").trim();

    const sessionId =
      body.session_id == null ? null : String(body.session_id).trim() || null;

    if (action !== "login" && action !== "logout") {
      return friendlyError('Invalid action. Use "login" or "logout".');
    }

    if (!userId) {
      return friendlyError("user_id is required.");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return friendlyError(
        "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY secret.",
        500,
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    if (action === "login") {
      const now = new Date().toISOString();

      const { error } = await supabaseAdmin
        .from("user_profiles")
        .update({
          last_login_at: now,
          last_activity_at: now,
          session_id: sessionId,
          is_logged_in: true,
        })
        .eq("id", userId);

      if (error) {
        console.error("LOGIN TRACKING ERROR:", error);

        return friendlyError(
          error.message || "Failed to update login tracking.",
          500,
        );
      }
    }

    if (action === "logout") {
      const { error } = await supabaseAdmin
        .from("user_profiles")
        .update({
          is_logged_in: false,
          session_id: null,
        })
        .eq("id", userId);

      if (error) {
        console.error("LOGOUT TRACKING ERROR:", error);

        return friendlyError(
          error.message || "Failed to update logout tracking.",
          500,
        );
      }
    }

    return json({
      success: true,
      action,
      userId,
      sessionId,
    });
  } catch (error) {
    console.error("TRACK LOGIN FUNCTION ERROR:", error);

    return friendlyError(
      error instanceof Error ? error.message : "Unexpected server error.",
      500,
    );
  }
});
