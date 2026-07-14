import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type ToggleUserStatusBody = {
  userId?: string;
  isActive?: boolean;
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
  return json({ success: false, error: message }, status);
}

function logAndReturnGenericError(error: unknown, status = 500): Response {
  console.error("Toggle User Status Error", error);
  return friendlyError(
    "Unable to update account status. Please contact the administrator.",
    status,
  );
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return friendlyError("Only POST requests are allowed.", 405);
    }

    try {
      const body = (await request.json()) as ToggleUserStatusBody;
      const userId = String(body.userId ?? "").trim();
      const isActive = body.isActive;

      if (!userId) return friendlyError("Please provide userId.");
      if (typeof isActive !== "boolean") {
        return friendlyError("Please provide isActive.");
      }

      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

      if (!supabaseUrl || !serviceRoleKey || !anonKey) {
        return logAndReturnGenericError(
          new Error("Missing Supabase environment variables."),
        );
      }

      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });

      const authHeader = request.headers.get("Authorization") ?? "";
      // Validate the caller's JWT using the anon-key client so we can trust
      // the authenticated user id before checking authorization.
      const supabaseJwtClient = createClient(supabaseUrl, anonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      });

      const {
        data: { user: caller },
        error: callerError,
      } = await supabaseJwtClient.auth.getUser();

      if (callerError) {
        return logAndReturnGenericError(callerError);
      }

      if (!caller?.id) {
        return friendlyError("Authentication required.", 401);
      }

      const { data: callerProfile, error: callerProfileError } =
        await supabaseJwtClient
          .from("user_profiles")
          .select("role")
          .eq("id", caller.id)
          .maybeSingle();

      if (callerProfileError) {
        return logAndReturnGenericError(callerProfileError);
      }

      // Only Admin users can toggle other accounts' status.
      if (callerProfile?.role !== "Admin") {
        return friendlyError("Unauthorized.", 403);
      }

      // Block self-disable so a user cannot immediately lock themselves out
      // before they can hand off administrative control.
      if (caller?.id === userId && isActive === false) {
        return friendlyError("You cannot disable your own account.", 400);
      }

      // Fetch the target user's name before updating so the activity log
      // has a human-readable description regardless of the update outcome.
      const { data: targetUser } = await supabaseAdmin
        .from("user_profiles")
        .select("full_name")
        .eq("id", userId)
        .maybeSingle();

      const updatePayload = isActive
        ? {
            is_active: true,
          }
        : {
            is_active: false,
            is_logged_in: false,
            session_id: null,
            disabled_at: new Date().toISOString(),
        };

      // Keep the service-role client for the update so the function can write
      // the account state regardless of row-level security policies.
      const { error } = await supabaseAdmin
        .from("user_profiles")
        .update(updatePayload)
        .eq("id", userId);

      if (error) {
        return logAndReturnGenericError(error);
      }

      const targetName = targetUser?.full_name || "Unknown";
      const action = isActive ? "account_enabled" : "account_disabled";
      const description = isActive
        ? `Enabled account for ${targetName}`
        : `Disabled account for ${targetName}`;
      const severity = isActive ? "success" : "warning";

      try {
        await supabaseAdmin.rpc("log_activity", {
          p_user_id: caller.id,
          p_action: action,
          p_description: description,
          p_severity: severity,
        });
      } catch (logErr) {
        console.error("Activity Log Error", JSON.stringify(logErr));
      }

      return json({
        success: true,
        userId,
        isActive,
      });
    } catch (error) {
      return logAndReturnGenericError(error);
    }
  },
};
