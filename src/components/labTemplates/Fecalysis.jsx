import { useMemo } from "react";
import { Box, Typography, Grid, TextField } from "@mui/material";
import clinicHeaderLogo from "../../assets/HEADER-CLINIC.png";

/**
 * FecalysisTemplate.jsx
 * Layout based on the uploaded FECALYSIS form. :contentReference[oaicite:1]{index=1}
 *
 * Props:
 *  value: resultDetails object
 *  onChange: (next) => void
 *  readOnly: boolean
 *  patient: optional { name, age, sex, date, address, requestingPhysician }
 */

const DEFAULTS = {
  // Macroscopic
  color: "",
  consistency: "",

  // Microscopic
  wbc: "",
  rbc: "",
  fatGlobules: "",
  remarks: "",

  // Parasites
  ascaris: "",
  trichuris: "",
  entamoebaColi: "",
  entamoebaHistolytica: "",
  others: "",
};

export default function Fecalysis({
  value,
  onChange,
  readOnly = false,
  patient,
}) {
  const data = useMemo(() => ({ ...DEFAULTS, ...(value || {}) }), [value]);

  const p = patient || {
    name: "ARICHETA, NAZARENO",
    age: "39",
    sex: "M",
    date: "10/24/23",
    address: "DAMORTIS, ROSARIO, LA UNION",
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

      {/* Patient info (same pattern) */}
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
          FECALYSIS
        </Typography>
      </Box>

      {/* Two-column layout: Left = Macro/Micro, Right = Parasites */}
      <Grid container spacing={2}>
        {/* LEFT COLUMN */}
        <Grid item xs={12} md={7}>
          <SectionTitle text="MACROSCOPIC EXAMINATION" />
          <Grid container spacing={1.5} mb={2}>
            <Grid item xs={12}>
              <InlineField
                label="COLOR"
                value={data.color}
                onChange={(v) => setField("color", v)}
                readOnly={readOnly}
                placeholder="e.g., Brown"
              />
            </Grid>
            <Grid item xs={12}>
              <InlineField
                label="CONSISTENCY"
                value={data.consistency}
                onChange={(v) => setField("consistency", v)}
                readOnly={readOnly}
                placeholder="e.g., Formed"
              />
            </Grid>
          </Grid>

          <SectionTitle text="MICROSCOPIC EXAMINATION" />
          <Grid container spacing={1.5}>
            <Grid item xs={12}>
              <InlineField
                label="WBC"
                value={data.wbc}
                onChange={(v) => setField("wbc", v)}
                readOnly={readOnly}
                placeholder="e.g., 4-6/HPF"
              />
            </Grid>
            <Grid item xs={12}>
              <InlineField
                label="RBC"
                value={data.rbc}
                onChange={(v) => setField("rbc", v)}
                readOnly={readOnly}
                placeholder="e.g., 0-2/HPF"
              />
            </Grid>
            <Grid item xs={12}>
              <InlineField
                label="FAT GLOBULES"
                value={data.fatGlobules}
                onChange={(v) => setField("fatGlobules", v)}
                readOnly={readOnly}
                placeholder="e.g., Few / None"
              />
            </Grid>
            <Grid item xs={12}>
              <InlineField
                label="REMARKS"
                value={data.remarks}
                onChange={(v) => setField("remarks", v)}
                readOnly={readOnly}
                placeholder="e.g., NO OVA/PARASITE SEEN"
              />
            </Grid>
          </Grid>
        </Grid>

        {/* RIGHT COLUMN */}
        <Grid item xs={12} md={5}>
          <SectionTitle text="PARASITES" />
          <Grid container spacing={1.5}>
            <Grid item xs={12}>
              <InlineField
                label="Ascaris lumbricoides"
                value={data.ascaris}
                onChange={(v) => setField("ascaris", v)}
                readOnly={readOnly}
              />
            </Grid>
            <Grid item xs={12}>
              <InlineField
                label="Trichuris trichuria"
                value={data.trichuris}
                onChange={(v) => setField("trichuris", v)}
                readOnly={readOnly}
              />
            </Grid>
            <Grid item xs={12}>
              <InlineField
                label="Entamoeba coli"
                value={data.entamoebaColi}
                onChange={(v) => setField("entamoebaColi", v)}
                readOnly={readOnly}
              />
            </Grid>
            <Grid item xs={12}>
              <InlineField
                label="Entamoeba histolytica"
                value={data.entamoebaHistolytica}
                onChange={(v) => setField("entamoebaHistolytica", v)}
                readOnly={readOnly}
              />
            </Grid>
            <Grid item xs={12}>
              <InlineField
                label="Others"
                value={data.others}
                onChange={(v) => setField("others", v)}
                readOnly={readOnly}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Signatures (as in form) */}
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

/* ---------- small helpers ---------- */

function SectionTitle({ text }) {
  return (
    <Typography sx={{ fontWeight: 900, mb: 1, letterSpacing: 0.6 }}>
      {text}
    </Typography>
  );
}

function InlineField({ label, value, onChange, readOnly, placeholder }) {
  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Typography sx={{ fontWeight: 700, minWidth: 160 }}>{label}</Typography>
      <Typography sx={{ fontWeight: 700 }}>:</Typography>
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
