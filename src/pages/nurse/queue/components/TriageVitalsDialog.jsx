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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";

export default function TriageVitalsDialog({ open, onClose, row, onSave }) {
  const [vitals, setVitals] = useState({
    temp: "",
    bpS: "",
    bpD: "",
    pulse: "",
    weight: "",
    spo2: "",
  });
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) return;
    setVitals({
      temp: row?.vitals?.temp ?? "",
      bpS: row?.vitals?.bpS ?? "",
      bpD: row?.vitals?.bpD ?? "",
      pulse: row?.vitals?.pulse ?? "",
      weight: row?.vitals?.weight ?? "",
      spo2: row?.vitals?.spo2 ?? "",
    });
    setNotes(row?.triageNotes || "");
  }, [open, row]);

  if (!row) return null;

  const setField = (k, v) => setVitals((p) => ({ ...p, [k]: v }));

  const submit = () => {
    const nextVitals = {
      temp: Number(vitals.temp || 0),
      bpS: Number(vitals.bpS || 0),
      bpD: Number(vitals.bpD || 0),
      pulse: Number(vitals.pulse || 0),
      weight: Number(vitals.weight || 0),
      spo2: Number(vitals.spo2 || 0),
    };

    onSave({
      ...row,
      status: row.status === "Waiting" ? "In Triage" : row.status,
      vitals: nextVitals,
      triageNotes: notes,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle className="flex items-center justify-between">
        Triage / Vitals — {row.patientName}
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box className="space-y-2">
          <Typography variant="body2" color="text.secondary">
            Reason: <b>{row.reason}</b> • Time: <b>{row.time}</b>
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Temp (°C)"
                size="small"
                fullWidth
                value={vitals.temp}
                onChange={(e) => setField("temp", e.target.value)}
                inputMode="decimal"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Pulse"
                size="small"
                fullWidth
                value={vitals.pulse}
                onChange={(e) => setField("pulse", e.target.value)}
                inputMode="numeric"
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="BP Systolic"
                size="small"
                fullWidth
                value={vitals.bpS}
                onChange={(e) => setField("bpS", e.target.value)}
                inputMode="numeric"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="BP Diastolic"
                size="small"
                fullWidth
                value={vitals.bpD}
                onChange={(e) => setField("bpD", e.target.value)}
                inputMode="numeric"
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="Weight (kg)"
                size="small"
                fullWidth
                value={vitals.weight}
                onChange={(e) => setField("weight", e.target.value)}
                inputMode="decimal"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="SpO₂ (%)"
                size="small"
                fullWidth
                value={vitals.spo2}
                onChange={(e) => setField("spo2", e.target.value)}
                inputMode="numeric"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Triage Notes (optional)"
                size="small"
                fullWidth
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                multiline
                minRows={3}
                placeholder="Short triage notes (symptoms, urgency, observations)..."
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions className="px-6 py-4">
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={submit} variant="contained">
          Save Vitals
        </Button>
      </DialogActions>
    </Dialog>
  );
}
