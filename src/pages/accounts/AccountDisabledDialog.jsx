import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

export default function AccountDisabledDialog({ open, onConfirm }) {
  return (
    <Dialog
      open={open}
      onClose={() => {}}
      disableEscapeKeyDown
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle className="flex items-center justify-between">
        Account Disabled
      </DialogTitle>

      <DialogContent dividers>
        <Typography sx={{ mb: 1 }}>
          Your account has been disabled by an administrator.
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Please contact the administrator if you believe this is a mistake.
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
