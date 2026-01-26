import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

export default function PatientFormDialog({ open, onClose, onSave, patient }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    contact: "",
    dateOfBirth: null,
  });

  useEffect(() => {
    if (patient) {
      setForm({
        ...patient,
        dateOfBirth: patient.dateOfBirth ? dayjs(patient.dateOfBirth) : null,
      });
    }
  }, [patient]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDateChange = (value) => {
    setForm({ ...form, dateOfBirth: value });
  };

  const handleSubmit = () => {
    onSave({
      ...form,
      dateOfBirth: form.dateOfBirth
        ? form.dateOfBirth.format("YYYY-MM-DD")
        : null,
    });
    onClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>{patient ? "Edit Patient" : "Add Patient"}</DialogTitle>

        <DialogContent>
          <Grid container spacing={2} mt={1}>
            <Grid item xs={6}>
              <TextField
                label="First Name"
                name="firstName"
                fullWidth
                value={form.firstName}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={6}>
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
                label="Gender"
                name="gender"
                fullWidth
                value={form.gender}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="Contact Number"
                name="contact"
                fullWidth
                value={form.contact}
                onChange={handleChange}
              />
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
          <Button variant="contained" onClick={handleSubmit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}
