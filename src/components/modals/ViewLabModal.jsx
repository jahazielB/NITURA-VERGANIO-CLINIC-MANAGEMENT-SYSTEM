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

export default function ViewLabModal({ open, onClose, item, visitLabel = "" }) {
  if (!item) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        Lab Result Details
        <Typography variant="body2" color="text.secondary">
          {item.testType} • Visit: {visitLabel} • Requested:{" "}
          {item.requestedDate}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Box className="flex flex-wrap gap-2 mb-3">
          <Chip
            label={item.status}
            color={statusColor(item.status)}
            size="small"
          />
          <Chip label={`Priority: ${item.priority}`} size="small" />
          <Chip label={`Requested by: ${item.requestedBy}`} size="small" />
          {item.performedBy && (
            <Chip label={`Performed by: ${item.performedBy}`} size="small" />
          )}
          {item.performedDate && (
            <Chip label={`Performed: ${item.performedDate}`} size="small" />
          )}
          {item.releasedDate && (
            <Chip label={`Released: ${item.releasedDate}`} size="small" />
          )}
        </Box>

        <Divider className="mb-3" />

        <Typography className="font-semibold mb-1">Result Summary</Typography>
        <Typography variant="body2" className="whitespace-pre-wrap">
          {item.resultSummary || "—"}
        </Typography>

        <Box className="mt-4">
          <Typography className="font-semibold mb-1">Impression</Typography>
          <Typography variant="body2" className="whitespace-pre-wrap">
            {item.impression || "—"}
          </Typography>
        </Box>

        <Box className="mt-4">
          <Typography className="font-semibold mb-1">
            Technician Notes
          </Typography>
          <Typography variant="body2" className="whitespace-pre-wrap">
            {item.techNotes || "—"}
          </Typography>
        </Box>

        {item.notes && (
          <Box className="mt-4">
            <Typography className="font-semibold mb-1">
              Clinical Notes
            </Typography>
            <Typography variant="body2" className="whitespace-pre-wrap">
              {item.notes}
            </Typography>
          </Box>
        )}
      </DialogContent>

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
