import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Button,
  Typography,
  Box,
} from "@mui/material";
import { todayISO } from "../helpers/labHelpers";
import BloodChemTemplate from "../labTemplates/BloodChemistry";
import ClinicalChemistry from "../labTemplates/ClinicalChemistry";
import Urinalysis from "../labTemplates/Urinalysis";
import Serology from "../labTemplates/Serology";
import PregnancyTestTemplate from "../labTemplates/PregnancyTest";
import Hba1cTemplate from "../labTemplates/HBA1C";
import BloodTyping from "../labTemplates/BloodTyping";
import Fecalysis from "../labTemplates/Fecalysis";
import HematologyTemplate from "../labTemplates/Hematology";
import KOHTemplate from "../labTemplates/KOH";

export default function EnterResultsDialog({ open, onClose, item, onSave }) {
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (!open) return;
    if (!item) return;

    setForm({
      ...item,
      performedDate: item.performedDate || todayISO(),
      performedBy: item.performedBy || "Med Tech",
    });
  }, [open, item]);

  if (!form) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const submit = () => {
    onSave({
      ...form,
      resultSummary: (form.resultSummary || "").trim(),
      impression: (form.impression || "").trim(),
      techNotes: (form.techNotes || "").trim(),
      status: "Ready",
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Enter Lab Results</DialogTitle>
      {/* <BloodChemTemplate /> */}
      {/* <ClinicalChemistry /> */}
      {/* <Urinalysis /> */}
      {/* <Serology /> */}
      {/* <PregnancyTestTemplate /> */}
      {/* <Hba1cTemplate /> */}
      {/* <BloodTyping /> */}
      {/* <Fecalysis /> */}
      {/* <HematologyTemplate /> */}
      <KOHTemplate />

      {/* <DialogContent dividers>
        <Box className="mb-3">
          <Typography className="font-semibold">
            {form.testType} • Requested: {form.requestedDate}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Saving will set status to <b>Ready</b>.
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Performed By"
              name="performedBy"
              value={form.performedBy}
              onChange={handleChange}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Performed Date"
              type="date"
              name="performedDate"
              value={form.performedDate}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Result Summary"
              name="resultSummary"
              value={form.resultSummary}
              onChange={handleChange}
              fullWidth
              multiline
              minRows={4}
              placeholder="Enter result values or summary..."
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Impression"
              name="impression"
              value={form.impression}
              onChange={handleChange}
              fullWidth
              multiline
              minRows={2}
              placeholder="Optional impression / findings..."
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Technician Notes"
              name="techNotes"
              value={form.techNotes}
              onChange={handleChange}
              fullWidth
              multiline
              minRows={2}
              placeholder="Optional notes..."
            />
          </Grid>
        </Grid>
      </DialogContent> */}

      <DialogActions className="px-6 py-4">
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={submit} variant="contained">
          Save Results (Ready)
        </Button>
      </DialogActions>
    </Dialog>
  );
}
