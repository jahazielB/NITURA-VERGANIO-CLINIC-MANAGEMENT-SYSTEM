import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
} from "@mui/material";

export default function PrescriptionViewModal({
  open,
  onClose,
  item,
  visitLabel,
}) {
  if (!item) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Prescription Details</DialogTitle>

      <DialogContent dividers>
        <Box className="space-y-2">
          <Typography variant="h6" className="font-bold">
            {item.medication}
          </Typography>

          <Box className="flex flex-wrap gap-2">
            <Chip
              label={item.status}
              color={item.status === "Active" ? "success" : "default"}
            />
            <Chip label={`Visit: ${visitLabel || item.visitId}`} />
            <Chip label={`Start: ${item.startDate}`} />
          </Box>

          <Typography>
            <b>Dosage:</b> {item.dosage}
          </Typography>
          <Typography>
            <b>Frequency:</b> {item.frequency}
          </Typography>
          <Typography>
            <b>Duration:</b> {item.duration}
          </Typography>

          {item.instructions && (
            <Typography>
              <b>Instructions:</b> {item.instructions}
            </Typography>
          )}
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
