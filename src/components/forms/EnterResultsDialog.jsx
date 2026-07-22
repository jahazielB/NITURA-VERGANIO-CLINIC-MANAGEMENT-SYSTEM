import { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
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
import {
  fetchLabServiceItemsWithResults,
  normalizedToTemplateValues,
} from "../../services/labResultNormalizer";
import {
  resolveLabServiceId,
  saveLabResults,
} from "../../services/labRequestService";

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
  onNotify,
}) {
  if (!item) return null;

  const serviceName = Array.isArray(item?.testType)
    ? item.testType[0]
    : item?.testType;
  const SelectedTemplate = TEMPLATE_BY_SERVICE[normalizeServiceName(serviceName)];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <ResultsTemplateBody
        key={`${item.id}-${open ? "open" : "closed"}`}
        Template={SelectedTemplate}
        item={item}
        serviceName={serviceName}
        onClose={onClose}
        onSave={onSave}
        patient={patient}
        onNotify={onNotify}
      />
    </Dialog>
  );
}

function ResultsTemplateBody({
  Template,
  item,
  serviceName,
  onClose,
  onSave,
  patient,
  onNotify,
}) {
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState({});
  const [serviceItems, setServiceItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const staff = {
    medTechName: item?.performedBy || "",
    medTechLic: item?.performedByLic || "",
    pathologistName: (item?.releasedByRole === "Doctor" || item?.releasedByRole === "Admin")
      ? (item?.releasedBy || "")
      : "",
    pathologistLic: item?.releasedByLic || "",
  };

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const serviceId =
          item.labServiceId ||
          item.labServiceID ||
          (serviceName ? await resolveLabServiceId(serviceName) : "");
        const result = await fetchLabServiceItemsWithResults(
          item.id,
          serviceId,
        );
        if (cancelled) return;

        setServiceItems(result.serviceItems);
        setValues(normalizedToTemplateValues(result.normalizedItems, serviceName));
      } catch (err) {
        console.error("Failed to load lab service items:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [item.id, item.labServiceId, item.labServiceID, serviceName]);

  const submit = async () => {
    if (saving) return;

    setSaving(true);
    try {
      const updatedRequest = await saveLabResults(
        item.id,
        values,
        serviceName,
        serviceItems,
      );
      onSave?.(updatedRequest);
      onNotify?.("Lab results saved successfully.", "success");
      onClose();
    } catch (error) {
      console.error("Failed to save lab results:", error);
      onNotify?.(error?.message || "Failed to save lab results.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <DialogTitle>Enter Lab Results</DialogTitle>

      <DialogContent dividers sx={{ p: 2.5 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : Template ? (
          <Template
            value={values}
            onChange={setValues}
            readOnly={saving}
            patient={patient}
            staff={staff}
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
        <Button onClick={onClose} variant="outlined" disabled={saving || loading}>
          Cancel
        </Button>
        <Button
          onClick={submit}
          variant="contained"
          disabled={saving || loading}
          startIcon={
            saving ? <CircularProgress size={16} color="inherit" /> : null
          }
        >
          {saving ? "Saving..." : "Save Results (Ready)"}
        </Button>
      </DialogActions>
    </>
  );
}
