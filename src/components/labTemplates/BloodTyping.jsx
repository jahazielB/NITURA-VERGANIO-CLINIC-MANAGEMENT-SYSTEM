import { useMemo } from "react";
import { Box, Typography, Grid, TextField, MenuItem } from "@mui/material";
import clinicHeaderLogo from "../../assets/HEADER-CLINIC.png";

/**
 * Matches BLOOD TYPING RESULT form. :contentReference[oaicite:1]{index=1}
 *
 * Props:
 *  value: resultDetails object
 *  onChange: (next) => void
 *  readOnly: boolean
 *  patient: optional { name, age, sex, date, address, requestingPhysician }
 */

const DEFAULTS = {
  bloodType: "", // "A" | "B" | "AB" | "O"
  rhType: "", // "POSITIVE" | "NEGATIVE"
};

const BLOOD_TYPES = ["A", "B", "AB", "O"];
const RH_TYPES = ["POSITIVE", "NEGATIVE"];

export default function BloodTyping({
  value,
  onChange,
  readOnly = false,
  patient,
}) {
  const data = useMemo(() => ({ ...DEFAULTS, ...(value || {}) }), [value]);

  const p = patient || {
    name: "MARZO, JENELYN",
    age: "15",
    sex: "F",
    date: "06/29/23",
    address: "TUBOD, SANTO TOMAS, LA UNION",
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
        <Typography sx={{ fontWeight: 900, letterSpacing: 1 }}>
          BLOOD TYPING
        </Typography>
      </Box>

      {/* Result line (like the form) */}
      <Box
        sx={{
          border: "1px solid black",
          p: 2,
          borderRadius: 0,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <InlineSelect
              label="BLOOD TYPE"
              value={data.bloodType}
              options={BLOOD_TYPES}
              readOnly={readOnly}
              onChange={(v) => setField("bloodType", v)}
              placeholder="Select type"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <InlineSelect
              label="RH TYPE"
              value={data.rhType}
              options={RH_TYPES}
              readOnly={readOnly}
              onChange={(v) => setField("rhType", v)}
              placeholder="Select RH"
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

/* ---------- helpers ---------- */

function InlineSelect({
  label,
  value,
  options,
  onChange,
  readOnly,
  placeholder,
}) {
  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Typography sx={{ fontWeight: 900, minWidth: 120 }}>{label}</Typography>
      <Typography sx={{ fontWeight: 900 }}>:</Typography>

      <TextField
        select
        fullWidth
        size="small"
        disabled={readOnly}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        slotProps={{
          inputLabel: { shrink: true },
          select: {
            displayEmpty: true,
            renderValue: (selected) =>
              selected ? (
                selected
              ) : (
                <span style={{ color: "#9e9e9e" }}>{placeholder}</span>
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
          <em>{placeholder}</em>
        </MenuItem>
        {options.map((opt) => (
          <MenuItem key={opt} value={opt}>
            {opt}
          </MenuItem>
        ))}
      </TextField>
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
