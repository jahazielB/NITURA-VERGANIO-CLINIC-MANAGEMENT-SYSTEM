import React, { useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  TextField,
  Typography,
  Box,
  IconButton,
  Stack,
} from "@mui/material";
import {
  Close as CloseIcon,
  CalendarToday as DateIcon,
  AccessTime as TimeIcon,
} from "@mui/icons-material";

import { APPT_STATUS, nowTimeHM } from "../helpers/appointmentHelpers";
import { todayISO } from "../helpers/labHelpers";
import { searchPatients } from "../../services/patientService";
import { supabase } from "../../lib/supabase";

export default function AppointmentFormDialog({
  open,
  mode, // "walkin" | "schedule" | "edit"
  onClose,
  onSave,
  initialValues,
}) {
  const isEdit = mode === "edit";
  const [patientOptions, setPatientOptions] = useState([]);
  const [patientLoading, setPatientLoading] = useState(false);
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [doctorOptions, setDoctorOptions] = useState([
    { id: "", full_name: "Unassigned" },
  ]);

  const splitFullName = (fullName = "") => {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    return {
      patientFirstName: parts[0] || "",
      patientMiddleName: parts.length > 2 ? parts.slice(1, -1).join(" ") : "",
      patientLastName: parts.length > 1 ? parts[parts.length - 1] : "",
    };
  };

  const defaults = useMemo(() => {
    if (mode === "walkin") {
      return {
        patientFirstName: "",
        patientMiddleName: "",
        patientLastName: "",
        contact: "",
        date: todayISO(),
        time: nowTimeHM(),
        reason: "",
        doctor: "",
        status: APPT_STATUS.WAITING,
        isWalkIn: true,
      };
    }

    return {
      patientFirstName: "",
      patientMiddleName: "",
      patientLastName: "",
      contact: "",
      date: todayISO(),
      time: "09:00",
      reason: "",
      doctor: "",
      status: APPT_STATUS.SCHEDULED,
      isWalkIn: false,
    };
  }, [mode]);

  const [form, setForm] = useState(defaults);

  useEffect(() => {
    if (!open) return;
    if (isEdit && initialValues) {
      setForm({
        ...defaults,
        ...splitFullName(initialValues.patientName ?? ""),
        contact: initialValues.contact ?? "",
        date: initialValues.date ?? defaults.date,
        time: initialValues.time ?? defaults.time,
        reason: initialValues.reason ?? "",
        doctor: initialValues.doctorId ?? "",
        status: initialValues.status ?? defaults.status,
        isWalkIn: initialValues.isWalkIn ?? defaults.isWalkIn,
        patient_id: initialValues.patient_id ?? "",
      });
      setPatientSearch(initialValues.patientName ?? "");
    } else {
      setForm(defaults);
      setPatientSearch("");
    }
    setSelectedPatient(null);
  }, [open, isEdit, initialValues, defaults]);

  useEffect(() => {
    if (!open) return;

    let active = true;

    (async () => {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("id, full_name")
        .eq("role", "Doctor")
        .eq("is_active", true)
        .order("full_name", { ascending: true });

      if (!active) return;
      if (error) return;

      setDoctorOptions([
        { id: "", full_name: "Unassigned" },
        ...(data ?? [])
          .map((doctor) => ({
            id: doctor.id,
            full_name: doctor.full_name?.trim() || "Unknown Doctor",
          }))
          .filter((doctor) => doctor.id),
      ]);
    })();

    return () => {
      active = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    let active = true;
    const query = patientSearch.trim();

    const timer = setTimeout(async () => {
      setPatientLoading(true);
      try {
        const patients = await searchPatients(query);
        if (!active) return;

        const term = query.toLowerCase();
        const filtered = term
          ? patients.filter((patient) =>
              `${patient.first_name ?? ""} ${patient.middle_name ?? ""} ${patient.last_name ?? ""}`
                .toLowerCase()
                .includes(term),
            )
          : patients;

        setPatientOptions(filtered);
      } catch {
        if (active) setPatientOptions([]);
      } finally {
        if (active) setPatientLoading(false);
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [open, patientSearch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handlePatientSelect = (_, patient) => {
    setSelectedPatient(patient);
    if (!patient) {
      setForm((p) => ({
        ...p,
        patientFirstName: "",
        patientMiddleName: "",
        patientLastName: "",
        contact: "",
        patient_id: "",
      }));
      setPatientSearch("");
      return;
    }

    const patientName = [
      patient.first_name,
      patient.middle_name,
      patient.last_name,
    ]
      .filter(Boolean)
      .join(" ");

    setForm((p) => ({
      ...p,
      patientFirstName: patient.first_name ?? "",
      patientMiddleName: patient.middle_name ?? "",
      patientLastName: patient.last_name ?? "",
      contact: patient.contact_number ?? "",
      patient_id: patient.id,
    }));
    setPatientSearch(patientName);
  };

  const submit = async () => {
    try {
      const patientFirstName = form.patientFirstName.trim();
      const patientMiddleName = form.patientMiddleName.trim();
      const patientLastName = form.patientLastName.trim();
      const patientName = [
        patientFirstName,
        patientMiddleName,
        patientLastName,
      ]
        .filter(Boolean)
        .join(" ");

      if (!patientFirstName || !patientMiddleName || !patientLastName) {
        return alert("First name, middle name, and last name are required.");
      }
      if (!form.date) return alert("Date is required.");
      if (!form.time) return alert("Time is required.");

      onSave({
        ...form,
        patientName,
        display_name: patientName,
        reason: (form.reason || "").trim(),
        contact: (form.contact || "").trim(),
        contact_number: (form.contact || "").trim() || null,
        patient_id: form.patient_id || null,
        id: isEdit ? form.id : undefined,
      });
    } catch (error) {
      alert(error?.message || "Failed to save appointment.");
    }
  };

  const title =
    mode === "walkin"
      ? "Add Walk-in"
      : mode === "schedule"
        ? "Schedule Appointment"
        : "Edit Appointment";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: 3, px: 1, py: 0.5 },
      }}
    >
      {/* Header Section */}
      <DialogTitle
        sx={{
          m: 0,
          p: 3,
          pb: 1,
          display: "flex",
          justifyContent: "between",
          alignItems: "center",
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant="h6"
            component="div"
            sx={{ fontWeight: 600, color: "text.primary" }}
          >
            {title}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", mt: 0.5, fontWeight: 400 }}
          >
            {mode === "walkin"
              ? "Creates a fast-tracked queue entry for today."
              : mode === "schedule"
                ? "Book a planned or upcoming consultation slot."
                : "Modify current appointment parameters."}
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: "text.secondary", p: 0.5 }}
        >
          <CloseIcon size="small" />
        </IconButton>
      </DialogTitle>

      {/* Form Fields Body */}
      <DialogContent dividers={false} sx={{ p: 3, pt: 1 }}>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {/* Identity Block */}
          <Autocomplete
            freeSolo
            options={patientOptions}
            loading={patientLoading}
            value={selectedPatient}
            inputValue={patientSearch}
            onChange={handlePatientSelect}
            onInputChange={(_, value, reason) => {
              if (reason === "input" || reason === "clear") {
                setSelectedPatient(null);
                setPatientSearch(value);
                setForm((p) => ({
                  ...p,
                  patientFirstName: reason === "clear" ? "" : p.patientFirstName,
                  patientMiddleName: reason === "clear" ? "" : p.patientMiddleName,
                  patientLastName: reason === "clear" ? "" : p.patientLastName,
                  patient_id: "",
                  contact: reason === "clear" ? "" : p.contact,
                }));
              }
            }}
            getOptionLabel={(option) =>
              typeof option === "string"
                ? option
                : [option?.first_name, option?.middle_name, option?.last_name]
                    .filter(Boolean)
                    .join(" ")
            }
            renderOption={({ key, ...props }, option) => (
              <li key={key} {...props}>
                <Box>
                  <Typography variant="body2">
                    {[
                      option?.first_name,
                      option?.middle_name,
                      option?.last_name,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option?.birth_date ? `DOB: ${option.birth_date}` : "DOB unavailable"}
                  </Typography>
                </Box>
              </li>
            )}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            filterOptions={(options) => options}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search Existing Patient"
                variant="outlined"
                fullWidth
                helperText="Type a patient name to search or leave blank for new patient"
                slotProps={{
                  inputLabel: { shrink: true },
                }}
              />
            )}
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="First Name"
              name="patientFirstName"
              value={form.patientFirstName}
              onChange={handleChange}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Middle Name"
              name="patientMiddleName"
              value={form.patientMiddleName}
              onChange={handleChange}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Last Name"
              name="patientLastName"
              value={form.patientLastName}
              onChange={handleChange}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Contact Number"
              name="contact"
              value={form.contact}
              onChange={handleChange}
              placeholder="Optional"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              select
              label="Assigned Doctor"
              name="doctor"
              value={form.doctor}
              onChange={handleChange}
              fullWidth
              helperText={
                doctorOptions.length === 1
                  ? "No active doctors found. Add a doctor in user profiles first."
                  : ""
              }
              slotProps={{ inputLabel: { shrink: true } }}
            >
              {doctorOptions.length === 1 && (
                <MenuItem value="" disabled>
                  No doctors registered
                </MenuItem>
              )}
              {doctorOptions.map((d) => (
                <MenuItem key={d.id || "unassigned"} value={d.id}>
                  {d.full_name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          {/* Logistics Block */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Date"
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              fullWidth
              slotProps={{
                inputLabel: { shrink: true },
                input: {
                  endAdornment: (
                    <DateIcon
                      sx={{ color: "text.secondary", fontSize: 20, ml: 1 }}
                    />
                  ),
                },
              }}
            />
            <TextField
              label="Time"
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              fullWidth
              slotProps={{
                inputLabel: { shrink: true },
                input: {
                  endAdornment: (
                    <TimeIcon
                      sx={{ color: "text.secondary", fontSize: 20, ml: 1 }}
                    />
                  ),
                },
              }}
            />
          </Stack>

          {isEdit && (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                select
                label="Status"
                name="status"
                value={form.status}
                onChange={handleChange}
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              >
                {Object.values(APPT_STATUS).map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          )}

          {/* Contextual Notes Block */}
          <TextField
            label="Reason / Notes"
            name="reason"
            value={form.reason}
            onChange={handleChange}
            placeholder="e.g., Follow-up clinical checks, routine consultation notes..."
            fullWidth
            multiline
            minRows={3}
            slotProps={{ inputLabel: { shrink: true } }}
          />

          {/* Status Context Disclaimer */}
          {!isEdit && (
            <Box
              sx={{
                borderRadius: 2,
                bgcolor:
                  mode === "walkin"
                    ? "action.hover"
                    : "primary.neutralBackground",
                border: "1px solid",
                borderColor: "divider",
                p: 1.75,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  display: "block",
                  lineHeight: 1.5,
                }}
              >
                New entries under this window are dynamically queued with a
                default state value of{" "}
                <Box
                  component="span"
                  sx={{ fontWeight: 600, color: "text.primary" }}
                >
                  {mode === "walkin"
                    ? APPT_STATUS.WAITING
                    : APPT_STATUS.SCHEDULED}
                </Box>
                .
              </Typography>
            </Box>
          )}
        </Stack>
      </DialogContent>

      {/* Action Tray */}
      <DialogActions sx={{ p: 3, pt: 1.5, gap: 1 }}>
        <Button
          variant="text"
          onClick={onClose}
          sx={{ color: "text.secondary", fontWeight: 500, px: 2.5 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={submit}
          disableElevation
          sx={{
            fontWeight: 600,
            px: 3.5,
            borderRadius: 1.5,
            textTransform: "none",
          }}
        >
          Save Details
        </Button>
      </DialogActions>
    </Dialog>
  );
}
