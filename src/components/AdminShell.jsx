import { useState } from "react";
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
  Menu,
  MenuItem,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import LogoutIcon from "@mui/icons-material/Logout";

import Logo from "./Logo";
import ProfileDialog from "../pages/accounts/ProfileDialog";
import ChangePasswordDialog from "../pages/accounts/ChangePasswordDialog";

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
  const { role } = useSelector((s) => s.auth);

  const menuItems = NAV_BY_ROLE[role];

  const isActive = (itemPath) => {
    const current = location.pathname.toLowerCase().replace(/\/+$/, "");
    const pattern = `/${role.toLowerCase()}/${itemPath.toLowerCase()}`;
    if (current === pattern) return true;
    if (current.startsWith(pattern + "/")) return true;
    if (itemPath.toLowerCase() === "dashboard" && current === `/${role.toLowerCase()}`) return true;
    return false;
  };

  return (
    <Box className="flex flex-col h-full">
      <div className="flex justify-center mt-5">
        <Logo />
      </div>

      <List className="flex-1 text-gray-200 cursor-pointer px-2">
        {menuItems.map((item) => {
          const active = isActive(item.path);

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
                backgroundColor: active ? "#1e293b" : "transparent",
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
                    fontWeight: active ? 600 : 400,
                    color: "#ffffff",
                  },
                }}
              />
            </ListItem>
          );
        })}
      </List>
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
        boxShadow: "4px 0 12px rgba(0,0,0,0.15)",
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
        boxShadow: "4px 0 12px rgba(0,0,0,0.15)",
      },
    }}
  >
    {/* close drawer when user clicks a menu item */}
    <SidebarContent onItemClick={onClose} />
  </Drawer>
);

export const TopBar = ({ onMenuClick }) => {
  const { role, userName } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const meta = ROLE_TOPBAR[role];
  const firstName = userName?.split(" ")[0] ?? "";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  const [anchorEl, setAnchorEl] = useState(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] =
    useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogoutClick = () => {
    handleMenuClose();
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = async () => {
    setLoggingOut(true);
    await dispatch(logout()).unwrap();
    navigate("/");
  };

  const handleLogoutCancel = () => {
    if (loggingOut) return;
    setLogoutDialogOpen(false);
  };

  const handleProfile = () => {
    handleMenuClose();
    setProfileDialogOpen(true);
  };

  const handleChangePassword = () => {
    handleMenuClose();
    setChangePasswordDialogOpen(true);
  };

  return (
    <AppBar
      position="static"
      color="inherit"
      elevation={1}
      sx={{ backgroundColor: meta.color }}
    >
      <Toolbar className="flex justify-between py-5">
        <Box className="flex items-center gap-2">
          {/* Hamburger only on small screens */}
          <IconButton
            onClick={onMenuClick}
            sx={{ display: { xs: "inline-flex", md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Box>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              <span style={{ color: "#000000" }}>{greeting},</span>{" "}
              <span style={{ color: "#1565c0" }}>{role} {firstName}</span>
            </Typography>
          </Box>
        </Box>

        <Box className="flex items-center gap-4">
          <IconButton>
            <NotificationsIcon />
          </IconButton>

          {/* Desktop: user info */}
          <Box className="hidden md:block text-right">
            <Typography variant="body2" fontWeight={600}>
              {userName}
            </Typography>
            <Typography variant="caption" sx={{ color: "#757575" }}>
              {role}
            </Typography>
          </Box>

          {/* Avatar that opens menu */}
          <IconButton onClick={handleMenuOpen} size="small">
            <Avatar>{meta.avatar}</Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleProfile}>
              <PersonIcon sx={{ mr: 1.5 }} fontSize="small" />
              My Profile
            </MenuItem>
            <MenuItem onClick={handleChangePassword}>
              <LockIcon sx={{ mr: 1.5 }} fontSize="small" />
              Change Password
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogoutClick}>
              <LogoutIcon sx={{ mr: 1.5 }} fontSize="small" />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>

      <Dialog open={logoutDialogOpen} onClose={handleLogoutCancel}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to log out?</Typography>
        </DialogContent>
        <DialogActions className="px-6 py-4">
          <Button onClick={handleLogoutCancel} variant="outlined" disabled={loggingOut}>
            Cancel
          </Button>
          <Button onClick={handleLogoutConfirm} variant="contained" color="error" disabled={loggingOut}>
            {loggingOut ? <CircularProgress size={20} sx={{ mr: 1, color: "inherit" }} /> : null}
            {loggingOut ? "Logging out..." : "Logout"}
          </Button>
        </DialogActions>
      </Dialog>

      <ProfileDialog
        open={profileDialogOpen}
        onClose={() => setProfileDialogOpen(false)}
      />
      <ChangePasswordDialog
        open={changePasswordDialogOpen}
        onClose={() => setChangePasswordDialogOpen(false)}
      />
    </AppBar>
  );
};
