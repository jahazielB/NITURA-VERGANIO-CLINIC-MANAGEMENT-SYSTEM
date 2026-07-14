import { useEffect } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Divider,
  GlobalStyles,
} from "@mui/material";
import { Close as CloseIcon, Print as PrintIcon } from "@mui/icons-material";
import clinicHeaderLogo from "../../../../assets/HEADER-CLINIC.png";

export default function SoapViewDialog({ open, onClose, row, printMode }) {
  useEffect(() => {
    if (open && printMode) {
      const timer = setTimeout(() => window.print(), 100);
      return () => clearTimeout(timer);
    }
  }, [open, printMode]);

  if (!row) return null;

  const { patientName, dateTime, chiefComplaint, soapData, doctorName } = row;

  return (
    <>
      <GlobalStyles
        styles={{
          "@page": { size: "A4", margin: "12mm" },
          "@media print": {
            "html, body": { background: "#fff !important", margin: 0, padding: 0, color: "#000 !important" },
            "body *": { visibility: "hidden" },
            ".soap-print-area, .soap-print-area *": { visibility: "visible", color: "#000 !important" },
            ".soap-print-area": { position: "absolute", left: 0, top: 0, width: "100%", maxWidth: "186mm", margin: "0 auto" },
            ".soap-print-area .MuiPaper-root": { boxShadow: "none !important", border: "1px solid #000 !important", backgroundColor: "#fff !important" },
            ".soap-print-area .no-print": { display: "none !important" },
            ".MuiDialog-root, .MuiDialog-container, .MuiBackdrop-root": { position: "static !important", display: "block !important", background: "transparent !important" },
            ".MuiDialog-paper": { maxWidth: "none !important", boxShadow: "none !important", border: "none !important", position: "static !important" },
            ".MuiDialogContent-root": { padding: "8px !important" },
          },
        }}
      />

      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <Box className="soap-print-area">
          <DialogTitle sx={{ m: 0, p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }} className="no-print">
            <Typography variant="h6" sx={{ fontWeight: 600 }}>SOAP Notes</Typography>
            <Box className="no-print" sx={{ display: "flex", gap: 1 }}>
              <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
            </Box>
          </DialogTitle>

          <Divider className="no-print" />

          <DialogContent sx={{ p: 3 }}>
            <Box textAlign="center" mb={2}>
              <img src={clinicHeaderLogo} alt="Clinic Header" style={{ maxWidth: "100%", height: "auto" }} />
            </Box>

            <Box mb={2}>
              <Line label="PATIENT" value={patientName} />
              <Line label="DATE" value={dateTime} />
              <Line label="DOCTOR" value={doctorName} />
              <Line label="CHIEF COMPLAINT" value={chiefComplaint} />
            </Box>

            <Divider sx={{ mb: 2 }} />

            {(!soapData || (!soapData.subjective && !soapData.objective && !soapData.assessment && !soapData.plan)) ? (
              <Typography color="text.secondary" textAlign="center" py={4}>
                No SOAP content recorded for this visit.
              </Typography>
            ) : (
              <Box>
                <Section title="S — Subjective" color="blue">{soapData?.subjective || "—"}</Section>
                <Section title="O — Objective" color="green">{soapData?.objective || "—"}</Section>
                <Section title="A — Assessment" color="purple">{soapData?.assessment || "—"}</Section>
                <Section title="P — Plan" color="orange">{soapData?.plan || "—"}</Section>
              </Box>
            )}
          </DialogContent>

          <Divider className="no-print" />

          <DialogActions sx={{ p: 2, justifyContent: "center", gap: 1 }} className="no-print">
            <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()}>
              Print
            </Button>
            <Button variant="contained" onClick={onClose}>Close</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
}

function Line({ label, value }) {
  return (
    <Box display="flex" gap={1} alignItems="flex-end" mb={0.5}>
      <Typography sx={{ fontWeight: 700, fontSize: 13, minWidth: 160 }}>{label}:</Typography>
      <Box flex={1} borderBottom="1px solid black" sx={{ fontSize: 13, px: 0.5, minHeight: 18 }}>
        {value || ""}
      </Box>
    </Box>
  );
}

function Section({ title, color, children }) {
  return (
    <Box mb={2}>
      <Typography sx={{ fontWeight: 700, fontSize: 14, color }} gutterBottom>
        {title}
      </Typography>
      <Box
        sx={{
          bgcolor: "#f8fafc",
          borderRadius: 1,
          p: 2,
          whiteSpace: "pre-wrap",
          fontSize: 14,
          lineHeight: 1.6,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        {children || "—"}
      </Box>
    </Box>
  );
}