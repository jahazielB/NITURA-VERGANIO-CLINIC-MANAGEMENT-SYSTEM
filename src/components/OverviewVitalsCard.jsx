import { supabase } from "../lib/supabaseClient";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
  Divider,
  MenuItem,
  TextField,
  Button,
} from "@mui/material";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import FavoriteIcon from "@mui/icons-material/Favorite";
import OpacityIcon from "@mui/icons-material/Opacity";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import HeightIcon from "@mui/icons-material/Height";
import SpeedIcon from "@mui/icons-material/Speed";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import AddVitalsDialog from "./modals/AddVitalsDialog";
import CustomSnackbar from "./modals/CustomSnackBar";

import { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchPatientProfile } from "../store/patientProfileSlice";

import { calcBmi, numOrNull } from "./helpers/bmiHelper";
import { defaultVisitDateTime } from "./helpers/dateHelper";

function fmt(dt) {
  try {
    return new Date(dt.replace(/\.(\d{3})\d+/, ".$1")).toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dt;
  }
}

export default function OverviewVitalsCard({}) {
  const [selectedVisitId, setSelectedVisitId] = useState(null);
  const [openVitalsDialog, setOpenVitalsDialog] = useState(false);
  const [form, setForm] = useState({
    visitDateTime: defaultVisitDateTime(),
    tempC: "",
    pulse: "",
    bp: "",
    spo2: "",
    weightKg: "",
    heightCm: "",
    respiratoryRate: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "",
  });
  const dispatch = useDispatch();
  const { patientInfo } = useSelector((s) => s.patientProfile);
  const { userName, role, user } = useSelector((u) => u.auth);
  const visits = patientInfo?.visits;

  const selected = useMemo(() => {
    const sorted = visits?.find((v) => v.id === selectedVisitId);
    return sorted;
  }, [selectedVisitId]);
  const bmi = useMemo(
    () => calcBmi(numOrNull(form.weightKg), numOrNull(form.heightCm)),
    [form.weightKg, form.heightCm],
  );
  const vitals = selected?.vitals;
  useEffect(() => {
    const latestVisitId = visits?.map((v) => v);
    setSelectedVisitId(latestVisitId?.[0]?.id);
  }, [patientInfo]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const [systolic, diastolic] = form.bp.split("/");
  const onSave = async () => {
    try {
      const vitalsPayload = [
        {
          visit_id: selectedVisitId,
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
      if (
        !form.bp.trim() ||
        !form.tempC.trim() ||
        !form.pulse.trim() ||
        !form.respiratoryRate.trim() ||
        !form.spo2.trim()
      )
        throw new Error(
          `${!form.tempC.trim() ? "Temperature" : !form.bp.trim() ? "Blood Pressure is Required" : !form.pulse.trim() ? "Pulse" : !form.respiratoryRate.trim() ? "Respiratory Rate" : "Spo2"} is required`,
        );
      const { data, error } = await supabase
        .from("vitals")
        .insert(vitalsPayload)
        .select();
      if (error) throw error;
      setSnackbar({
        open: true,
        message: "Vitals saved successfully",
        severity: "success",
      });
      console.log("Patient ID:", patientInfo?.id);
      dispatch(fetchPatientProfile(patientInfo?.id));
      setOpenVitalsDialog(false);

      setForm({
        visitDateTime: defaultVisitDateTime(),
        tempC: "",
        pulse: "",
        bp: "",
        spo2: "",
        weightKg: "",
        heightCm: "",
        respiratoryRate: "",
      });
    } catch (e) {
      setSnackbar({
        open: true,
        message: `Error Saving Vitals: ${e}`,
        severity: "error",
      });
      console.error("error message:", e);
    }
  };
  return (
    <Card className="rounded-2xl shadow">
      <CardContent>
        <Box className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <Box>
            <Typography className="font-semibold">Vitals</Typography>
          </Box>

          {/* Right side controls */}
          <Box className="flex items-center gap-2">
            {visits?.length > 1 && (
              <TextField
                select
                size="small"
                label="Select Visit Date"
                value={selectedVisitId || ""}
                onChange={(e) => {
                  setSelectedVisitId(e.target.value);
                  console.log(selected);
                }}
                sx={{ minWidth: 220 }}
              >
                {visits.map((v) => (
                  <MenuItem key={v.id} value={v.id}>
                    {new Date(v.created_at).toLocaleString("en-US")}
                  </MenuItem>
                ))}
              </TextField>
            )}

            {/* Add Vitals Button */}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              size="small"
              onClick={() => {
                // open your modal here
                setOpenVitalsDialog(true);
              }}
            >
              Add Vitals
            </Button>
          </Box>
        </Box>
        <Divider className="my-3" />

        {/* Chips */}
        <Box className="flex flex-col gap-3 p-2">
          {vitals?.length > 0 ? (
            vitals.map((v, i) => (
              <Box
                key={i}
                className="flex flex-col gap-2 border rounded-lg p-3 shadow-sm"
              >
                <Box className="flex items-center justify-between">
                  <Typography variant="caption" color="text.secondary">
                    {selected
                      ? `Recorded: ${fmt(v.taken_at)}`
                      : "No vitals recorded yet"}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    Taken by: {v.taken_by_user?.full_name ?? "Unknown"}
                  </Typography>
                  <IconButton
                    size="small"
                    color="error"
                    // onClick={() => handleDeleteVital(i)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>

                {/* Chips */}
                <Box className="flex flex-wrap gap-2">
                  <Chip
                    icon={<ThermostatIcon />}
                    label={`Temp: ${v.temperature_c ?? "—"}°C`}
                    color={v.temperature_c > 37.5 ? "error" : "primary"}
                    variant="outlined"
                  />
                  <Chip
                    icon={<MonitorHeartIcon />}
                    label={`BP: ${v.blood_pressure_sys ?? "—"}/${v.blood_pressure_dia ?? "—"}`}
                    color={
                      v.blood_pressure_sys > 140 || v.blood_pressure_dia > 90
                        ? "error"
                        : "success"
                    }
                    variant="outlined"
                  />
                  <Chip
                    icon={<FavoriteIcon />}
                    label={`Pulse: ${v.heart_rate ?? "—"} bpm`}
                    color={v.heart_rate > 100 ? "warning" : "success"}
                    variant="outlined"
                  />
                  <Chip
                    icon={<HeightIcon />}
                    label={`Weight: ${v.weight_kg ?? "—"} kg`}
                    color="info"
                    variant="outlined"
                  />
                  <Chip
                    icon={<OpacityIcon />}
                    label={`SpO₂: ${v.spo2 ?? "—"}%`}
                    color={v.spo2 < 95 ? "error" : "success"}
                    variant="outlined"
                  />
                  <Chip
                    icon={<SpeedIcon />}
                    label={`RR: ${v.respiratory_rate ?? "—"}`}
                    color={v.respiratory_rate > 20 ? "warning" : "success"}
                    variant="outlined"
                  />
                </Box>
              </Box>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No vitals yet. Add vitals during a visit.
            </Typography>
          )}
        </Box>
      </CardContent>
      <AddVitalsDialog
        open={openVitalsDialog}
        form={form}
        onClose={() => setOpenVitalsDialog(false)}
        handleChange={handleChange}
        setForm={setForm}
        onSave={onSave}
      />
      <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Card>
  );
}
