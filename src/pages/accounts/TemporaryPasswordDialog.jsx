import {
  Dialog,
  DialogTitle,
  IconButton,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

export default function TemporaryPasswordDialog({
  open,
  onClose,
  fullName,
  email,
  password,
}) {
  if (!open) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(password || "");
      alert("Copied!");
    } catch {
      alert("Copy not supported in this browser.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle className="flex items-center justify-between">
        Temporary Password
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          The new account has been created. Share the details below with the
          user.
        </Typography>

        <Box sx={{ display: "grid", gap: 2 }}>
          <TextField label="Full Name" size="small" fullWidth value={fullName || ""} InputProps={{ readOnly: true }} />
          <TextField label="Email" size="small" fullWidth value={email || ""} InputProps={{ readOnly: true }} />
          <TextField
            label="Temporary Password"
            size="small"
            fullWidth
            value={password || ""}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <Box className="flex items-center gap-1 pr-1">
                  <IconButton size="small" onClick={copy} title="Copy password">
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Box>
              ),
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions className="px-6 py-4">
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
