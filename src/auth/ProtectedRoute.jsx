import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ProtectedRoute({ allowRoles = [] }) {
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      setLoading(true);

      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes?.user || userRes?.data?.user; // handles slight shape differences

      if (!user) {
        if (!mounted) return;
        setOk(false);
        setLoading(false);
        return;
      }

      const { data: prof, error } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        console.error("profiles fetch error:", error);
        setOk(false);
        setLoading(false);
        return;
      }

      const r = prof?.role ?? null;
      setRole(r);

      // if allowRoles empty => any authenticated user is ok
      const allowed = allowRoles.length === 0 ? true : allowRoles.includes(r);
      setOk(allowed);
      setLoading(false);
    };

    run();

    // optional: respond to auth changes
    const { data: sub } = supabase.auth.onAuthStateChange(() => run());

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, [allowRoles.join("|")]);

  if (loading) return <div className="p-4">Loading...</div>;

  if (!ok) {
    // not logged in => go login
    if (!role) return <Navigate to="/login" replace />;
    // logged in but wrong role => send them to their correct dashboard
    return <Navigate to={`/${role}/dashboard`} replace />;
  }

  return <Outlet />;
}
