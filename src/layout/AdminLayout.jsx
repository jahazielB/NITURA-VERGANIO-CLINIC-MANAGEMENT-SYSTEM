import { Box } from "@mui/material";
import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  SidebarPermanent,
  SidebarMobile,
  TopBar,
  drawerWidth,
} from "../components/AdminShell";
import { supabase } from "../lib/supabaseClient";
import { logout } from "../store/authSlice";
import CustomSnackbar from "../components/modals/CustomSnackBar";
import PasswordResetRequiredDialog from "../pages/accounts/PasswordResetRequiredDialog";
import AccountDisabledDialog from "../pages/accounts/AccountDisabledDialog";

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((s) => s.auth);

  const [passwordResetRequired, setPasswordResetRequired] = useState(false);
  const [accountDisabled, setAccountDisabled] = useState(false);
  const handledResetRef = useRef(null);
  const lastResetAtRef = useRef(undefined);
  const handledDisabledRef = useRef(null);
  const channelRef = useRef(null);
  const timerRef = useRef(null);

  const handleOpen = () => setMobileOpen(true);
  const handleClose = () => setMobileOpen(false);

  const handlePasswordResetOk = async () => {
    setPasswordResetRequired(false);

    try {
      await dispatch(logout()).unwrap();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const handleAccountDisabledOk = async () => {
    setAccountDisabled(false);

    try {
      await dispatch(logout()).unwrap();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  useEffect(() => {
    if (loading || !user?.id) return;

    // Defer subscription creation past the StrictMode double-mount cycle
    // so the first (unmounted) attempt never creates a channel.
    timerRef.current = setTimeout(async () => {
      // Fetch the current password_reset_at as a baseline so subsequent
      // UPDATE events are only treated as password resets when the value
      // actually changes (profile edits should not trigger the dialog).
      try {
        const { data } = await supabase
          .from("user_profiles")
          .select("password_reset_at")
          .eq("id", user.id)
          .maybeSingle();
        lastResetAtRef.current = data?.password_reset_at ?? null;
      } catch {
        lastResetAtRef.current = null;
      }

      const channel = supabase
        .channel(`user_profile_${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "user_profiles",
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
            const isDisableEvent =
              payload.new?.is_active === false &&
              payload.new?.disabled_at;

            if (isDisableEvent) {
              setAccountDisabled(true);
              return;
            }

            const newResetAt = payload.new?.password_reset_at;

            if (newResetAt && newResetAt !== lastResetAtRef.current) {
              lastResetAtRef.current = newResetAt;
              setPasswordResetRequired(true);
            }
          },
        )
        .subscribe();

      channelRef.current = channel;
    }, 0);

    return () => {
      clearTimeout(timerRef.current);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      lastResetAtRef.current = undefined;
      handledDisabledRef.current = null;
    }
  }, [user?.id]);

  return (
    <Box className="flex min-h-screen   bg-slate-100 overflow-x-hidden">
      {/* Desktop sidebar */}
      <SidebarPermanent />
      {/* Mobile sidebar */}
      <SidebarMobile open={mobileOpen} onClose={handleClose} />
      <Box className="w-full ">
        <TopBar onMenuClick={handleOpen} />
        <Outlet />
      </Box>

      <PasswordResetRequiredDialog
        open={passwordResetRequired}
        onConfirm={handlePasswordResetOk}
      />

      <AccountDisabledDialog
        open={accountDisabled}
        onConfirm={handleAccountDisabledOk}
      />
    </Box>
  );
}
