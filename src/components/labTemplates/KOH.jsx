import { useMemo } from "react";
import { Box, Typography, Grid, TextField, MenuItem } from "@mui/material";
import clinicHeaderLogo from "../../assets/HEADER-CLINIC.png";

/**
 * KOHTemplate.jsx
 * Based on the uploaded KOH LAB RESULT form. :contentReference[oaicite:1]{index=1}
 *
 * Props:
 *  value: resultDetails object
 *  onChange: (next) => void
 *  readOnly: boolean
 *  patient: optional { name, age, sex, date, address, requestingPhysician }
 */

const DEFAULTS = {
  result: "", // e.g. "POSITIVE FOR FUNGAL ELEMENTS"
};

const RESULT_OPTIONS = ["NEGATIVE", "POSITIVE FOR FUNGAL ELEMENTS"];

export default function KOHTemplate({
  value,
  onChange,
  readOnly = false,
  patient,
}) {
  const data = useMemo(() => ({ ...DEFAULTS, ...(value || {}) }), [value]);

  const p = patient || {
    name: "PANELO, MC GILBERT",
    age: "31",
    sex: "M",
    date: "10/17/23",
    address: "NAMONITAN, SANTO TOMAS, LA UNION",
    requestingPhysician: "DRA. VERGANIO",
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
        <Typography sx={{ fontWeight: 900, letterSpacing: 1 }}>KOH</Typography>
      </Box>

      {/* Result block */}
      <Box sx={{ px: 1, mb: 2 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography sx={{ fontWeight: 900, minWidth: 90 }}>RESULT</Typography>
          <Typography sx={{ fontWeight: 900 }}>:</Typography>

          {/* Select (clean + fast for medtech); can change to text input if you want free typing */}
          <TextField
            select
            fullWidth
            size="small"
            disabled={readOnly}
            value={data.result || ""}
            onChange={(e) => setField("result", e.target.value)}
            slotProps={{
              select: {
                displayEmpty: true,
                renderValue: (selected) =>
                  selected ? (
                    selected
                  ) : (
                    <span style={{ color: "#9e9e9e" }}>Select result</span>
                  ),
              },
            }}
            sx={{
              "& .MuiInputBase-root": {
                border: "1px solid black",
                borderRadius: 0,
                px: 1,
              },
            }}
          >
            <MenuItem value="">
              <em>Select result</em>
            </MenuItem>
            {RESULT_OPTIONS.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </TextField>
        </Box>
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
            MICHAEL L. MOSTALES, MD, DPSP
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

/* ---------- helpers ---------- */

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
