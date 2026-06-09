import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import BloodChemTemplate from "../labTemplates/BloodChemistry";
import ClinicalChemistry from "../labTemplates/ClinicalChemistry";
import UrinalysisTemplate from "../labTemplates/Urinalysis";
import Serology from "../labTemplates/Serology";
import PregnancyTestTemplate from "../labTemplates/PregnancyTest";
import Hba1cTemplate from "../labTemplates/HBA1C";
import BloodTyping from "../labTemplates/BloodTyping";
import Fecalysis from "../labTemplates/Fecalysis";
import HematologyTemplate from "../labTemplates/Hematology";
import KOHTemplate from "../labTemplates/KOH";
import { labResultItemsRowsToTemplateValues } from "../helpers/labResultMapper";
import { saveLabResults } from "../../services/labRequestService";

const normalizeServiceName = (value) => String(value || "").trim().toLowerCase();

const TEMPLATE_BY_SERVICE = {
  cbc: HematologyTemplate,
  hematology: HematologyTemplate,
  "blood chemistry": BloodChemTemplate,
  "clinical chemistry": ClinicalChemistry,
  urinalysis: UrinalysisTemplate,
  serology: Serology,
  "pregnancy test": PregnancyTestTemplate,
  "glycated hemoglobin (hba1c)": Hba1cTemplate,
  "hemoglobin(hba1c)": Hba1cTemplate,
  "hemoglobin (hba1c)": Hba1cTemplate,
  "blood typing": BloodTyping,
  fecalysis: Fecalysis,
  koh: KOHTemplate,
};

export default function EnterResultsDialog({
  open,
  onClose,
  item,
  onSave,
  patient,
}) {
  if (!item) return null;

  const serviceName = Array.isArray(item?.testType)
    ? item.testType[0]
    : item?.testType;
  const SelectedTemplate = TEMPLATE_BY_SERVICE[normalizeServiceName(serviceName)];
  const initialValues = labResultItemsRowsToTemplateValues(
    item.lab_result_items || [],
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <ResultsTemplateBody
        key={`${item.id}-${open ? "open" : "closed"}`}
        Template={SelectedTemplate}
        initialValues={initialValues}
        item={item}
        onClose={onClose}
        onSave={onSave}
        patient={patient}
      />
    </Dialog>
  );
}

function ResultsTemplateBody({
  Template,
  initialValues,
  item,
  onClose,
  onSave,
  patient,
}) {
  const [values, setValues] = useState(initialValues);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (saving) return;

    setSaving(true);
    try {
      const updatedRequest = await saveLabResults(item.id, values);
      onSave?.(updatedRequest);
      onClose();
    } catch (error) {
      console.error("Failed to save lab results:", error);
      alert(error?.message || "Failed to save lab results.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <DialogTitle>Enter Lab Results</DialogTitle>

      <DialogContent dividers sx={{ p: 2.5 }}>
        {Template ? (
          <Template
            value={values}
            onChange={setValues}
            readOnly={saving}
            patient={patient}
          />
        ) : (
          <Box sx={{ py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No template is available for this service.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions className="px-6 py-4">
        <Button onClick={onClose} variant="outlined" disabled={saving}>
          Cancel
        </Button>
        <Button onClick={submit} variant="contained" disabled={saving}>
          {saving ? "Saving..." : "Save Results (Ready)"}
        </Button>
      </DialogActions>
    </>
  );
}
