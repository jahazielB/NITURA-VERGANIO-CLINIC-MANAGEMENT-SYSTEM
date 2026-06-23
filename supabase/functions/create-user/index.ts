import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type CreateUserBody = {
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

function generateSecureTempPassword(length = 20): string {
  // Build a password from a mixed character set using cryptographically secure randomness.
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);

  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
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
  console.error("Create User Error", error);
  return friendlyError(
    "Unable to create account. Please contact the administrator.",
    status,
  );
}

export default {
  async fetch(request: Request): Promise<Response> {
    // Handle browser preflight requests before any application logic runs.
    if (request.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return friendlyError("Only POST requests are allowed.", 405);
    }

    try {
      // Read and validate the incoming payload.
      const body = (await request.json()) as CreateUserBody;
      const fullName = String(body.full_name ?? "").trim();
      const email = String(body.email ?? "")
        .trim()
        .toLowerCase();
      const role = String(body.role ?? "").trim();
      const lic = body.lic == null ? null : String(body.lic).trim() || null;

      if (!fullName) return friendlyError("Please provide full_name.");
      if (!email) return friendlyError("Please provide email.");
      if (!role) return friendlyError("Please provide role.");

      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

      if (!supabaseUrl || !serviceRoleKey) {
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

      // Create a secure temporary password that the frontend can display once.
      const tempPassword = generateSecureTempPassword();

      // Create the Supabase Auth user first so we can reuse the generated auth user id.
      const { data: createdUser, error: createUserError } =
        await supabaseAdmin.auth.admin.createUser({
          email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            full_name: fullName,
            role,
            lic,
          },
        });

      if (createUserError) {
        if (isDuplicateEmailError(createUserError)) {
          console.error("Create User Error", createUserError);
          return friendlyError(
            "An account with this email address already exists.",
            400,
          );
        }

        return logAndReturnGenericError(createUserError);
      }

      const userId = createdUser.user?.id;
      if (!userId) {
        return logAndReturnGenericError(
          new Error("Auth user created without a returned user id."),
        );
      }

      // Insert the public profile row that mirrors the auth user.
      // The login-tracking columns are initialized here so every new account
      // starts in a known logged-out state with no prior session metadata.
      const { error: profileError } = await supabaseAdmin
        .from("user_profiles")
        .insert({
          id: userId,
          full_name: fullName,
          email,
          role,
          lic,
          is_active: true,
          is_logged_in: false,
          session_id: null,
          last_login_at: null,
          last_activity_at: null,
        });

      if (profileError) {
        console.error("Create User Error", profileError);

        // Roll back the Auth user if the profile insert fails.
        // This prevents orphaned auth accounts that would otherwise block
        // future attempts with the same email address.
        const { error: rollbackError } =
          await supabaseAdmin.auth.admin.deleteUser(userId);

        if (rollbackError) {
          return logAndReturnGenericError(rollbackError);
        }

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
        tempPassword,
      });
    } catch (error) {
      return logAndReturnGenericError(error);
    }
  },
};
