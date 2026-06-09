import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  ListItemText,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { supabase } from "../../lib/supabaseClient";
import { defaultVisitDateTime } from "../helpers/dateHelper";

const PH_TIME_ZONE = "Asia/Manila";

const getPhilippineISODate = (date = new Date()) => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: PH_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date);
};

const getPhilippineDisplayDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("en-PH", {
    timeZone: PH_TIME_ZONE,
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

const PRIORITIES = ["Routine", "Urgent"];

const buildInitialForm = (latestVisitId, visits) => ({
  testType: [],
  priority: "Routine",
  notes: "",
  requestedBy: "",
  requestedDate: getPhilippineISODate(),
  visitId: latestVisitId || visits?.[0]?.id || "",
});

export default function RequestLabDialog({
  open,
  onClose,
  onSave,
  visits = [],
  latestVisitId = "",
}) {
  const [form, setForm] = useState(() =>
    buildInitialForm(latestVisitId, visits),
  );
  const [errors, setErrors] = useState({ visitId: false, testType: false });
  const [doctors, setDoctors] = useState([]);
  const [labServices, setLabServices] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  const getDoctorName = (visit) =>
    visit?.doctor?.full_name || visit?.doctor || "";

  useEffect(() => {
    if (!open) return;

    let active = true;

    const loadDoctors = async () => {
      setLoadingDoctors(true);
      const { data, error } = await supabase
        .from("user_profiles")
        .select("id, full_name")
        .eq("role", "Doctor")
        .order("full_name", { ascending: true });

      if (!active) return;

      if (!error) {
        setDoctors(data || []);
        setForm((prev) => ({
          ...prev,
          requestedBy:
            prev.requestedBy &&
            (data || []).some((d) => String(d.id) === String(prev.requestedBy))
              ? prev.requestedBy
              : data?.[0]?.id || "",
        }));
      }

      setLoadingDoctors(false);
    };

    loadDoctors();

    const loadLabServices = async () => {
      const { data, error } = await supabase
        .from("lab_services")
        .select("id, name")
        .order("name", { ascending: true });

      if (!active) return;

      if (!error) {
        setLabServices(data || []);
      }
    };

    loadLabServices();

    return () => {
      active = false;
    };
  }, [open]);

  const resetForm = () => {
    setForm(buildInitialForm(latestVisitId, visits));
    setErrors({ visitId: false, testType: false });
  };

  const buildRequestedDateTime = () => {
    const requestedDate = form.requestedDate
      ? new Date(`${form.requestedDate}T00:00:00`)
      : new Date();
    const now = new Date();

    requestedDate.setHours(
      now.getHours(),
      now.getMinutes(),
      0,
      0,
    );

    return defaultVisitDateTime(requestedDate);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "testType" && typeof value === "string"
          ? value.split(",")
          : value,
    }));
  };

  const submit = () => {
    const visitIdError = !form.visitId;
    const testTypeError = !form.testType.length;

    if (visitIdError || testTypeError) {
      setErrors({ visitId: visitIdError, testType: testTypeError });
      return;
    }

    onSave({
      id: Date.now(),
      visitId: form.visitId,
      testType: form.testType,
      priority: form.priority,
      notes: form.notes.trim(),
      requestedBy: form.requestedBy,
      requestedDate: buildRequestedDateTime(),
      status: "Pending",
      resultSummary: "",
      impression: "",
      techNotes: "",
      performedBy: "",
      performedDate: "",
      releasedBy: "",
      releasedDate: "",
    });

    onClose();
    console.log(form);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      TransitionProps={{ onEnter: resetForm }}
      PaperProps={{
        sx: {
          borderRadius: "8px",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0px 4px 24px rgba(0, 0, 0, 0.06)",
          bgcolor: "background.paper",
        },
      }}
    >
      <DialogTitle
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box>
          <Typography
            variant="caption"
            sx={{
              color: "primary.main",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              fontSize: "0.7rem",
            }}
          >
            Computerized Physician Order Entry (CPOE)
          </Typography>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, color: "text.primary", lineHeight: 1.2 }}
          >
            New Laboratory Request
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: "text.secondary",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "6px",
            p: 0.5,
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, bgcolor: "#fcfcfd", mt: 3 }}>
        <Grid container spacing={2.5}>
          <Grid item xs={12}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, mb: 1, color: "text.primary" }}
            >
              Clinical Encounter Target
            </Typography>
            <TextField
              select
              size="small"
              name="visitId"
              value={form.visitId}
              onChange={handleChange}
              fullWidth
              SelectProps={{
                displayEmpty: true,
                renderValue: (value) => {
                  const selectedVisit = visits.find(
                    (v) => String(v.id) === String(value),
                  );
                  if (!selectedVisit) return "Select visit";

                  const doctorName = getDoctorName(selectedVisit);
                  return `${getPhilippineDisplayDate(selectedVisit.date) || "Visit"}${
                    doctorName ? ` • Dr. ${doctorName}` : ""
                  }`;
                },
              }}
              error={errors.visitId}
              helperText={
                errors.visitId
                  ? "Linking an active clinical patient visit is required."
                  : ""
              }
              sx={{ bgcolor: "background.paper" }}
            >
              <MenuItem value="" disabled>
                Select visit
              </MenuItem>
              {visits.map((v) => (
                <MenuItem key={v.id} value={v.id} sx={{ py: 1 }}>
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Encounter Date: {getPhilippineDisplayDate(v.date)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Attending: Dr. {getDoctorName(v)}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, mb: 1, color: "text.primary" }}
            >
              Requested Laboratory Panels
            </Typography>
            <TextField
              select
              size="small"
              name="testType"
              value={form.testType}
              onChange={handleChange}
              fullWidth
              error={errors.testType}
              helperText={
                errors.testType
                  ? "At least one diagnostic procedure panel must be assigned."
                  : ""
              }
              sx={{ bgcolor: "background.paper" }}
              slotProps={{
                inputLabel: { shrink: true },
                select: {
                  multiple: true,
                  displayEmpty: true,
                  renderValue: (selected) => {
                    if (!selected?.length) {
                      return (
                        <Typography variant="body2" color="text.disabled">
                          Select diagnostic procedures...
                        </Typography>
                      );
                    }

                    const preview = selected.slice(0, 2);
                    const remaining = selected.length - preview.length;

                    return (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: 0.5,
                        }}
                      >
                        <Chip
                          size="small"
                          label={`${selected.length} Selected`}
                          sx={{
                            height: 20,
                            borderRadius: "4px",
                            bgcolor: "primary.light",
                            color: "primary.dark",
                            fontWeight: 600,
                            fontSize: "11px",
                          }}
                        />
                        {preview.map((value) => (
                          <Chip
                            key={value}
                            label={
                              labServices.find(
                                (service) => service.id === value,
                              )?.name || value
                            }
                            size="small"
                            variant="outlined"
                            sx={{
                              height: 20,
                              borderRadius: "4px",
                              fontSize: "11px",
                              color: "text.primary",
                            }}
                          />
                        ))}
                        {remaining > 0 ? (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontWeight: 500, ml: 0.5 }}
                          >
                            +{remaining} more
                          </Typography>
                        ) : null}
                      </Box>
                    );
                  },
                },
              }}
            >
              {labServices.map((service) => (
                <MenuItem
                  key={service.id}
                  value={service.id}
                  dense
                  sx={{ py: 0.5 }}
                >
                  <Checkbox
                    checked={form.testType.includes(service.id)}
                    size="small"
                    sx={{ p: 0.5, mr: 1 }}
                  />
                  <ListItemText
                    primaryTypographyProps={{
                      variant: "body2",
                      sx: { color: "text.primary" },
                    }}
                    primary={service.name}
                  />
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, mb: 1, color: "text.primary" }}
            >
              Priority Status
            </Typography>
            <TextField
              select
              size="small"
              name="priority"
              value={form.priority}
              onChange={handleChange}
              fullWidth
              sx={{ bgcolor: "background.paper" }}
            >
              {PRIORITIES.map((p) => (
                <MenuItem key={p} value={p}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: p === "Urgent" ? 600 : 400,
                      color: p === "Urgent" ? "error.main" : "text.primary",
                    }}
                  >
                    {p}
                  </Typography>
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, mb: 1, color: "text.primary" }}
            >
              Order Date
            </Typography>
            <TextField
              size="small"
              type="date"
              name="requestedDate"
              value={form.requestedDate}
              onChange={handleChange}
              fullWidth
              sx={{ bgcolor: "background.paper" }}
              inputProps={{ style: { fontSize: "14px" } }}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, mb: 1, color: "text.primary" }}
            >
              Ordering Clinician
            </Typography>
            <TextField
              select
              size="small"
              name="requestedBy"
              value={form.requestedBy}
              onChange={handleChange}
              fullWidth
              disabled={!doctors.length || loadingDoctors}
              SelectProps={{
                displayEmpty: true,
                renderValue: (value) =>
                  doctors.find((doctor) => String(doctor.id) === String(value))
                    ?.full_name || "Select doctor",
              }}
              helperText={
                !doctors.length ? "No doctors are registered in Supabase." : ""
              }
              sx={{ bgcolor: "background.paper" }}
              inputProps={{ style: { fontSize: "14px" } }}
            >
              <MenuItem value="" disabled>
                Select doctor
              </MenuItem>
              {doctors.length > 0 ? (
                doctors.map((doctor) => (
                  <MenuItem key={doctor.id} value={doctor.id}>
                    {doctor.full_name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="" disabled>
                  No doctors available
                </MenuItem>
              )}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, mb: 1, color: "text.primary" }}
            >
              Clinical Annotations / Indications
            </Typography>
            <TextField
              size="small"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              fullWidth
              multiline
              minRows={3}
              placeholder="Provide differential diagnosis workflow details, physiological symptoms, or underlying target criteria..."
              sx={{ bgcolor: "background.paper" }}
              inputProps={{ style: { fontSize: "13.5px", lineHeight: "1.45" } }}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          gap: 1.5,
        }}
      >
        <Button
          onClick={onClose}
          variant="text"
          sx={{
            textTransform: "none",
            fontSize: "14px",
            fontWeight: 500,
            color: "text.secondary",
            px: 2,
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={submit}
          variant="contained"
          disableElevation
          sx={{
            textTransform: "none",
            fontSize: "14px",
            fontWeight: 600,
            borderRadius: "6px",
            px: 3,
            bgcolor: "#0284c7",
            "&:hover": { bgcolor: "#0369a1" },
          }}
        >
          Dispatch Order
        </Button>
      </DialogActions>
    </Dialog>
  );
}
