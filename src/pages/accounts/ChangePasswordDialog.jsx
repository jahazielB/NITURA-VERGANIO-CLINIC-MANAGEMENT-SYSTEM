import { useState } from "react";
import { Dialog, DialogTitle, IconButton, DialogContent, DialogActions, Button, Typography, Box, TextField, CircularProgress } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { logout } from "../../store/authSlice";
import CustomSnackbar from "../../components/modals/CustomSnackBar";

export default function ChangePasswordDialog({ open, onClose }) {
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const clearFields = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleClose = () => {
    clearFields();
    onClose();
  };

  const handleSubmit = async () => {
    if (!currentPassword.trim()) return setSnackbar({ open: true, message: "Current password is required.", severity: "error" });
    if (!newPassword.trim()) return setSnackbar({ open: true, message: "New password is required.", severity: "error" });
    if (!confirmPassword.trim()) return setSnackbar({ open: true, message: "Confirm password is required.", severity: "error" });
    if (newPassword.length < 8) return setSnackbar({ open: true, message: "New password must be at least 8 characters.", severity: "error" });
    if (newPassword !== confirmPassword) return setSnackbar({ open: true, message: "New password and confirm password do not match.", severity: "error" });
    if (newPassword === currentPassword) return setSnackbar({ open: true, message: "New password cannot be the same as current password.", severity: "error" });

    setSaving(true);

    try {
      const email = user?.email;
      if (!email) throw new Error("Unable to retrieve user email.");

      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });

      if (verifyError) {
        setSnackbar({ open: true, message: "Current password is incorrect.", severity: "error" });
        setSaving(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      clearFields();
      onClose();
      setSnackbar({
        open: true,
        message: "Password updated successfully.\nYou will be signed out and asked to log in again.",
        severity: "success",
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      try {
        await dispatch(logout()).unwrap();
      } finally {
        navigate("/login", { replace: true });
      }
    } catch (err) {
      console.error("Change Password Error", err);
      setSnackbar({ open: true, message: err?.message || "Unable to update password. Please try again.", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle className="flex items-center justify-between">
          Change Password
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Box sx={{ display: "grid", gap: 2 }}>
            <TextField
              label="Current Password"
              type="password"
              size="small"
              fullWidth
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <TextField
              label="New Password"
              type="password"
              size="small"
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <TextField
              label="Confirm Password"
              type="password"
              size="small"
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Box>
        </DialogContent>

        <DialogActions className="px-6 py-4">
          <Button onClick={handleClose} variant="outlined" disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={saving}>
            {saving ? (
              <>
                <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
                Updating Password...
              </>
            ) : (
              "Change Password"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <CustomSnackbar
        open={snackbar.open}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </>
  );
}
