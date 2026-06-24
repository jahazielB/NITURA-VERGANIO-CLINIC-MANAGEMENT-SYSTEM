import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  GlobalStyles,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
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

const normalizeServiceName = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const TEMPLATE_BY_SERVICE = {
  cbc: HematologyTemplate,
  hematology: HematologyTemplate,
  "blood chemistry": BloodChemTemplate,
  "clinical chemistry": ClinicalChemistry,
  urinalysis: UrinalysisTemplate,
  serology: Serology,
  "pregnancy test": PregnancyTestTemplate,
  "glycated hemoglobin (hba1c)": Hba1cTemplate,
  "glycated hemoglobin(hba1c)": Hba1cTemplate,
  "hemoglobin (hba1c)": Hba1cTemplate,
  "blood typing": BloodTyping,
  fecalysis: Fecalysis,
  koh: KOHTemplate,
  fbs: BloodChemTemplate,
  "lipid panel": BloodChemTemplate,
};

export default function ViewLabModal({
  open,
  onClose,
  item,
  visitLabel = "",
  patient,
}) {
  const staff = {
    medTechName: item?.performedBy || "",
    medTechLic: item?.performedByLic || "",
    pathologistName: item?.releasedBy || "",
    pathologistLic: item?.releasedByLic || "",
  };
  const [loading, setLoading] = useState(false);
  const [templateValues, setTemplateValues] = useState({});

  const serviceName = Array.isArray(item?.testType)
    ? item.testType[0]
    : item?.testType;
  const SelectedTemplate =
    TEMPLATE_BY_SERVICE[normalizeServiceName(serviceName)];

  useEffect(() => {
    if (!open || !item?.id || !item?.labServiceId) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const result = await fetchLabServiceItemsWithResults(
          item.id,
          item.labServiceId,
        );
        if (!cancelled) {
          setTemplateValues(
            normalizedToTemplateValues(result.normalizedItems, serviceName),
          );
        }
      } catch (err) {
        console.error("Failed to load lab results:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [open, item?.id, item?.labServiceId, serviceName]);

  if (!item) return null;

  const handlePrint = () => {
    window.setTimeout(() => window.print(), 0);
  };

  return (
    <>
      <GlobalStyles
        styles={{
          "@page": {
            size: "A4",
            margin: "12mm",
          },
          "@media print": {
            "html, body": {
              background: "#fff !important",
              margin: 0,
              padding: 0,
              color: "#000 !important",
            },
            "body *": {
              visibility: "hidden",
            },
            ".lab-print-area, .lab-print-area *": {
              visibility: "visible",
              color: "#000 !important",
            },
            ".lab-print-area": {
              position: "absolute",
              left: 0,
              top: 0,
              width: "100%",
              maxWidth: "186mm",
              margin: "0 auto",
            },
            ".lab-print-area .MuiPaper-root": {
              boxShadow: "none !important",
              border: "1px solid #000 !important",
              backgroundColor: "#fff !important",
            },
            ".lab-print-area .no-print": {
              display: "none !important",
            },
            ".MuiDialog-root, .MuiDialog-container, .MuiBackdrop-root": {
              position: "static !important",
              display: "block !important",
              background: "transparent !important",
            },
            ".MuiDialog-paper": {
              maxWidth: "none !important",
              width: "100% !important",
              margin: "0 !important",
              overflow: "visible !important",
            },
          },
        }}
      />

      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle sx={{ pb: 1.5 }}>
          <Stack spacing={0.5}>
            <Typography variant="h6" fontWeight={700}>
              Lab Result Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {item.testType || "Laboratory Service"} • Visit:{" "}
              {(visitLabel || item.visitId)
                ? new Date(visitLabel || item.visitId).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "N/A"} • Requested:{" "}
              {item.requestedDate
                ? new Date(item.requestedDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "N/A"}
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent
          dividers
          className="lab-print-area"
          sx={{
            p: {
              xs: 2,
              md: 2.5,
            },
            backgroundColor: "#f8fafc",
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: {
                xs: 2,
                md: 3,
              },
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Stack spacing={1.5} mb={2} className="no-print">
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Status
                  </Typography>
                  <Box mt={0.5}>
                    <Chip
                      size="small"
                      label={item.status || "Unknown"}
                      color={item.status === "Released" ? "success" : "default"}
                    />
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary">
                  Printable laboratory result preview
                </Typography>
              </Stack>
            </Stack>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : SelectedTemplate ? (
              <SelectedTemplate
                value={templateValues}
                readOnly
                patient={patient}
                staff={staff}
              />
            ) : (
              <Box sx={{ py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No template is available for this laboratory service.
                </Typography>
              </Box>
            )}
          </Paper>
        </DialogContent>

        <DialogActions className="no-print" sx={{ px: 3, py: 2 }}>
          <Tooltip title={item?.status !== "Released" ? "Results must be released first" : ""}>
            <span>
              <Button startIcon={<PrintIcon />} onClick={handlePrint} disabled={item?.status !== "Released"}>
                Print
              </Button>
            </span>
          </Tooltip>
          <Button onClick={onClose} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
