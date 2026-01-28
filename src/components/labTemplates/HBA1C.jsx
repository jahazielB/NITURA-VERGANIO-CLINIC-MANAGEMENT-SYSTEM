import { useMemo } from "react";
import {
  Box,
  Typography,
  Grid,
  TextField,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@mui/material";
import clinicHeaderLogo from "../../assets/HEADER-CLINIC.png";

/**
 * Matches the provided GLYCATED HEMOGLOBIN(HBA1C) form. :contentReference[oaicite:1]{index=1}
 *
 * Props:
 *  value: resultDetails object
 *  onChange: (next) => void
 *  readOnly: boolean
 *  patient: optional { name, age, sex, date, address, requestingPhysician }
 */

const DEFAULTS = {
  resultPercent: "", // e.g. "6.4"
};

export default function Hba1cTemplate({
  value,
  onChange,
  readOnly = false,
  patient,
}) {
  const data = useMemo(() => ({ ...DEFAULTS, ...(value || {}) }), [value]);

  const p = patient || {
    name: "LAUDENCIA, GLORIA",
    age: "14",
    sex: "F",
    date: "10/28/23",
    address: "AMLANG, ROSARIO, LA UNION",
    requestingPhysician: "",
  };

  const setField = (key, val) => {
    if (!onChange) return;
    onChange({ ...data, [key]: val });
  };

  return (
    <Box
      sx={{
        border: "2px solid",
        borderColor: "divider",
        borderRadius: 2,
        p: 2,
      }}
    >
      {/* Header */}
      <Box textAlign="center" mb={2}>
        <img
          src={clinicHeaderLogo}
          alt="Clinic Header"
          style={{ maxWidth: "100%", height: "auto" }}
        />
      </Box>

      {/* Patient info */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} sm={6}>
          <Line label="NAME" value={p.name} />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Line label="AGE" value={p.age} />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Line label="SEX" value={p.sex} />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Line label="DATE" value={p.date} />
        </Grid>

        <Grid item xs={12}>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Box sx={{ flex: 1, minWidth: 320 }}>
              <Line label="ADDRESS" value={p.address} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 320 }}>
              <Line
                label="REQUESTING PHYSICIAN"
                value={p.requestingPhysician}
              />
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Title */}
      <Box textAlign="center" mb={2}>
        <Typography sx={{ fontWeight: 900, letterSpacing: 0.7 }}>
          GLYCATED HEMOGLOBIN(HBA1C)
        </Typography>
      </Box>

      {/* Result line */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 2,
          px: 1,
        }}
      >
        <Typography sx={{ fontWeight: 900 }}>RESULT:</Typography>

        <TextField
          variant="standard"
          disabled={readOnly}
          value={data.resultPercent || ""}
          onChange={(e) => setField("resultPercent", e.target.value)}
          placeholder="e.g. 6.4"
          InputProps={{
            disableUnderline: true,
            sx: {
              fontSize: 14,
              px: 1,
              py: 0.4,
              border: "1px solid black",
              borderRadius: 0,
              width: 140,
              textAlign: "center",
            },
          }}
        />

        <Typography sx={{ fontWeight: 900 }}>%</Typography>
      </Box>

      {/* Reference block (as in ODT) */}
      <Box sx={{ px: 1, mt: 2 }}>
        <Table
          size="small"
          sx={{
            border: "1px solid black",
            borderCollapse: "collapse",
            width: "100%",
            "& td, & th": {
              border: "1px solid black",
              padding: "6px 10px",
              fontSize: 13,
            },
            "& th": {
              textAlign: "left",
              fontWeight: 900,
            },
          }}
        >
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontWeight: 900 }}>NORMAL VALUE</TableCell>
              <TableCell align="right">NGSP, A1C %</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 900 }}>PRE-DIABETES</TableCell>
              <TableCell align="right">5.7 – 6.4 %</TableCell>
            </TableRow>

            <TableRow>
              <TableCell sx={{ fontWeight: 900 }}>DIABETES</TableCell>
              <TableCell align="right">≥ 6.5 %</TableCell>
            </TableRow>

            <TableRow>
              <TableCell sx={{ fontWeight: 900 }}>
                DIABETIC PATIENT CARE GOAL
              </TableCell>
              <TableCell align="right">&lt; 7.0 %</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>

      {/* Signatures */}
      <Box
        mt={4}
        display="flex"
        justifyContent="space-between"
        alignItems="flex-end"
      >
        <Box width="45%">
          <Typography sx={{ fontWeight: 800, fontSize: 12 }}>
            JENINA A. MACADAEG, RMT
          </Typography>
          <Typography
            variant="body2"
            sx={{ borderTop: "1px solid", width: "85%" }}
          >
            &nbsp;
          </Typography>
          <Typography variant="caption">PRC LIC NO.: 89605</Typography>
          <Typography variant="caption" display="block">
            MEDICAL TECHNOLOGIST
          </Typography>
        </Box>

        <Box width="45%" textAlign="right">
          <Typography sx={{ fontWeight: 800, fontSize: 12 }}>
            MICHAEL L. MOSTALES, M.D, DPSP
          </Typography>
          <Typography
            variant="body2"
            sx={{ borderTop: "1px solid", width: "85%", ml: "auto" }}
          >
            &nbsp;
          </Typography>
          <Typography variant="caption">PRC LIC NO.: 102433</Typography>
          <Typography variant="caption" display="block">
            PATHOLOGIST
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

function RefRow({ label, value }) {
  return (
    <Box display="flex" justifyContent="space-between" sx={{ py: 0.4 }}>
      <Typography sx={{ fontWeight: 900 }}>{label}</Typography>
      <Typography sx={{ fontWeight: 900 }}>{value}</Typography>
    </Box>
  );
}

function Line({ label, value }) {
  return (
    <Box display="flex" gap={1} alignItems="flex-end">
      <Typography sx={{ fontWeight: 700, fontSize: 13 }}>{label}:</Typography>
      <Box
        flex={1}
        borderBottom="1px solid black"
        sx={{ fontSize: 13, px: 0.5, minHeight: 18 }}
      >
        {value || ""}
      </Box>
    </Box>
  );
}
