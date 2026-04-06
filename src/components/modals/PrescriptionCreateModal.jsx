import { supabase } from "../../lib/supabaseClient";
import { useState } from "react";
import {
  Box,
  Typography,
  Modal,
  IconButton,
  TextField,
  Button,
  CircularProgress,
  Autocomplete,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

import drugs from "../../data/drugs.json";

export default function PrescriptionCreateModal({
  open,
  onClose,
  visitId,
  doctorId,
  setSnack,
}) {
  const [form, setForm] = useState([
    {
      medication: "",
      dosage: "",
      frequency: "",
      instructions: "",
      duration: "",
    },
  ]);

  const [saving, setSaving] = useState(false);

  const drugSearch = drugs;

  // ➕ Add row
  const handleAddRow = () => {
    setForm((prev) => [
      ...prev,
      {
        medication: "",
        dosage: "",
        frequency: "",
        instructions: "",
        duration: "",
      },
    ]);
  };

  // ❌ Remove row
  const handleRemoveRow = (index) => {
    setForm((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      return updated.length ? updated : prev;
    });
  };

  // ✏️ Update row field
  const handleChange = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  // 💊 SMART FILL
  const handleSelectDrug = (index, drug) => {
    if (!drug) return;

    handleChange(index, "medication", drug.generic || "");
    handleChange(index, "dosage", drug.common_dose || "");
  };

  // 💾 Save
  const handleSave = async () => {
    try {
      setSaving(true);

      const payload = form
        .filter((f) => f.medication.trim())
        .map((f) => ({
          visit_id: visitId,
          doctor_id: doctorId,
          medication: f.medication,
          dosage: f.dosage,
          frequency: f.frequency,
          instructions: f.instructions,
          duration: f.duration,
        }));

      if (!payload.length) {
        setSnack({
          open: true,
          message: "Add at least one medication",
          severity: "warning",
        });
        return;
      }

      const { error } = await supabase
        .from("prescription_items")
        .insert(payload);

      if (error) throw error;

      setSnack({
        open: true,
        message: "Prescription Added!",
        severity: "success",
      });

      onClose();
    } catch (e) {
      console.error(e);
      setSnack({
        open: true,
        message: "Error saving prescription",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Box
        sx={{
          width: "95%",
          maxWidth: 1000,
          bgcolor: "#fff",
          p: 3,
          borderRadius: 2,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* HEADER */}
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography fontWeight={700}>Create Prescription</Typography>

          <Box>
            <TextField select size="small"></TextField>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* TABLE HEADER */}
        <Box
          sx={{
            display: "flex",
            gap: 1,
            px: 1,
            py: 1,
            mb: 1,
            borderRadius: 2,
            backgroundColor: "#1976d2",
            color: "white",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <Box flex={2}>MEDICATION</Box>
          <Box flex={1}>DOSAGE</Box>
          <Box flex={1}>FREQUENCY</Box>
          <Box flex={2}>INSTRUCTIONS</Box>
          <Box flex={1}>DURATION</Box>
          <Box flex={0.5}></Box>
        </Box>

        {/* ROWS */}
        {form.map((row, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
              p: 1.5,
              mb: 1,
              borderRadius: 2,
              border: "1px solid #e0e0e0",
              backgroundColor: "#fafafa",
              "&:hover": { backgroundColor: "#f5f5f5" },
            }}
          >
            {/* MEDICATION AUTOCOMPLETE */}
            <Autocomplete
              options={drugSearch}
              value={
                drugSearch.find((d) => d.generic === row.medication) || null
              }
              onChange={(_, value) => handleSelectDrug(index, value)}
              getOptionLabel={(option) => option.label || ""}
              filterOptions={(options, state) => {
                const input = (state.inputValue || "").toLowerCase();

                return options
                  .filter((drug) =>
                    (drug.label || "").toLowerCase().includes(input),
                  )
                  .slice(0, 5);
              }}
              renderOption={(props, option) => (
                <li {...props} key={option.value}>
                  <Box>
                    <Typography fontSize={14}>{option.label}</Typography>
                    <Typography fontSize={11} color="gray">
                      {option.brand} • {option.category}
                    </Typography>
                  </Box>
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Medication"
                  size="small"
                  sx={{ flex: 2, minWidth: 220 }}
                />
              )}
            />

            <TextField
              value={row.dosage}
              onChange={(e) => handleChange(index, "dosage", e.target.value)}
              size="small"
              label="Dose"
              sx={{ flex: 1 }}
            />

            <TextField
              value={row.frequency}
              onChange={(e) => handleChange(index, "frequency", e.target.value)}
              size="small"
              label="Freq"
              sx={{ flex: 1 }}
            />

            <TextField
              value={row.instructions}
              onChange={(e) =>
                handleChange(index, "instructions", e.target.value)
              }
              size="small"
              label="Instructions"
              sx={{ flex: 2 }}
            />

            <TextField
              value={row.duration}
              onChange={(e) => handleChange(index, "duration", e.target.value)}
              size="small"
              label="Duration"
              sx={{ flex: 1 }}
            />

            <IconButton onClick={() => handleRemoveRow(index)}>
              <DeleteIcon color="error" />
            </IconButton>
          </Box>
        ))}

        {/* ADD ROW */}
        <Box className="flex justify-between items-center">
          <Button startIcon={<AddIcon />} onClick={handleAddRow} sx={{ mt: 1 }}>
            Add Medication
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            variant="contained"
            size="small"
            sx={{ mr: 1 }}
          >
            {saving ? <CircularProgress size={18} /> : "Save"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
