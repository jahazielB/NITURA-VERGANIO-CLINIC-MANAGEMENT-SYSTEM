import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Grid,
  TextField,
  Box,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";

export default function EnterResultsDialog({ open, onClose, row, onSave }) {
  const [summary, setSummary] = useState("");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    if (!open) return;
    setSummary(row?.results?.summary || "");
    setRemarks(row?.results?.remarks || "");
  }, [open, row]);

  if (!row) return null;

  const submit = () => {
    if (!summary.trim()) return alert("Enter at least a result summary.");
    onSave({
      ...row,
      results: {
        ...(row.results || {}),
        summary: summary.trim(),
        remarks: remarks.trim(),
      },
      status: "Ready", // ✅ after entering results -> Ready
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle className="flex items-center justify-between">
        Enter Results ({row.testType}) — {row.id}
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box className="space-y-1">
          <Typography>
            Patient: <b>{row.patientName}</b>
          </Typography>
          <Typography>
            Visit ID: <b>{row.patientId}</b>
          </Typography>
          <Typography>
            Requested By: <b>{row.requestedBy}</b>
          </Typography>
          <Divider sx={{ my: 2 }} />
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Result Summary"
              size="small"
              fullWidth
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="e.g., WBC slightly elevated, FBS within range..."
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Remarks (optional)"
              size="small"
              fullWidth
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Optional notes / flags / recommendations..."
              multiline
              minRows={3}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary">
              *UI-only mock. Later you can replace with test templates (CBC
              fields, ranges, flags).
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions className="px-6 py-4">
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={submit} variant="contained">
          Save as Ready
        </Button>
      </DialogActions>
    </Dialog>
  );
}
