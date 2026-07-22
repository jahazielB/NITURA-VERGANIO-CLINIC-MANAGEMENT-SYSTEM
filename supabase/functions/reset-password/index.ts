import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type ResetPasswordBody = {
  userId?: string;
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

function generateSecureTempPassword(length = 20): string {
  // Generate a cryptographically secure password from a mixed character set.
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);

  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

function friendlyError(message: string, status = 400): Response {
  return json({ success: false, error: message }, status);
}

function logAndReturnGenericError(error: unknown, status = 500): Response {
  console.error("Reset Password Error", error);
  return friendlyError(
    "Unable to reset password. Please contact the administrator.",
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
      const body = (await request.json()) as ResetPasswordBody;
      const userId = String(body.userId ?? "").trim();

      if (!userId) return friendlyError("Please provide userId.");

      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

      if (!supabaseUrl || !serviceRoleKey || !anonKey) {
        return logAndReturnGenericError(
          new Error("Missing Supabase environment variables."),
        );
      }

      // Use the service-role client for privileged operations that bypass RLS.
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });

      // Admin authorization:
      // 1. Validate the caller's JWT using the anon-key client.
      // 2. Load the caller's profile from user_profiles.
      // 3. Only allow if role === "Admin".
      const authHeader = request.headers.get("Authorization") ?? "";
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

      if (callerError || !caller?.id) {
        // Expired or invalid JWTs should not produce a generic server error.
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

      if (callerProfile?.role !== "Admin") {
        return friendlyError("Unauthorized.", 403);
      }

      // Prevent admins from accidentally resetting their own password
      // through the staff management screen.
      if (caller.id === userId) {
        return friendlyError(
          "Use the normal password change process for your own account.",
          400,
        );
      }

      // Verify the target user exists before generating a password.
      const { data: targetUser, error: targetUserError } =
        await supabaseAdmin
          .from("user_profiles")
          .select("id, full_name, email")
          .eq("id", userId)
          .maybeSingle();

      if (targetUserError) {
        return logAndReturnGenericError(targetUserError);
      }

      if (!targetUser) {
        return friendlyError("Account not found.", 404);
      }

      // Password generation: create a secure temporary password.
      const tempPassword = generateSecureTempPassword();

      // Password reset: update the target user's password via the Admin Auth API.
      const { error: updateError } =
        await supabaseAdmin.auth.admin.updateUserById(
          userId,
          { password: tempPassword },
        );

      if (updateError) {
        return logAndReturnGenericError(updateError);
      }

      // Best-effort session cleanup: mark the user offline so stale login
      // tracking is cleared immediately. The password reset is the primary
      // operation, so a failure here still returns success to the frontend.
      const { error: sessionError } = await supabaseAdmin
        .from("user_profiles")
        .update({
          is_logged_in: false,
          session_id: null,
          last_activity_at: new Date().toISOString(),
          password_reset_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (sessionError) {
        console.error("Reset Password Session Cleanup Error", sessionError);
      }

      try {
        await supabaseAdmin.rpc("log_activity", {
          p_user_id: caller.id,
          p_action: "password_reset",
          p_description: `Reset password for ${targetUser.full_name}`,
          p_severity: "warning",
        });
      } catch (logErr) {
        console.error("Activity Log Error", JSON.stringify(logErr));
      }

      return json({
        success: true,
        userId,
        tempPassword,
      });
    } catch (error) {
      return logAndReturnGenericError(error);
    }
  },
};
