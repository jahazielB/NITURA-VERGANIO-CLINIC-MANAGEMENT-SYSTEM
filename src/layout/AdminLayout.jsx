import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import { useState } from "react";
import {
  SidebarPermanent,
  SidebarMobile,
  TopBar,
  drawerWidth,
} from "../components/AdminShell";

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleOpen = () => setMobileOpen(true);
  const handleClose = () => setMobileOpen(false);
  return (
    <Box className="flex min-h-screen gap-1.5  bg-slate-100 overflow-x-hidden">
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
