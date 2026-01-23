// AddVisitDialog.jsx (React JSX + MUI + Tailwind-friendly)
// Assumes: MUI installed
// npm i @mui/material @mui/icons-material @emotion/react @emotion/styled

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Button,
  Typography,
  Divider,
  Switch,
  FormControlLabel,
  Box,
  InputAdornment,
  Chip,
  MenuItem,
} from "@mui/material";

/* ---------------- helpers ---------------- */

function pad2(n) {
  return String(n).padStart(2, "0");
}

// for <TextField type="datetime-local" />
function toLocalDatetimeValue(date) {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(
    d.getHours(),
  )}:${pad2(d.getMinutes())}`;
}

function numOrNull(v) {
  if (v === "" || v === null || typeof v === "undefined") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function calcBmi(weightKg, heightCm) {
  const w = numOrNull(weightKg);
  const h = numOrNull(heightCm);
  if (!w || !h) return null;
  const meters = h / 100;
  if (meters <= 0) return null;
  const bmi = w / (meters * meters);
  return Number.isFinite(bmi) ? bmi : null;
}

function bmiCategory(bmi) {
  if (bmi == null) return null;
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

/* ---------------- defaults ---------------- */

const VISIT_TYPES = ["Consultation", "Follow-up", "Walk-in", "Teleconsult"];

const defaultForm = {
  // visit info
  visitDateTime: "", // datetime-local string
  doctor: "",
  visitType: "Consultation",
  reason: "",
  notes: "",

  // vitals (optional inputs)
  tempC: "",
  bpS: "",
  bpD: "",
  pulse: "",
  weightKg: "",
  heightCm: "",
  spo2: "",

  // allergy flag
  allergyNoted: false,
  allergyDetails: "",
};

/**
 * Props:
 * open: boolean
 * onClose: () => void
 * onSave: (payload) => void
 *
 * Optional:
 * doctors: string[]   // e.g. ["Dr. Alex", "Dr. Bea"]
 * initialValues: object // for edit mode later (optional)
 */
export default function AddVisitDialog({
  open,
  onClose,
  onSave,
  doctors = ["Dr. Alex", "Dr. Bea"],
  initialValues = null,
}) {
  const [form, setForm] = useState(defaultForm);

  // Initialize on open
  // useEffect(() => {
  //   if (!open) return;

  //   if (initialValues) {
  //     // if editing later, ensure visitDateTime is in datetime-local format
  //     const vdt = initialValues.visitDateTime
  //       ? initialValues.visitDateTime
  //       : initialValues.visitDate || initialValues.date || "";

  //     setForm({
  //       ...defaultForm,
  //       ...initialValues,
  //       visitDateTime: vdt
  //         ? vdt.includes("T") && vdt.length >= 16
  //           ? vdt.slice(0, 16)
  //           : toLocalDatetimeValue(new Date(vdt))
  //         : toLocalDatetimeValue(new Date()),
  //     });
  //     return;
  //   }

  //   // new visit default: now
  //   setForm((prev) => ({
  //     ...defaultForm,
  //     visitDateTime: toLocalDatetimeValue(new Date()),
  //     doctor: doctors?.[0] || "",
  //   }));
  // }, [open, initialValues, doctors]);

  const bmi = useMemo(
    () => calcBmi(form.weightKg, form.heightCm),
    [form.weightKg, form.heightCm],
  );

  const bmiText = useMemo(() => {
    if (bmi == null) return "—";
    return bmi.toFixed(1);
  }, [bmi]);

  const bmiTag = useMemo(() => bmiCategory(bmi), [bmi]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleToggleAllergy = (_, checked) => {
    setForm((p) => ({
      ...p,
      allergyNoted: checked,
      allergyDetails: checked ? p.allergyDetails : "",
    }));
  };

  const validate = () => {
    // Visit info required
    if (!form.visitDateTime) return "Visit date & time is required.";
    if (!form.doctor) return "Doctor is required.";
    if (!form.visitType) return "Visit type is required.";
    if (!form.reason.trim()) return "Reason / chief complaint is required.";

    // Vitals: optional (no required checks)
    // Allergy: details optional even if noted (but recommended)
    return null;
  };

  const buildPayload = () => {
    // Store both raw strings (for UI) and parsed numbers (for DB later)
    const payload = {
      id: initialValues?.id ?? Date.now(), // temporary client id
      visitDateTime: form.visitDateTime, // datetime-local string
      doctor: form.doctor,
      visitType: form.visitType,
      reason: form.reason.trim(),
      notes: form.notes?.trim() || "",

      allergyNoted: Boolean(form.allergyNoted),
      allergyDetails: form.allergyNoted ? form.allergyDetails.trim() : "",

      // Vitals (optional)
      vitals: {
        tempC: numOrNull(form.tempC),
        bpS: numOrNull(form.bpS),
        bpD: numOrNull(form.bpD),
        pulse: numOrNull(form.pulse),
        weightKg: numOrNull(form.weightKg),
        heightCm: numOrNull(form.heightCm),
        spo2: numOrNull(form.spo2),
        bmi: bmi == null ? null : Number(bmi.toFixed(2)),
      },
    };

    return payload;
  };

  const handleSubmit = () => {
    const err = validate();
    if (err) {
      alert(err);
      return;
    }

    onSave?.(buildPayload());
    onClose?.();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Typography className="font-bold">Add Visit</Typography>
        <Typography variant="body2" color="text.secondary" className="mt-1">
          Create a visit record. Vitals are optional and can be filled later.
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {/* Two-column layout on desktop, single column on mobile */}
        <Grid container spacing={2}>
          {/* LEFT: Visit info */}
          <Grid item xs={12} md={6}>
            <Typography className="font-semibold">Visit Information</Typography>
            <Divider className="my-2" />

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Visit Date & Time"
                  type="datetime-local"
                  name="visitDateTime"
                  value={form.visitDateTime}
                  onChange={handleChange}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Doctor"
                  name="doctor"
                  value={form.doctor}
                  onChange={handleChange}
                  fullWidth
                  required
                >
                  {doctors.map((d) => (
                    <MenuItem key={d} value={d}>
                      {d}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Visit Type"
                  name="visitType"
                  value={form.visitType}
                  onChange={handleChange}
                  fullWidth
                  required
                >
                  {VISIT_TYPES.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Chief Complaint / Reason"
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  fullWidth
                  required
                  placeholder="e.g., cough, fever, follow-up checkup"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Notes (optional)"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  minRows={3}
                  placeholder="Additional notes for this visit..."
                />
              </Grid>

              <Grid item xs={12}>
                <Box className="rounded-xl bg-slate-50 p-3">
                  <Box className="flex items-center justify-between">
                    <Typography className="font-semibold">
                      Allergy Noted
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={form.allergyNoted}
                          onChange={handleToggleAllergy}
                        />
                      }
                      label={form.allergyNoted ? "Yes" : "No"}
                    />
                  </Box>

                  {form.allergyNoted && (
                    <TextField
                      label="Allergy Details"
                      name="allergyDetails"
                      value={form.allergyDetails}
                      onChange={handleChange}
                      fullWidth
                      placeholder="e.g., Penicillin, Seafood..."
                      className="mt-2"
                    />
                  )}
                </Box>
              </Grid>
            </Grid>
          </Grid>

          {/* RIGHT: Vitals */}
          <Grid item xs={12} md={6}>
            <Box className="flex items-center justify-between">
              <Typography className="font-semibold">
                Vitals (Optional)
              </Typography>
              <Box className="flex items-center gap-2">
                <Typography variant="body2" color="text.secondary">
                  BMI:
                </Typography>
                <Chip label={bmiText} size="small" />
                {bmiTag && (
                  <Chip
                    label={bmiTag}
                    size="small"
                    color={bmiTag === "Normal" ? "success" : "warning"}
                  />
                )}
              </Box>
            </Box>
            <Divider className="my-2" />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Temperature"
                  name="tempC"
                  value={form.tempC}
                  onChange={handleChange}
                  fullWidth
                  placeholder="e.g., 37.8"
                  inputProps={{ inputMode: "decimal" }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">°C</InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Pulse"
                  name="pulse"
                  value={form.pulse}
                  onChange={handleChange}
                  fullWidth
                  placeholder="e.g., 86"
                  inputProps={{ inputMode: "numeric" }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">bpm</InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="BP Systolic"
                  name="bpS"
                  value={form.bpS}
                  onChange={handleChange}
                  fullWidth
                  placeholder="e.g., 120"
                  inputProps={{ inputMode: "numeric" }}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="BP Diastolic"
                  name="bpD"
                  value={form.bpD}
                  onChange={handleChange}
                  fullWidth
                  placeholder="e.g., 80"
                  inputProps={{ inputMode: "numeric" }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Weight"
                  name="weightKg"
                  value={form.weightKg}
                  onChange={handleChange}
                  fullWidth
                  placeholder="e.g., 72"
                  inputProps={{ inputMode: "decimal" }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">kg</InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Height"
                  name="heightCm"
                  value={form.heightCm}
                  onChange={handleChange}
                  fullWidth
                  placeholder="e.g., 170"
                  inputProps={{ inputMode: "numeric" }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">cm</InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="SpO₂"
                  name="spo2"
                  value={form.spo2}
                  onChange={handleChange}
                  fullWidth
                  placeholder="e.g., 97"
                  inputProps={{ inputMode: "numeric" }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">%</InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Note: Vitals are saved with the visit. You can leave them
                  blank and fill later.
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions className="px-6 py-4">
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained">
          Save Visit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
