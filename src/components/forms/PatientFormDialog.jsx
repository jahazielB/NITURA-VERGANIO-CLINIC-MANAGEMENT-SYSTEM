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
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

export default function PatientFormDialog({ open, onClose, onSave, patient }) {
  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
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
  const validation = () => {
    if (!form.firstName.trim()) return alert("please put first name");
    if (!form.lastName.trim()) return alert("please put last name");
    if (!form.gender.trim()) return alert("please put gender");
    if (!form.dateOfBirth) return alert("please date of birth");
  };
  const handleSubmit = () => {
    validation();
    onSave({
      ...form,
      dateOfBirth: form.dateOfBirth
        ? form.dateOfBirth.format("YYYY-MM-DD")
        : null,
    });
    const date = form.dateOfBirth;
    console.log(date.$d, form);
    // onClose();
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
          <Button variant="contained" onClick={handleSubmit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}
