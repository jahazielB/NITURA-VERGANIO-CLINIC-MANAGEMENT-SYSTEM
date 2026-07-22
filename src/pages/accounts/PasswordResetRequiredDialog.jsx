import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

export default function PasswordResetRequiredDialog({ open, onConfirm }) {
  return (
    <Dialog
      open={open}
      onClose={() => {}}
      disableEscapeKeyDown
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle className="flex items-center justify-between">
        Password Reset Required
      </DialogTitle>

      <DialogContent dividers>
        <Typography sx={{ mb: 1 }}>
          Your password has been reset by an administrator.
        </Typography>

        <Typography variant="body2" color="text.secondary">
          For security reasons, you must sign in again using the temporary
          password provided by the administrator.
        </Typography>
      </DialogContent>

      <DialogActions className="px-6 py-4">
        <Button onClick={onConfirm} variant="contained">
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}
