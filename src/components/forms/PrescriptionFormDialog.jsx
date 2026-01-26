import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Button,
  MenuItem,
  Typography,
  FormControlLabel,
  Switch,
} from "@mui/material";

const empty = {
  medication: "",
  dosage: "",
  frequency: "",
  duration: "",
  instructions: "",
  startDate: "",
  chronic: false,
  visitId: "",
};

function pad2(n) {
  return String(n).padStart(2, "0");
}
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export default function PrescriptionFormDialog({
  open,
  onClose,
  onSave,
  initial = null,
  latestVisitId = "",
  visits = [], // [{id, date}]
}) {
  const [form, setForm] = useState(empty);

  const visitOptions = useMemo(() => visits, [visits]);

  useEffect(() => {
    if (!open) return;

    if (initial) {
      setForm({
        ...empty,
        ...initial,
        startDate: initial.startDate || todayISO(),
      });
      return;
    }

    setForm({
      ...empty,
      startDate: todayISO(),
      visitId: latestVisitId || (visitOptions[0]?.id ?? ""),
    });
  }, [open, initial, latestVisitId, visitOptions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleToggleChronic = (_, checked) => {
    setForm((p) => ({
      ...p,
      chronic: checked,
      duration: checked
        ? "Chronic"
        : p.duration === "Chronic"
          ? ""
          : p.duration,
    }));
  };

  const validate = () => {
    if (!form.medication.trim()) return "Medication name is required.";
    if (!form.dosage.trim()) return "Dosage is required.";
    if (!form.frequency.trim()) return "Frequency is required.";
    if (!form.startDate) return "Start date is required.";
    if (!form.chronic && !form.duration.trim())
      return "Duration is required (or mark as chronic).";
    if (!form.visitId) return "Visit attachment is required.";
    return null;
  };

  const handleSubmit = () => {
    const err = validate();
    if (err) return alert(err);

    const payload = {
      id: initial?.id ?? Date.now(),
      visitId: form.visitId,
      medication: form.medication.trim(),
      dosage: form.dosage.trim(),
      frequency: form.frequency.trim(),
      duration: form.chronic ? "Chronic" : form.duration.trim(),
      instructions: form.instructions.trim(),
      startDate: form.startDate,
      status: initial?.status ?? "Active",
      createdAt: initial?.createdAt ?? new Date().toISOString(),
    };

    onSave(payload);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {initial ? "Edit Prescription" : "Add Prescription"}
        <Typography variant="body2" color="text.secondary">
          Auto-attached to latest visit (change if needed).
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={2} mt={0.5}>
          <Grid item xs={12}>
            <TextField
              label="Medication"
              name="medication"
              value={form.medication}
              onChange={handleChange}
              fullWidth
              placeholder="e.g., Amoxicillin"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Dosage"
              name="dosage"
              value={form.dosage}
              onChange={handleChange}
              fullWidth
              placeholder="e.g., 500mg capsule"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Frequency"
              name="frequency"
              value={form.frequency}
              onChange={handleChange}
              fullWidth
              placeholder="e.g., 3x daily / as needed"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Start Date"
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Duration"
              name="duration"
              value={form.duration}
              onChange={handleChange}
              fullWidth
              disabled={form.chronic}
              placeholder="e.g., 7 days"
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch checked={form.chronic} onChange={handleToggleChronic} />
              }
              label="Chronic medication (no end date)"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Instructions (Sig)"
              name="instructions"
              value={form.instructions}
              onChange={handleChange}
              fullWidth
              multiline
              minRows={2}
              placeholder="e.g., Take after meals"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              select
              label="Attach to Visit"
              name="visitId"
              value={form.visitId}
              onChange={handleChange}
              fullWidth
            >
              {visitOptions.map((v) => (
                <MenuItem key={v.id} value={v.id}>
                  {v.date}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions className="px-6 pb-4">
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
