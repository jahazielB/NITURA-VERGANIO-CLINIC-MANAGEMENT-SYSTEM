import { useMemo } from "react";
import { Box, Typography, Modal, IconButton, Divider } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import clinicHeaderLogo from "../../assets/HEADER-CLINIC.png";

export default function PrescriptionViewModal({
  open,
  onClose,
  item,
  visitLabel,
}) {
  const data = useMemo(() => item?.resultDetails || {}, [item]);

  // Data mapping from source document structure
  const p = {
    name: item?.patientName || "",
    age: item?.patientAge || "",
    sex: item?.patientSex || "",
    date: item?.date || "",
    address: item?.patientAddress || "",
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Box
        sx={{
          position: "relative",
          width: "95%",
          maxWidth: 850,
          maxHeight: "95vh",
          bgcolor: "white",
          p: 6,
          overflowY: "auto",
          borderRadius: 0,
          outline: "none",
        }}
      >
        {/* Top Utility Bar (Non-Printable) */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
          sx={{
            borderBottom: "1px solid #eee",
            pb: 1,
            "@media print": { display: "none" },
          }}
        >
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ fontWeight: 700 }}
          >
            {visitLabel || "Medical Prescription"}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* --- PRESCRIPTION CONTENT --- */}
        <Box>
          {/* Header Logo */}
          <Box textAlign="center" mb={4}>
            <img
              src={clinicHeaderLogo}
              alt="Clinic Header"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          </Box>

          {/* Patient Info Rows  */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 4 }}>
            {/* Row 1: Name and Date */}
            <Box display="flex" gap={4}>
              <Line label="PATIENT’S NAME" value={p.name} flex={3} />
              <Line label="DATE" value={p.date} flex={1} />
            </Box>

            {/* Row 2: Address, Age, and Sex combined  */}
            <Box display="flex" gap={3}>
              <Line label="ADDRESS" value={p.address} flex={4} />
              <Line label="AGE" value={p.age} flex={0.8} />
              <Line label="SEX" value={p.sex} flex={0.8} />
            </Box>
          </Box>

          {/* Rx Symbol */}
          <Typography
            variant="h3"
            sx={{ fontFamily: "serif", fontWeight: "bold", mb: 2 }}
          >
            ℞
          </Typography>

          {/* Medications Area */}
          <Box sx={{ minHeight: 400, px: 1 }}>
            <Typography
              variant="body1"
              sx={{
                whiteSpace: "pre-wrap",
                lineHeight: 1.8,
                fontSize: "1.15rem",
                fontFamily: "'Times New Roman', serif",
                color: "#111",
              }}
            >
              {data.medications || data.remarks || ""}
            </Typography>
          </Box>

          {/* Signature Block */}
          <Box mt={6} display="flex" justifyContent="flex-end">
            <Box sx={{ textAlign: "center", width: 280 }}>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: 16,
                  mb: 0.5,
                  textTransform: "uppercase",
                }}
              >
                DRA. VERGANIO
              </Typography>
              <Box
                sx={{ borderTop: "1.5px solid black", width: "100%", mb: 1 }}
              />
              <Typography
                variant="caption"
                sx={{ display: "block", fontWeight: 700 }}
              >
                Lic. No. ___________
              </Typography>
              <Typography
                variant="caption"
                sx={{ display: "block", fontWeight: 700 }}
              >
                PTR No. ___________
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}

/**
 * Flat Line UI helper
 * Ensures no shadows and clear underline
 */
function Line({ label, value, flex = 1 }) {
  return (
    <Box display="flex" gap={1} alignItems="flex-end" sx={{ flex: flex }}>
      <Typography
        sx={{
          fontWeight: 800,
          fontSize: "0.75rem",
          whiteSpace: "nowrap",
          color: "#333",
        }}
      >
        {label}:
      </Typography>
      <Box
        flex={1}
        sx={{
          borderBottom: "1px solid black",
          fontSize: "0.9rem",
          px: 0.5,
          minHeight: 20,
          fontWeight: 500,
        }}
      >
        {value}
      </Box>
    </Box>
  );
}
