import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  IconButton,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { fullName } from "./helper/accountHelpers";

export default function ResetPasswordDialog({
  open,
  onClose,
  account,
  onConfirm,
}) {
  const [saving, setSaving] = useState(false);

  if (!account) return null;

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

        <Typography variant="body2" color="text.secondary">
          A new temporary password will be generated. The user must sign in
          again using the new password provided by the administrator.
        </Typography>
      </DialogContent>

      <DialogActions className="px-6 py-4">
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={async () => {
            setSaving(true);
            try {
              await onConfirm();
            } finally {
              setSaving(false);
            }
          }}
          variant="contained"
          disabled={saving}
        >
          {saving ? (
            <>
              <CircularProgress size={16} sx={{ mr: 1 }} color="inherit" />
              Resetting...
            </>
          ) : (
            "Confirm Reset"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
