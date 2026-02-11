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

/** Sign out */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
