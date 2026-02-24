import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  CircularProgress,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import CustomSnackbar from "../modals/CustomSnackBar";

import { useSelector, useDispatch } from "react-redux";
import { addPatient } from "../../store/patientSlice";

export default function PatientFormDialog({ open, onClose, patient }) {
  const { adding } = useSelector((p) => p.patients);
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "",
    contact: "",
    dateOfBirth: null,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDateChange = (value) => {
    setForm({ ...form, dateOfBirth: value });
  };
  const validation = () => {
    if (!form.firstName.trim()) return alert("please put first name");
    if (!form.lastName.trim()) return alert("please put last name");
    if (!form.gender.trim()) return alert("please put gender");
    if (!form.dateOfBirth) return alert("please date of birth");
  };
  const handleSubmit = async () => {
    try {
      validation();
      await dispatch(addPatient(form)).unwrap();
      setSnackbar({
        ...snackbar,
        open: true,
        severity: "success",
        message: "Patient Saved Successfully!",
      });

      onClose();
    } catch (e) {
      setSnackbar({ ...snackbar, severity: "error", message: e });
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ pb: 1 }}>
          {patient ? "Edit Patient" : "Add Patient"}
        </DialogTitle>

        <DialogContent container spacing={3} sx={{ mt: 0 }}>
          <Grid container spacing={2} mt={1}>
            <Grid item xs={4}>
              <TextField
                label="First Name"
                name="firstName"
                fullWidth
                value={form.firstName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Middle Name"
                name="middleName"
                fullWidth
                value={form.middleName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Last Name"
                name="lastName"
                fullWidth
                value={form.lastName}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="Contact Number"
                type="number"
                name="contact"
                fullWidth
                value={form.contact}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl sx={{ m: 1, minWidth: 100 }}>
                <InputLabel>Gender</InputLabel>
                <Select
                  name="gender"
                  value={form.gender}
                  label="Gender"
                  onChange={handleChange}
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <DatePicker
                label="Date of Birth"
                value={form.dateOfBirth}
                onChange={handleDateChange}
                slotProps={{
                  textField: { fullWidth: true },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="contained"
            disabled={adding}
            onClick={handleSubmit}
            startIcon={
              adding ? <CircularProgress color="inherit" size={20} /> : null
            }
          >
            {adding ? "Saving" : "Save"}
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
