import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function RootRedirect() {
  const [to, setTo] = useState(null);

  useEffect(() => {
    let alive = true;

    const run = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;

        const user = data?.user;
        if (!user) {
          if (!alive) return;
          setTo("/login");
          return;
        }

        const { data: prof, error: profErr } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (profErr) throw profErr;

        const role = prof?.role;
        if (!role) {
          if (!alive) return;
          // if you prefer, redirect to login or show message page
          setTo("/login");
          return;
        }

        if (!alive) return;
        setTo(`/${role}/dashboard`);
      } catch (e) {
        console.error("[RootRedirect] error:", e);
        if (!alive) return;
        setTo("/login");
      }
    };

    run();

    return () => {
      alive = false;
    };
  }, []);

  if (!to) return <div className="p-4">Loading...</div>;
  return <Navigate to={to} replace />;
}
