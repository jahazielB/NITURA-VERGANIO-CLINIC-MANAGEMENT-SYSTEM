import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type UpdateUserBody = {
  userId?: string;
  full_name?: string;
  email?: string;
  role?: string;
  lic?: string | null;
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

function isDuplicateEmailError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const { code, message, status } = error as {
    code?: string;
    message?: string;
    status?: number;
  };

  const normalizedMessage = String(message ?? "").toLowerCase();

  return (
    code === "email_exists" ||
    status === 409 ||
    normalizedMessage.includes("already exists") ||
    normalizedMessage.includes("already been registered") ||
    normalizedMessage.includes("user already registered")
  );
}

function logAndReturnGenericError(error: unknown, status = 500): Response {
  console.error("Update User Error", error);
  return friendlyError(
    "Unable to update account. Please contact the administrator.",
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
      const body = (await request.json()) as UpdateUserBody;
      const userId = String(body.userId ?? "").trim();
      const fullName = String(body.full_name ?? "").trim();
      const email = String(body.email ?? "")
        .trim()
        .toLowerCase();
      const role = String(body.role ?? "").trim();
      const lic = body.lic == null ? null : String(body.lic).trim() || null;

      if (!userId) return friendlyError("Please provide userId.");
      if (!fullName) return friendlyError("Please provide full_name.");
      if (!email) return friendlyError("Please provide email.");
      if (!role) return friendlyError("Please provide role.");

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

      // Prevent the currently logged-in Admin from removing their own role.
      if (caller.id === userId && role !== "Admin") {
        return friendlyError(
          "You cannot remove your own Admin role.",
          400,
        );
      }

      // Verify the target user exists before making any changes.
      const { data: targetUser, error: targetUserError } =
        await supabaseAdmin
          .from("user_profiles")
          .select("id, email")
          .eq("id", userId)
          .maybeSingle();

      if (targetUserError) {
        return logAndReturnGenericError(targetUserError);
      }

      if (!targetUser) {
        return json({
          success: false,
          error: "Account not found.",
        });
      }

      // If the email changed, update it in Auth before updating the profile.
      // Compare in a case-insensitive manner to avoid unnecessary auth
      // updates when only the casing differs from the stored value.
      if (email !== (targetUser.email ?? "").toLowerCase()) {
        const { error: authUpdateError } =
          await supabaseAdmin.auth.admin.updateUserById(userId, {
            email,
            email_confirm: true,
          });

        if (authUpdateError) {
          if (isDuplicateEmailError(authUpdateError)) {
            console.error("Update User Error", authUpdateError);
            return friendlyError(
              "An account with this email address already exists.",
              400,
            );
          }

          return logAndReturnGenericError(authUpdateError);
        }
      }

      const { error: profileError } = await supabaseAdmin
        .from("user_profiles")
        .update({
          full_name: fullName,
          email,
          role,
          lic,
        })
        .eq("id", userId);

      if (profileError) {
        if (isDuplicateEmailError(profileError)) {
          return friendlyError(
            "An account with this email address already exists.",
            400,
          );
        }

        return logAndReturnGenericError(profileError);
      }

      return json({
        success: true,
        userId,
      });
    } catch (error) {
      return logAndReturnGenericError(error);
    }
  },
};
