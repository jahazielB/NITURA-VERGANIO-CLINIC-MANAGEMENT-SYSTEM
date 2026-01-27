import { useMemo } from "react";
import {
  Box,
  Typography,
  Grid,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import clinicHeaderLogo from "../../assets/HEADER-CLINIC.png";

/**
 * BloodChemTemplate.jsx
 * Form-style encoder that visually matches the clinic's Blood Chemistry sheet.
 *
 * Props:
 *  value: resultDetails object
 *  onChange: function(nextDetails)
 *  readOnly: boolean
 */

const ROWS = [
  {
    test: "FBS",
    normalConventional: "74-106 mg/dL",
    normalSi: "4.1-5.90 mmol/L",
  },
  { test: "RBS", normalConventional: "70-130 mg/dL", normalSi: "" },
  { test: "BUN", normalConventional: "7-21 mg/dL", normalSi: "2.4-7.4 mmol/L" },
  {
    test: "CREATININE",
    normalConventional: "0.5-1.70 mg/dL",
    normalSi: "53-115 umol/L",
  },
  {
    test: "TOTAL CHOLESTEROL",
    normalConventional: "<200 mg/dL",
    normalSi: "<5.17 mmol/L",
  },
  {
    test: "TRIGLYCERIDES",
    normalConventional: "44-148 mg/dL",
    normalSi: "<1.69 mmol/L",
  },
  {
    test: "HDL",
    normalConventional: "30-75 mg/dL",
    normalSi: "0.78-1.9 mmol/L",
  },
  {
    test: "LDL",
    normalConventional: "66-178 mg/dL",
    normalSi: "1.72-4.6 mmol/L",
  },
  {
    test: "BLOOD URIC ACID",
    normalConventional: "2.5-7.7 mg/dL",
    normalSi: "155-428 umol/L",
  },
  { test: "SGOT", normalConventional: "0-40 U/L", normalSi: "0-40 U/L" },
  { test: "SGPT", normalConventional: "0-38 U/L", normalSi: "0-38 U/L" },
];

function buildDefaults() {
  return ROWS.reduce((acc, r) => {
    acc[r.test] = { conventional: "", si: "" };
    return acc;
  }, {});
}

export default function BloodChemTemplate({
  value,
  onChange,
  readOnly = false,
}) {
  const defaults = useMemo(() => buildDefaults(), []);
  const data = { ...defaults, ...(value || {}) };

  const setVal = (test, field, val) => {
    if (!onChange) return;
    onChange({
      ...data,
      [test]: { ...data[test], [field]: val },
    });
  };
  function Line({ label, value }) {
    return (
      <Box display="flex" gap={1} alignItems="flex-end">
        <Typography fontWeight={700} variant="body2">
          {label}:
        </Typography>
        <Box
          flex={1}
          borderBottom="1px solid"
          sx={{
            fontSize: 13,
            px: 0.5,
            minHeight: 18,
          }}
        >
          {value || ""}
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        border: "2px solid",
        borderColor: "divider",
        borderRadius: 2,
        p: 2,
      }}
    >
      {/* Header (like the sheet) */}
      <Box textAlign="center" mb={2}>
        <img src={clinicHeaderLogo} />
        <Typography variant="body2">
          M&J Soriano Complex, MacArthur Highway
        </Typography>
        <Typography variant="body2">Damortis, Santo Tomas, La Union</Typography>
      </Box>

      {/* Patient info lines (visual only, real values come from main dialog) */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6}>
          <Line label="NAME" value="PANIT, TERESITA" />
        </Grid>
        <Grid item xs={2}>
          <Line label="AGE" value="68" />
        </Grid>
        <Grid item xs={2}>
          <Line label="SEX" value="F" />
        </Grid>
        <Grid item xs={2}>
          <Line label="DATE" value="07-29-22" />
        </Grid>
        <Grid item xs={6}>
          <Line label="ADDRESS" value="DAMORTIS, SANTO TOMAS, LA UNION" />
        </Grid>
        <Grid item xs={6}>
          <Line label="REQUESTING PHYSICIAN" value="DRA. VERGANIO" />
        </Grid>
      </Grid>

      {/* Title */}
      <Box textAlign="center" mb={1}>
        <Box
          sx={{
            display: "inline-block",
            border: "1px solid",
            px: 3,
            py: 0.5,
            fontWeight: 800,
            letterSpacing: 1,
          }}
        >
          BLOOD CHEMISTRY
        </Box>
      </Box>

      {/* Table */}
      <Table
        size="small"
        sx={{
          border: "1px solid black",
          borderCollapse: "collapse",
          "& th, & td": {
            border: "1px solid black",
            padding: "4px 6px",
            fontSize: 13,
          },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 900, width: "22%" }}>
              EXAMINATION
            </TableCell>

            <TableCell align="center" sx={{ fontWeight: 900 }}>
              RESULT (CONVENTIONAL)
            </TableCell>

            <TableCell align="center" sx={{ fontWeight: 900 }}>
              NORMAL VALUES
            </TableCell>

            <TableCell align="center" sx={{ fontWeight: 900 }}>
              RESULT (S.I)
            </TableCell>

            <TableCell align="center" sx={{ fontWeight: 900 }}>
              NORMAL VALUES
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {ROWS.map((r) => (
            <TableRow key={r.test} sx={{ height: 42 }}>
              <TableCell sx={{ fontWeight: 700 }}>{r.test}</TableCell>

              <TableCell>
                <TextField
                  variant="standard"
                  fullWidth
                  disabled={readOnly}
                  value={data[r.test]?.conventional || ""}
                  onChange={(e) =>
                    setVal(r.test, "conventional", e.target.value)
                  }
                  InputProps={{
                    disableUnderline: true,
                    sx: { fontSize: 13, textAlign: "center" },
                  }}
                />
              </TableCell>

              <TableCell align="center" sx={{ fontSize: 12 }}>
                {r.normalConventional}
              </TableCell>

              <TableCell>
                <TextField
                  variant="standard"
                  fullWidth
                  disabled={readOnly}
                  value={data[r.test]?.si || ""}
                  onChange={(e) => setVal(r.test, "si", e.target.value)}
                  InputProps={{
                    disableUnderline: true,
                    sx: { fontSize: 13, textAlign: "center" },
                  }}
                />
              </TableCell>

              <TableCell align="center" sx={{ fontSize: 12 }}>
                {r.normalSi}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Footer sign lines */}
      <Box
        mt={4}
        display="flex"
        justifyContent="space-between"
        alignItems="flex-end"
      >
        {/* LEFT SIGNATURE */}
        <Box width="45%">
          <Typography
            variant="body2"
            sx={{ borderTop: "1px solid", width: "70%" }}
          >
            &nbsp;
          </Typography>
          <Typography variant="caption">MEDICAL TECHNOLOGIST</Typography>
        </Box>

        {/* RIGHT SIGNATURE */}
        <Box width="45%" textAlign="right">
          <Typography
            variant="body2"
            sx={{ borderTop: "1px solid", width: "70%", ml: "auto" }}
          >
            &nbsp;
          </Typography>
          <Typography variant="caption">PATHOLOGIST</Typography>
        </Box>
      </Box>
    </Box>
  );
}

function Line({ label }) {
  return (
    <Box display="flex" gap={1}>
      <Typography fontWeight={700} variant="body2">
        {label}:
      </Typography>
      <Box flex={1} borderBottom="1px solid" />
    </Box>
  );
}
