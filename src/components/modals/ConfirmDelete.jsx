import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  CircularProgress,
} from "@mui/material";
const ConfirmDeleteCancel = ({
  open,
  cancel,
  handleDelete,
  loading,
  title = "Confirm Delete",
  description = "Are you sure you want to delete this record? This action cannot be undone.",
  confirmLabel = "Delete",
  confirmColor = "error",
}) => {
  return (
    <div>
      <Dialog
        open={open}
        onClose={(_, reason) => {
          if (loading) return;
          if (reason === "backdropClick" || reason === "escapeKeyDown") {
            cancel();
          }
        }}
        disableEscapeKeyDown={loading}
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{description}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            disabled={loading}
            color={confirmColor}
            variant="contained"
            onClick={() => handleDelete()}
            startIcon={
              loading ? <CircularProgress size={20} color="inherit" /> : null
            }
          >
            {loading
              ? confirmLabel === "Delete"
                ? "Deleting"
                : "Cancelling"
              : confirmLabel}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
export default ConfirmDeleteCancel;
