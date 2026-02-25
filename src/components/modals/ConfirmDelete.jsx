import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  CircularProgress,
} from "@mui/material";
const ConfirmDeleteCancel = ({ open, cancel, handleDelete, loading }) => {
  return (
    <div>
      <Dialog open={open}>
        <DialogTitle>{"Confirm Delete"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this record? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancel}>Cancel</Button>
          <Button
            disabled={loading}
            color="error"
            variant="contained"
            onClick={() => handleDelete()}
            startIcon={
              loading ? <CircularProgress size={20} color="inherit" /> : null
            }
          >
            {loading ? "Deleting" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
export default ConfirmDeleteCancel;
