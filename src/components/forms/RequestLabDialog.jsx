import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Button,
  MenuItem,
} from "@mui/material";
import { todayISO } from "../helpers/labHelpers";

const TEST_TYPES = [
  "Blood Chemistry",
  "Blood Typing",
  "Clinical Chemistry",
  "Fecalysis",
  "HEMOGLOBIN(HBA1C)",
  "HEMATOLOGY",
  "KOH",
  "Urinalysis",
  "Serology",
  "Pregnancy Test",
];
const PRIORITIES = ["Routine", "Urgent"];

export default function RequestLabDialog({
  open,
  onClose,
  onSave,
  visits = [],
  latestVisitId = "",
}) {
  const [form, setForm] = useState({
    visitId: "",
    testType: "",
    priority: "Routine",
    notes: "",
    requestedBy: "Dr. Alex",
    requestedDate: todayISO(),
  });

  useEffect(() => {
    if (!open) return;
    setForm({
      visitId: latestVisitId || visits?.[0]?.id || "",
      testType: "",
      priority: "Routine",
      notes: "",
      requestedBy: "Dr. Alex",
      requestedDate: todayISO(),
    });
  }, [open, latestVisitId, visits]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const submit = () => {
    if (!form.visitId) return alert("Select a visit.");
    if (!form.testType) return alert("Select test type.");

    onSave({
      id: Date.now(),
      visitId: form.visitId,
      testType: form.testType,
      priority: form.priority,
      notes: form.notes.trim(),
      requestedBy: form.requestedBy,
      requestedDate: form.requestedDate,
      status: "Pending",
      // results
      resultSummary: "",
      impression: "",
      techNotes: "",
      performedBy: "",
      performedDate: "",
      releasedBy: "",
      releasedDate: "",
    });

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Request Lab Test</DialogTitle>

      <DialogContent>
        <Grid container spacing={2} mt={1}>
          <Grid item xs={12}>
            <TextField
              select
              label="Attach to Visit"
              name="visitId"
              value={form.visitId}
              onChange={handleChange}
              fullWidth
            >
              {visits.map((v) => (
                <MenuItem key={v.id} value={v.id}>
                  {v.date} • {v.doctor}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField
              select
              label="Test Type"
              name="testType"
              value={form.testType}
              onChange={handleChange}
              fullWidth
              placeholder="Select test type"
              slotProps={{
                inputLabel: { shrink: true },
                select: {
                  displayEmpty: true,
                  renderValue: (selected) => {
                    if (!selected) {
                      return (
                        <span style={{ color: "#9e9e9e" }}>
                          Select test type
                        </span>
                      );
                    }
                    return selected;
                  },
                },
              }}
            >
              {TEST_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Priority"
              name="priority"
              value={form.priority}
              onChange={handleChange}
              fullWidth
            >
              {PRIORITIES.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Requested Date"
              type="date"
              name="requestedDate"
              value={form.requestedDate}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Requested By"
              name="requestedBy"
              value={form.requestedBy}
              onChange={handleChange}
              fullWidth
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Clinical Notes / Indication (optional)"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              fullWidth
              multiline
              minRows={2}
              placeholder="e.g., Fever x3 days, rule out infection"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions className="px-6 pb-4">
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={submit} variant="contained">
          Save Request
        </Button>
      </DialogActions>
    </Dialog>
  );
}
