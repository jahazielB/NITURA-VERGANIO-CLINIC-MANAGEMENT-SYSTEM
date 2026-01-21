import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Drawer,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import EventIcon from "@mui/icons-material/Event";
import PeopleIcon from "@mui/icons-material/People";
import ScienceIcon from "@mui/icons-material/Science";
import PaymentsIcon from "@mui/icons-material/Payments";
import NotificationsIcon from "@mui/icons-material/Notifications";

import Logo from "./Logo";

import { useNavigate, useLocation } from "react-router-dom";

export const drawerWidth = 250;

/** Drawer content reused for mobile + desktop */
export const SidebarContent = ({ onItemClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <Box className="flex flex-col h-full">
      <div className="flex justify-center mt-5">
        <Logo />
      </div>

      <List className="flex-1 text-gray-200 cursor-pointer">
        {[
          {
            text: "Dashboard",
            icon: <DashboardIcon className="text-gray-300" />,
            path: "dashboard",
          },
          {
            text: "Appointments",
            icon: <EventIcon className="text-gray-300" />,
          },
          {
            text: "Patients",
            icon: <PeopleIcon className="text-gray-300" />,
            path: "patients",
          },
          {
            text: "Laboratory",
            icon: <ScienceIcon className="text-gray-300" />,
          },
          { text: "Billing", icon: <PaymentsIcon className="text-gray-300" /> },
        ].map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => {
              navigate(item.path);
              onItemClick;
            }}
          >
            <ListItemIcon className="text-white">{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>

      <Box className="p-4 border-t border-slate-600 cursor-pointer">
        <ListItem button onClick={onItemClick}>
          <ListItemIcon className="text-gray-300">
            <DashboardIcon className="text-gray-300" />
          </ListItemIcon>
          <ListItemText primary="Logout" className="text-gray-300" />
        </ListItem>
      </Box>
    </Box>
  );
};

/** Desktop: permanent drawer */
export const SidebarPermanent = () => (
  <Drawer
    variant="permanent"
    sx={{
      width: drawerWidth,
      display: { xs: "none", md: "block" },
      "& .MuiDrawer-paper": {
        width: drawerWidth,
        boxSizing: "border-box",
        backgroundColor: "#334155",
        color: "#fff",
        overflowX: "hidden",
      },
    }}
    open
  >
    <SidebarContent />
  </Drawer>
);

/** Mobile: temporary drawer */
export const SidebarMobile = ({ open, onClose }) => (
  <Drawer
    variant="temporary"
    open={open}
    onClose={onClose}
    ModalProps={{ keepMounted: true }} // better performance on mobile
    sx={{
      display: { xs: "block", md: "none" },
      "& .MuiDrawer-paper": {
        width: drawerWidth,
        boxSizing: "border-box",
        backgroundColor: "#334155",
        color: "#fff",
        overflowX: "hidden",
      },
    }}
  >
    {/* close drawer when user clicks a menu item */}
    <SidebarContent onItemClick={onClose} />
  </Drawer>
);

export const TopBar = ({ onMenuClick }) => (
  <AppBar position="static" color="inherit" elevation={0}>
    <Toolbar className="flex justify-between bg-slate-100 py-5">
      <Box className="flex items-center gap-2">
        {/* Hamburger only on small screens */}
        <IconButton
          onClick={onMenuClick}
          sx={{ display: { xs: "inline-flex", md: "none" } }}
        >
          <MenuIcon />
        </IconButton>

        <Box>
          <Typography variant="h6">Welcome, Admin</Typography>
          <Typography variant="body2" sx={{ color: "#94a3b8" }}>
            Manage clinic activities and view reports
          </Typography>
        </Box>
      </Box>

      <Box className="flex items-center gap-4">
        <IconButton>
          <NotificationsIcon />
        </IconButton>
        <Avatar>AD</Avatar>
      </Box>
    </Toolbar>
  </AppBar>
);
