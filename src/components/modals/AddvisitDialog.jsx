import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Switch,
  Box,
  InputAdornment,
  Chip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { fetchPatientProfile } from "../../store/patientProfileSlice";
import { defaultVisitDateTime } from "../helpers/dateHelper";
import { numOrNull, calcBmi } from "../helpers/bmiHelper";

const bmiCategory = (bmi) => {
  if (bmi == null) return { label: "—", color: "default" };
  if (bmi < 18.5) return { label: "Underweight", color: "info" };
  if (bmi < 25) return { label: "Normal", color: "success" };
  if (bmi < 30) return { label: "Overweight", color: "warning" };
  return { label: "Obese", color: "error" };
};
// const pad = (n) => n.toString().padStart(2, "0");
// const now = new Date();
// const offset = -now.getTimezoneOffset();
// const sign = offset >= 0 ? "+" : "-";
// const hh = pad(Math.floor(Math.abs(offset) / 60));
// const mm = pad(Math.abs(offset) % 60);

const VISIT_TYPES = ["Walk-in", "Appointment"];

export default function AddVisitDialog({
  open,
  onClose,
  setSnack,
  form,
  setForm,
}) {
  const [doctors, setDoctors] = useState([]);
  const [saving, setSaving] = useState(false);

  const { patientInfo } = useSelector((patient) => patient.patientProfile);
  const { userName, role, user } = useSelector((u) => u.auth);
  const dispatch = useDispatch();

  const bmi = useMemo(
    () => calcBmi(numOrNull(form.weightKg), numOrNull(form.heightCm)),
    [form.weightKg, form.heightCm],
  );
  const bmiInfo = bmiCategory(bmi);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const [systolic, diastolic] = form.bp.split("/");
  const onSave = async () => {
    try {
      setSaving(true);
      const visitPayload = [
        {
          created_at: new Date(form.visitDateTime).toISOString(),
          patient_id: patientInfo?.id,
          visit_type: form.visitType || "",
          chief_complaint: form.reason || null,
          doctor_id: form.doctorId,
          allergies: form.allergyDetails || null,
        },
      ];

      if (
        !form.reason.trim() ||
        !form.doctorId.trim() ||
        !form.visitType.trim()
      )
        throw new Error(
          `${!form.reason.trim() ? "chief complaint" : !form.doctorId.trim() ? "Doctor" : "Visit Type"} is required`,
        );
      const { data, error } = await supabase
        .from("visits")
        .insert(visitPayload)
        .select();
      if (error) throw error;
      const newVisitId = data?.[0].id;
      dispatch(fetchPatientProfile(patientInfo?.id));
      const anyVitalsFilled =
        form.tempC ||
        systolic ||
        diastolic ||
        form.pulse ||
        form.spo2 ||
        form.weightKg ||
        form.heightCm ||
        form.respiratoryRate;

      if (anyVitalsFilled) {
        const vitalsPayload = [
          {
            visit_id: newVisitId,
            temperature_c: form.tempC ? Number(form.tempC) : null,
            blood_pressure_sys: systolic ? Number(systolic) : null,
            blood_pressure_dia: diastolic ? Number(diastolic) : null,
            heart_rate: form.pulse ? Number(form.pulse) : null,
            spo2: form.spo2 ? Number(form.spo2) : null,
            weight_kg: form.weightKg ? Number(form.weightKg) : null,
            height_cm: form.heightCm ? Number(form.heightCm) : null,
            respiratory_rate: form.respiratoryRate
              ? Number(form.respiratoryRate)
              : null,
            bmi: bmi ? bmi.toFixed(1) : null,
            taken_by: user?.id || null,
            taken_at: new Date(form.visitDateTime).toISOString(),
          },
        ];

        const { data: vitals, error: errorVitals } = await supabase
          .from("vitals")
          .insert(vitalsPayload)
          .select();
        if (errorVitals) throw errorVitals;
      }

      setForm({
        visitDateTime: defaultVisitDateTime(),
        doctorId: "",
        visitType: "",
        reason: "",
        notes: "",
        tempC: "",
        pulse: "",
        bp: "",
        spo2: "",
        weightKg: "",
        heightCm: "",
        respiratoryRate: "",
        allergyNoted: false,
        allergyDetails: "",
      });
      setSnack({
        open: true,
        message: "visit saved successfully!",
        severity: "success",
      });
      setSaving(false);
      setTimeout(() => onClose(), 1200);
      dispatch(fetchPatientProfile(patientInfo?.id));
    } catch (e) {
      setSnack({
        open: true,
        message: `Error saving visit: ${e.message}`,
        severity: "error",
      });
      setForm({
        visitDateTime: defaultVisitDateTime,
        doctorId: "",
        visitType: "",
        reason: "",
        notes: "",
        tempC: "",
        pulse: "",
        bp: "",
        spo2: "",
        weightKg: "",
        heightCm: "",
        respiratoryRate: "",
        allergyNoted: false,
        allergyDetails: "",
      });
      setSaving(false);
    }
  };
  useEffect(() => {
    const fetchDoctors = async () => {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("role", "Doctor");
      if (error) console.log(error);

      setDoctors(data);
    };
    fetchDoctors();
  }, []);
  // inside AddVisitDialog
  useEffect(() => {
    if (open) {
      setForm((prev) => ({
        ...prev,
        visitDateTime: defaultVisitDateTime(),
      }));
    }
  }, [open]);
  // useEffect(() => {
  //   console.log(patientInfo);
  // }, [patientInfo]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 1.5,
        }}
      >
        <Typography
          variant="h6"
          component="span"
          sx={{ fontWeight: 800, fontSize: "1.1rem" }}
        >
          Patient Visit Record
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2, bgcolor: "#fcfcfc" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 3,
          }}
        >
          {/* COLUMN 1: LOGISTICS */}
          <Box
            sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: "text.secondary",
                letterSpacing: 1,
              }}
            >
              LOGISTICS
            </Typography>

            <TextField
              type="datetime-local"
              label="Visit Date"
              name="visitDateTime"
              value={form.visitDateTime}
              onChange={handleChange}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />

            <Box sx={{ display: "flex", gap: 1.5 }}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Doctor</InputLabel>
                <Select
                  name="doctorId"
                  value={form.doctorId}
                  onChange={handleChange}
                  label="Doctor"
                >
                  {doctors?.map((d) => (
                    <MenuItem key={d.id} value={d.id}>
                      Dr. {d.full_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small" required>
                <InputLabel>Visit Type</InputLabel>
                <Select
                  name="visitType"
                  value={form.visitType}
                  onChange={handleChange}
                  label="Type"
                >
                  {VISIT_TYPES.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <TextField
              label="Chief Complaint"
              name="reason"
              value={form.reason}
              onChange={handleChange}
              size="small"
              fullWidth
              required
            />

            <Box
              sx={{
                p: 1,
                border: "1px solid #ddd",
                borderRadius: 1.5,
                bgcolor: "#fff",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Allergies?(optional)
                </Typography>
                <Switch
                  size="small"
                  checked={form.allergyNoted}
                  onChange={(e) =>
                    setForm({ ...form, allergyNoted: e.target.checked })
                  }
                />
              </Box>
              {form.allergyNoted && (
                <TextField
                  label="Details"
                  name="allergyDetails"
                  value={form.allergyDetails}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  variant="standard"
                  sx={{ mt: 0.5 }}
                />
              )}
            </Box>
          </Box>

          {/* COLUMN 2: VITALS */}
          <Box
            sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: "text.secondary",
                  letterSpacing: 1,
                }}
              >
                VITALS (can be filled later at overview tab, you may leave it
                blank)
              </Typography>
              <Chip
                label={`BMI: ${bmi ? bmi.toFixed(1) : "—"}`}
                size="small"
                color={bmiInfo.color}
                sx={{ height: 20, fontWeight: 700, fontSize: "0.65rem" }}
              />
            </Box>

            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}
            >
              <TextField
                type="number"
                label="Temp"
                name="tempC"
                value={form.tempC}
                onChange={handleChange}
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">°C</InputAdornment>
                  ),
                }}
              />
              <TextField
                type="number"
                label="Pulse"
                name="pulse"
                value={form.pulse}
                onChange={handleChange}
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">bpm</InputAdornment>
                  ),
                }}
              />

              {/* BP kept as text to allow "120/80" */}
              <TextField
                type="text"
                label="BP"
                name="bp"
                placeholder="120/80"
                value={form.bp}
                onChange={(e) => {
                  const value = e.target.value;

                  if (/^\d{0,3}\/?\d{0,3}$/.test(value)) {
                    setForm({ ...form, bp: value });
                  }
                }}
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">mmHg</InputAdornment>
                  ),
                }}
              />

              <TextField
                type="number"
                label="SpO2"
                name="spo2"
                value={form.spo2}
                onChange={handleChange}
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                }}
              />
              <TextField
                type="number"
                label="Weight"
                name="weightKg"
                value={form.weightKg}
                onChange={handleChange}
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">kg</InputAdornment>
                  ),
                }}
              />
              <TextField
                type="number"
                label="Height"
                name="heightCm"
                value={form.heightCm}
                onChange={handleChange}
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">cm</InputAdornment>
                  ),
                }}
              />
            </Box>

            <TextField
              type="number"
              label="Respiratory Rate"
              name="respiratoryRate"
              value={form.respiratoryRate}
              onChange={handleChange}
              size="small"
              fullWidth
              placeholder="breaths/min"
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: "#f8f9fa" }}>
        <Button
          onClick={onClose}
          sx={{
            color: "text.secondary",
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={saving}
          disableElevation
          startIcon={
            saving ? <CircularProgress size={20} color="inherit" /> : null
          }
          onClick={() => {
            // console.log(userName, role, user.id);
            // console.log(new Date(form.visitDateTime).toISOString());
            onSave(form);
          }}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            borderRadius: 2,
            px: 4,
          }}
        >
          {saving ? "saving..." : "Save Record"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
