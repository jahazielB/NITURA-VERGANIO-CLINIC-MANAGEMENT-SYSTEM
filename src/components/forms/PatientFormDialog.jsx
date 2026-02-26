import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useState, useEffect } from "react";
import CustomSnackbar from "../modals/CustomSnackBar";
import { useSelector, useDispatch } from "react-redux";
import dayjs from "dayjs";
import { addPatient, editPatient } from "../../store/patientSlice";

export default function PatientFormDialog({ open, onClose, patient, onSaved }) {
  const { adding, updating } = useSelector((p) => p.patients);
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "",
    contact: "",
    address: "",
    dateOfBirth: null,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "",
    message: "",
  });

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handleDateChange = (value) => setForm({ ...form, dateOfBirth: value });

  const validation = () => {
    if (!form.firstName.trim()) return alert("Please enter first name");
    if (!form.lastName.trim()) return alert("Please enter last name");
    if (!form.gender.trim()) return alert("Please select gender");
    if (!form.dateOfBirth) return alert("Please select date of birth");
  };

  const handleSubmit = async () => {
    try {
      if (patient) {
        // ✅ EDIT MODE
        await dispatch(
          editPatient({
            id: patient.id,
            updatedData: form,
          }),
        ).unwrap();

        setSnackbar({
          open: true,
          severity: "success",
          message: "Patient Updated Successfully!",
        });
      } else {
        // ✅ ADD MODE
        await dispatch(addPatient(form)).unwrap();

        setSnackbar({
          open: true,
          severity: "success",
          message: "Patient Saved Successfully!",
        });
      }

      onSaved?.();

      setForm({
        firstName: "",
        middleName: "",
        lastName: "",
        gender: "",
        contact: "",
        address: "",
        dateOfBirth: null,
      });

      onClose();
    } catch (e) {
      setSnackbar({
        open: true,
        severity: "error",
        message: e,
      });
    }
  };
  useEffect(() => {
    if (patient) {
      setForm({
        firstName: patient.first_name || "",
        middleName: patient.middle_name || "",
        lastName: patient.last_name || "",
        gender: patient.gender || "",
        contact: patient.contact_number || "",
        address: patient.address || "",
        dateOfBirth: patient.birth_date ? dayjs(patient.birth_date) : null,
      });
    }
  }, [patient]);

  useEffect(() => {
    if (!open) {
      setForm({
        firstName: "",
        middleName: "",
        lastName: "",
        gender: "",
        contact: "",
        address: "",
        dateOfBirth: null,
      });
    }
  }, [open]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
        fullScreen={fullScreen}
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 2,
            boxShadow: 6,
            backgroundColor: "#fdfdfd",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: "1.25rem" }}>
          {patient ? "Edit Patient" : "Add Patient"}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3} mt={1}>
            {/* Name Fields */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              {["firstName", "middleName", "lastName"].map((field) => (
                <TextField
                  key={field}
                  label={field
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                  name={field}
                  fullWidth
                  value={form[field]}
                  onChange={handleChange}
                  disabled={adding}
                  size="small"
                  sx={{ borderRadius: 2 }}
                />
              ))}
            </Stack>

            {/* Contact and Gender */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Contact Number"
                type="number"
                name="contact"
                fullWidth
                value={form.contact}
                onChange={handleChange}
                disabled={adding}
                size="small"
                sx={{ borderRadius: 2 }}
              />
              <FormControl fullWidth size="small">
                <InputLabel>Gender</InputLabel>
                <Select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  disabled={adding}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            {/* Address and Date of Birth */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Address"
                name="address"
                fullWidth
                value={form.address}
                onChange={handleChange}
                disabled={adding}
                size="small"
                sx={{ borderRadius: 2 }}
              />
              <DatePicker
                label="Date of Birth"
                value={form.dateOfBirth}
                onChange={handleDateChange}
                disabled={adding}
                slotProps={{ textField: { fullWidth: true, size: "small" } }}
              />
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={onClose}
            disabled={adding}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={adding || updating}
            startIcon={
              adding || updating ? (
                <CircularProgress size={20} color="inherit" />
              ) : null
            }
            sx={{ borderRadius: 2 }}
          >
            {adding
              ? "Saving..."
              : updating
                ? "Updating..."
                : patient
                  ? "Update"
                  : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <CustomSnackbar
        open={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </LocalizationProvider>
  );
}
