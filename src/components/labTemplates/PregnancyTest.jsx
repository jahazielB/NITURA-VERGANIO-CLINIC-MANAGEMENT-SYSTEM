import { useMemo } from "react";
import { Box, Typography, Grid, TextField, MenuItem } from "@mui/material";
import clinicHeaderLogo from "../../assets/HEADER-CLINIC.png";

/**
 * PregnancyTestTemplate.jsx
 *
 * Props:
 *  value: object (resultDetails)
 *  onChange: (next) => void
 *  readOnly: boolean
 *  patient: optional { name, age, sex, date, address, requestingPhysician }
 */

const DEFAULTS = {
  result: "", // "POSITIVE" | "NEGATIVE"
  method: "", // optional e.g. "Urine HCG"
  remarks: "",
};

const RESULT_OPTIONS = ["NEGATIVE", "POSITIVE"];

export default function PregnancyTestTemplate({
  value,
  onChange,
  readOnly = false,
  patient,
}) {
  const data = useMemo(() => ({ ...DEFAULTS, ...(value || {}) }), [value]);

  const p = patient || {
    name: "DOE, JANE",
    age: "24",
    sex: "F",
    date: "01/29/26",
    address: "SANTO TOMAS, LA UNION",
    requestingPhysician: "DR. SAMPLE",
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
        <Typography sx={{ fontWeight: 900, letterSpacing: 1 }}>
          PREGNANCY TEST
        </Typography>
      </Box>

      {/* Main result area */}
      <Box
        sx={{
          border: "1px solid black",
          p: 2,
          borderRadius: 0,
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography sx={{ fontWeight: 800, minWidth: 120 }}>
                RESULT
              </Typography>
              <Typography sx={{ fontWeight: 800 }}>:</Typography>

              <TextField
                select
                fullWidth
                value={data.result}
                disabled={readOnly}
                onChange={(e) => setField("result", e.target.value)}
                size="small"
                slotProps={{
                  inputLabel: { shrink: true },
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
          </Grid>

          <Grid item xs={12} sm={6}>
            <InlineText
              label="METHOD"
              value={data.method}
              onChange={(v) => setField("method", v)}
              readOnly={readOnly}
              placeholder="e.g., Urine hCG"
            />
          </Grid>

          <Grid item xs={12}>
            <InlineText
              label="REMARKS"
              value={data.remarks}
              onChange={(v) => setField("remarks", v)}
              readOnly={readOnly}
              placeholder="Optional notes..."
              fullWidth
            />
          </Grid>
        </Grid>
      </Box>

      {/* Signatures */}
      <Box
        mt={4}
        display="flex"
        justifyContent="space-between"
        alignItems="flex-end"
      >
        <Box width="45%">
          <Typography
            variant="body2"
            sx={{ borderTop: "1px solid", width: "85%" }}
          >
            &nbsp;
          </Typography>
          <Typography variant="caption">MEDICAL TECHNOLOGIST</Typography>
        </Box>

        <Box width="45%" textAlign="right">
          <Typography
            variant="body2"
            sx={{ borderTop: "1px solid", width: "85%", ml: "auto" }}
          >
            &nbsp;
          </Typography>
          <Typography variant="caption">PATHOLOGIST</Typography>
        </Box>
      </Box>
    </Box>
  );
}

/* ---------- small reusable pieces ---------- */

function InlineText({ label, value, onChange, readOnly, placeholder }) {
  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Typography sx={{ fontWeight: 800, minWidth: 120 }}>{label}</Typography>
      <Typography sx={{ fontWeight: 800 }}>:</Typography>
      <TextField
        variant="standard"
        fullWidth
        disabled={readOnly}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        InputProps={{
          disableUnderline: true,
          sx: {
            fontSize: 13,
            px: 1,
            py: 0.5,
            border: "1px solid black",
            borderRadius: 0,
          },
        }}
      />
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
