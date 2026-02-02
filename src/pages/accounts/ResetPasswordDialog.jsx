import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import { useEffect, useState } from "react";
import { generateTempPassword, fullName } from "./helper/accountHelpers";

export default function ResetPasswordDialog({
  open,
  onClose,
  account,
  onConfirm,
}) {
  const [temp, setTemp] = useState("");

  useEffect(() => {
    if (!open) return;
    setTemp(generateTempPassword());
  }, [open]);

  if (!account) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(temp);
      alert("Copied!");
    } catch {
      alert("Copy not supported in this browser.");
    }
  };

  const submit = () => {
    // UI-only: you can store tempPassword back to account to show it's been reset
    onConfirm(temp);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle className="flex items-center justify-between">
        Reset Password
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Typography sx={{ mb: 1 }}>
          Account: <b>{fullName(account)}</b>
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          This will generate a temporary password (UI-only).
        </Typography>

        <TextField
          label="Temporary Password"
          size="small"
          fullWidth
          value={temp}
          onChange={(e) => setTemp(e.target.value)}
          InputProps={{
            endAdornment: (
              <Box className="flex items-center gap-1">
                <IconButton
                  size="small"
                  onClick={() => setTemp(generateTempPassword())}
                >
                  <AutoFixHighIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={copy}>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Box>
            ),
          }}
        />

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 1 }}
        >
          Suggested: require password change on next login (implement later).
        </Typography>
      </DialogContent>

      <DialogActions className="px-6 py-4">
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={submit} variant="contained">
          Confirm Reset
        </Button>
      </DialogActions>
    </Dialog>
  );
}
