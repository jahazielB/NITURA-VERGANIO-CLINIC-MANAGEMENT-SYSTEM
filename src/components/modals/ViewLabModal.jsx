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
    pathologistName: (item?.releasedByRole === "Doctor" || item?.releasedByRole === "Admin")
      ? (item?.releasedBy || "")
      : "",
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
    const printArea = document.querySelector(".lab-print-area");
    if (!printArea) return;

    const styles = document.querySelectorAll("style, link[rel='stylesheet']");
    let stylesHtml = "";
    styles.forEach((s) => (stylesHtml += s.outerHTML));

    const clone = printArea.cloneNode(true);
    clone.querySelectorAll("img").forEach((img) => {
      if (img.src && !img.src.startsWith("http")) {
        img.src = new URL(img.src, window.location.origin).href;
      }
    });

    const spacious = `
      @page { size: A4 portrait; margin: 15mm; }
      html, body { margin: 0; padding: 0; background: #fff; width: 100%; }
      * { color: #000 !important; }
      .no-print, .MuiDialog-root, .MuiDialogActions-root, .MuiDialogTitle-root { display: none !important; }
      .MuiPaper-root { box-shadow: none !important; border: 1px solid #000 !important; padding: 7mm !important; }
      .MuiGrid-grid-md-6 { flex: 0 0 50% !important; max-width: 50% !important; }
      .MuiTypography-root { font-size: 12px !important; }
      .MuiTypography-root[style*="font-weight: 900"] { font-size: 13px !important; }
      .MuiInputBase-input { font-size: 12px !important; }
      img { max-height: 70px !important; object-fit: contain; }
      input, textarea { border-color: #000 !important; }
    `;

    const compact = `
      @page { size: A4 portrait; margin: 12mm; }
      html, body { margin: 0; padding: 0; background: #fff; width: 100%; }
      * { color: #000 !important; }
      .no-print, .MuiDialog-root, .MuiDialogActions-root, .MuiDialogTitle-root { display: none !important; }
      .MuiPaper-root { box-shadow: none !important; border: 1px solid #000 !important; padding: 4mm !important; }
      .MuiBox-root { margin: 0 !important; padding: 0 !important; }
      .MuiGrid-root { margin: 0 !important; }
      .MuiGrid-root > .MuiGrid-item { padding: 1px !important; }
      .MuiGrid-grid-md-6 { flex: 0 0 50% !important; max-width: 50% !important; }
      .MuiTypography-root { font-size: 12px !important; }
      .MuiInputBase-input { font-size: 12px !important; }
      [style*="margin-bottom"] { margin-bottom: 2px !important; }
      [style*="margin-top"] { margin-top: 2px !important; }
      img { max-height: 60px !important; object-fit: contain; }
      input, textarea { border-color: #000 !important; }
    `;

    const win = window.open("", "_blank");
    if (!win) return;

    win.document.write(`
      <html>
        <head>
          ${stylesHtml}
          <style id="print-layout">${spacious}</style>
        </head>
        <body>${clone.innerHTML}</body>
      </html>
    `);
    win.document.close();

    const checkFit = () => {
      const body = win.document.body;
      if (!body) return true;
      const ow = body.style.width;
      const om = body.style.maxHeight;
      const oo = body.style.overflow;
      body.style.width = "680px";
      body.style.maxHeight = "1010px";
      body.style.overflow = "hidden";
      const fits = body.scrollHeight - body.clientHeight <= 15;
      body.style.width = ow;
      body.style.maxHeight = om;
      body.style.overflow = oo;
      return fits;
    };

    const doPrint = () => {
      win.focus();
      setTimeout(() => win.print(), 200);
    };

    setTimeout(() => {
      if (!checkFit()) {
        const el = win.document.getElementById("print-layout");
        if (el) el.textContent = compact;
      }
      doPrint();
    }, 300);
  };

  return (
    <>
      <GlobalStyles
        styles={{
          "@page": {
            size: "A4",
            margin: "12mm",
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
