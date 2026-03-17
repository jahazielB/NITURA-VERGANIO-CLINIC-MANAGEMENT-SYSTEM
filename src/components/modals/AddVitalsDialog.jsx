import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  InputAdornment,
  Typography,
  Divider,
  CircularProgress,
} from "@mui/material";
// Icons make the UI much more "scannable"
import {
  Thermostat,
  Favorite,
  Speed,
  Opacity,
  MonitorWeight,
  Height,
  Air,
} from "@mui/icons-material";
import { useState } from "react";

export default function AddVitalsDialog({
  open,
  onClose,
  form,
  setForm,
  handleChange,
  onSave,
}) {
  const [saving, setSaving] = useState(false);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      scroll="paper"
    >
      <DialogTitle sx={{ pb: 1, fontWeight: "bold" }}>
        Add Patient Vitals
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, py: 1 }}>
          {/* Section: Core Vitals */}
          <Box>
            <Typography
              variant="subtitle2"
              color="primary"
              gutterBottom
              sx={{ fontWeight: 600 }}
            >
              Core Measurements
            </Typography>
            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
            >
              <TextField
                autoFocus
                required
                type="number"
                label="Temperature"
                name="tempC"
                value={form.tempC}
                onChange={handleChange}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Thermostat fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">°C</InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Pulse Rate"
                required
                type="number"
                name="pulse"
                value={form.pulse}
                onChange={handleChange}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Favorite fontSize="small" color="error" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">bpm</InputAdornment>
                  ),
                }}
              />
              <TextField
                required
                label="Blood Pressure"
                type="text"
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
                  startAdornment: (
                    <InputAdornment position="start">
                      <Speed fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">mmHg</InputAdornment>
                  ),
                }}
              />
              <TextField
                required
                label="SpO₂"
                type="number"
                name="spo2"
                value={form.spo2}
                onChange={handleChange}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Opacity fontSize="small" color="info" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                }}
              />
            </Box>
          </Box>

          <Divider />

          {/* Section: Body & Respiration */}
          <Box>
            <Typography
              variant="subtitle2"
              color="primary"
              gutterBottom
              sx={{ fontWeight: 600 }}
            >
              Physical & Respiratory
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 2,
                mb: 2,
              }}
            >
              <TextField
                label="Weight"
                type="number"
                name="weightKg"
                value={form.weightKg}
                onChange={handleChange}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MonitorWeight fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">kg</InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Height"
                name="heightCm"
                type="number"
                value={form.heightCm}
                onChange={handleChange}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Height fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">cm</InputAdornment>
                  ),
                }}
              />
            </Box>
            <TextField
              fullWidth
              required
              label="Respiratory Rate"
              type="number"
              name="respiratoryRate"
              value={form.respiratoryRate}
              onChange={handleChange}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Air fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">breaths/min</InputAdornment>
                ),
              }}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={saving}
          startIcon={
            saving ? <CircularProgress size={20} color="inherit" /> : null
          }
          onClick={async () => {
            setSaving(true);
            try {
              await onSave(); // wait for save to complete
            } catch (err) {
              console.error(err);
              // Optional: show snackbar for error
              setSnack({
                open: true,
                message: "Failed to save vitals",
                severity: "error",
              });
            } finally {
              setSaving(false); // always turn off saving
            }
          }}
          disableElevation
          sx={{ px: 4, borderRadius: 2 }}
        >
          {saving ? "saving..." : "Save Vitals"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
