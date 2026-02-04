import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import { statusColor } from "../helpers/labHelpers";
import BloodChemTemplate from "../labTemplates/BloodChemistry";

export default function ViewLabModal({ open, onClose, item, visitLabel = "" }) {
  if (!item) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        Lab Result Details
        {/* <Typography variant="body2" color="text.secondary">
          {item.testType || ""} • Visit: {visitLabel || ""} • Requested:{" "}
          {item.requestedDate || ""}
        </Typography> */}
      </DialogTitle>
      <BloodChemTemplate />
      <DialogContent dividers></DialogContent>

      <DialogActions className="px-6 py-4">
        <Button
          startIcon={<PrintIcon />}
          onClick={() => alert("Print lab result coming soon")}
        >
          Print
        </Button>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
