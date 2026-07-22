import { Dialog, DialogTitle, IconButton, DialogContent, DialogActions, Button, Typography, Box, TextField } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useSelector } from "react-redux";

export default function ProfileDialog({ open, onClose }) {
  const { user, role, userName } = useSelector((s) => s.auth);
  const email = user?.email ?? "";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle className="flex items-center justify-between">
        My Profile
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: "grid", gap: 2 }}>
          <TextField label="Full Name" size="small" fullWidth value={userName || ""} InputProps={{ readOnly: true }} />
          <TextField label="Email" size="small" fullWidth value={email} InputProps={{ readOnly: true }} />
          <TextField label="Role" size="small" fullWidth value={role || ""} InputProps={{ readOnly: true }} />
        </Box>
      </DialogContent>

      <DialogActions className="px-6 py-4">
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
