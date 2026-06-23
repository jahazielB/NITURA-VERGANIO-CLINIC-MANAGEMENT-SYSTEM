import { supabase } from "../lib/supabaseClient";

/** Get current user (fast) */
export function getUser() {
  return supabase.auth.getUser();
}

/** Fetch role from profiles table */
export async function getMyRole() {
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;

  const user = userRes?.data?.user;
  if (!user) return null;

  const { data, error } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw error;
  return data?.role ?? null;
}

/** Sign in */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

/**
 * Keep the profile row in sync with the current login session.
 * We write this as a side effect after auth succeeds so the existing
 * authentication flow still behaves the same if tracking ever fails.
 */
export async function markUserLoggedIn(userId, sessionId) {
  const payload = {
    action: "login",
    user_id: userId,
    session_id: sessionId,
  };

  // Prefer the server-side function because it can update the profile row
  // even when direct table writes are protected by RLS.
  const { error: fnError } = await supabase.functions.invoke("track-login", {
    body: payload,
  });

  if (!fnError) {
    return;
  }

  // Fall back to the direct table update so local/dev setups still work if the
  // function has not been deployed yet.
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("user_profiles")
    .update({
      last_login_at: now,
      last_activity_at: now,
      session_id: sessionId,
      is_logged_in: true,
    })
    .eq("id", userId);

  if (error) {
    console.warn("Unable to update login tracking on user_profiles:", {
      functionError: fnError,
      tableError: error,
    });
  }
}

/**
 * Clear the active session marker before signing out so the account module
 * can immediately show the user as offline.
 */
export async function markUserLoggedOut(userId) {
  const payload = {
    action: "logout",
    user_id: userId,
  };

  const { error: fnError } = await supabase.functions.invoke("track-login", {
    body: payload,
  });

  if (!fnError) {
    return;
  }

  const { error } = await supabase
    .from("user_profiles")
    .update({
      is_logged_in: false,
      session_id: null,
    })
    .eq("id", userId);

  if (error) {
    console.warn("Unable to clear login tracking on user_profiles:", {
      functionError: fnError,
      tableError: error,
    });
  }
}

/** Sign out */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
