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
import NotificationsIcon from "@mui/icons-material/Notifications";

import Logo from "./Logo";

import { useNavigate, useLocation } from "react-router-dom";

import { NAV_BY_ROLE, ROLE_TOPBAR } from "../layout/navConfig";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";
/**
 * role: "Admin" | "Doctor" | "Med Tech" | "Nurse"
 * basePath: "/admin" | "/doctor" | "/medtech" | "/nurse"
 */

export const drawerWidth = 250;

/** Drawer content reused for mobile + desktop */
export const SidebarContent = ({ onItemClick, basePath }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { role } = useSelector((s) => s.auth);

  const menuItems = NAV_BY_ROLE[role];

  const handleLogout = async () => {
    await dispatch(logout()).unwrap();
    navigate("/");
  };

  return (
    <Box className="flex flex-col h-full">
      <div className="flex justify-center mt-5">
        <Logo />
      </div>

      <List className="flex-1 text-gray-200 cursor-pointer px-2">
        {menuItems.map((item) => {
          const isActive = location.pathname.startsWith(
            `/${role}/${item.path}`,
          );

          return (
            <ListItem
              key={item.text}
              button
              onClick={() => {
                navigate(item.path);
                onItemClick?.(); // close mobile drawer if exists
              }}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                backgroundColor: isActive ? "#1e293b" : "transparent",
                "&:hover": {
                  backgroundColor: "#3c495e",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: "#ffffff",
                  minWidth: 36,
                }}
              >
                {item.icon}
              </ListItemIcon>

              <ListItemText
                primary={item.text}
                sx={{
                  "& .MuiTypography-root": {
                    fontWeight: isActive ? 600 : 400,
                    color: "#ffffff",
                  },
                }}
              />
            </ListItem>
          );
        })}
      </List>

      <Box className="p-4 border-t border-slate-600 cursor-pointer">
        <ListItem button onClick={() => handleLogout()}>
          <ListItemIcon sx={{ color: "#cbd5e1" }}>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
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
        backgroundColor: "#338bd4",
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

export const TopBar = ({ onMenuClick }) => {
  const { role } = useSelector((s) => s.auth);
  const meta = ROLE_TOPBAR[role];
  const color = meta.color;
  return (
    <AppBar
      position="static"
      color="inherit"
      elevation={0}
      sx={{ backgroundColor: meta.color }}
    >
      <Toolbar className={`flex justify-between  py-5`}>
        <Box className="flex items-center gap-2 ">
          {/* Hamburger only on small screens */}
          <IconButton
            onClick={onMenuClick}
            sx={{ display: { xs: "inline-flex", md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Box>
            <Typography variant="h6">{meta.title}</Typography>
            <Typography variant="body2" sx={{ color: "#757575" }}>
              {meta.subtitle}
            </Typography>
          </Box>
        </Box>

        <Box className="flex items-center gap-4">
          <IconButton>
            <NotificationsIcon />
          </IconButton>
          <Avatar>{meta.avatar}</Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
