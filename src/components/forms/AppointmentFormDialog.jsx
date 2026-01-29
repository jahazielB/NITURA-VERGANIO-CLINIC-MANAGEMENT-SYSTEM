import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  MenuItem,
  TextField,
  Typography,
  Box,
} from "@mui/material";

import { APPT_STATUS, nowTimeHM } from "../helpers/appointmentHelpers";
import { todayISO } from "../helpers/labHelpers";

const DOCTORS = ["Unassigned", "Dr. Alex", "Dr. Bea"];
const VISIT_TYPES = ["Consultation", "Follow-up", "Laboratory", "Procedure"];

export default function AppointmentFormDialog({
  open,
  mode, // "walkin" | "schedule" | "edit"
  onClose,
  onSave,
  initialValues,
}) {
  const isEdit = mode === "edit";

  const defaults = useMemo(() => {
    if (mode === "walkin") {
      return {
        patientName: "",
        contact: "",
        date: todayISO(),
        time: nowTimeHM(),
        reason: "",
        doctor: "Unassigned",
        visitType: "Consultation",
        status: APPT_STATUS.WAITING,
        isWalkIn: true,
      };
    }

    return {
      patientName: "",
      contact: "",
      date: todayISO(),
      time: "09:00",
      reason: "",
      doctor: "Unassigned",
      visitType: "Consultation",
      status: APPT_STATUS.SCHEDULED,
      isWalkIn: false,
    };
  }, [mode]);

  const [form, setForm] = useState(defaults);

  useEffect(() => {
    if (!open) return;
    if (isEdit && initialValues) setForm(initialValues);
    else setForm(defaults);
  }, [open, isEdit, initialValues, defaults]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const submit = () => {
    if (!form.patientName.trim()) return alert("Patient name is required.");
    if (!form.date) return alert("Date is required.");
    if (!form.time) return alert("Time is required.");

    onSave({
      ...form,
      patientName: form.patientName.trim(),
      reason: (form.reason || "").trim(),
      contact: (form.contact || "").trim(),
      id: isEdit ? form.id : Date.now(),
    });
    onClose();
  };

  const title =
    mode === "walkin"
      ? "Add Walk-in"
      : mode === "schedule"
        ? "Schedule Appointment"
        : "Edit Appointment";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" className="mb-3">
          {mode === "walkin"
            ? "Creates a queue item for today with time set to now."
            : mode === "schedule"
              ? "Schedule for future dates (follow-ups, planned consults)."
              : "Update appointment details."}
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Patient Name"
              name="patientName"
              value={form.patientName}
              onChange={handleChange}
              fullWidth
              autoFocus
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Contact (optional)"
              name="contact"
              value={form.contact}
              onChange={handleChange}
              fullWidth
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
            >
              {DOCTORS.map((d) => (
                <MenuItem key={d} value={d}>
                  {d}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Date"
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Time"
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Visit Type"
              name="visitType"
              value={form.visitType}
              onChange={handleChange}
              fullWidth
            >
              {VISIT_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {isEdit && (
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Status"
                name="status"
                value={form.status}
                onChange={handleChange}
                fullWidth
              >
                {Object.values(APPT_STATUS).map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          )}

          <Grid item xs={12}>
            <TextField
              label="Reason / Notes (optional)"
              name="reason"
              value={form.reason}
              onChange={handleChange}
              fullWidth
              multiline
              minRows={2}
              placeholder="e.g., fever, follow-up, cough symptoms..."
            />
          </Grid>

          {mode !== "edit" && (
            <Grid item xs={12}>
              <Box className="rounded-xl bg-slate-50 p-3">
                <Typography variant="body2" color="text.secondary">
                  Status will start as{" "}
                  <b>
                    {mode === "walkin"
                      ? APPT_STATUS.WAITING
                      : APPT_STATUS.SCHEDULED}
                  </b>
                  .
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions className="px-6 pb-4">
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={submit}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
