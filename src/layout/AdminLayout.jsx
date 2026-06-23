import { Box } from "@mui/material";
import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
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

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((s) => s.auth);

  const handleOpen = () => setMobileOpen(true);
  const handleClose = () => setMobileOpen(false);

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

      {/* <div className="flex flex-col">
        
      </div> */}
    </Box>
  );
}
