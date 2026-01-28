import { useMemo } from "react";
import { Box, Typography, Grid, TextField } from "@mui/material";
import clinicHeaderLogo from "../../assets/HEADER-CLINIC.png";

/**
 * Matches layout of the clinic's SEROLOGY RESULT FORM. :contentReference[oaicite:1]{index=1}
 *
 * Props:
 *  value: resultDetails object
 *  onChange: function(next)
 *  readOnly: boolean
 *  patient: optional patient info
 */

const DEFAULTS = {
  typhidotIgG: "",
  typhidotIgM: "",
  dengueIgG: "",
  dengueIgM: "",
  dengueNS1: "",
  hbsag: "",
  vdrl: "",
  troponinI: "",
};

export default function Serology({
  value,
  onChange,
  readOnly = false,
  patient,
}) {
  const data = useMemo(() => ({ ...DEFAULTS, ...(value || {}) }), [value]);

  const p = patient || {
    name: "BING-IL, CHANDLER",
    age: "2",
    sex: "M",
    date: "10/26/23",
    address: "NAMBOONGAN, SANTO TOMAS, LA UNION",
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
        <Typography sx={{ fontWeight: 900, letterSpacing: 1 }}>
          SEROLOGY RESULT FORM
        </Typography>
      </Box>

      {/* TYPHIDOT */}
      <SectionTitle text="TYPHIDOT" />
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} sm={6}>
          <InlineField
            label="IgG"
            value={data.typhidotIgG}
            onChange={(v) => setField("typhidotIgG", v)}
            readOnly={readOnly}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InlineField
            label="IgM"
            value={data.typhidotIgM}
            onChange={(v) => setField("typhidotIgM", v)}
            readOnly={readOnly}
          />
        </Grid>
      </Grid>

      {/* DENGUE TEST */}
      <SectionTitle text="DENGUE TEST" />
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} sm={4}>
          <InlineField
            label="IgG"
            value={data.dengueIgG}
            onChange={(v) => setField("dengueIgG", v)}
            readOnly={readOnly}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <InlineField
            label="IgM"
            value={data.dengueIgM}
            onChange={(v) => setField("dengueIgM", v)}
            readOnly={readOnly}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <InlineField
            label="Dengue NS1 Ag"
            value={data.dengueNS1}
            onChange={(v) => setField("dengueNS1", v)}
            readOnly={readOnly}
          />
        </Grid>
      </Grid>

      {/* Other serology tests */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} sm={6}>
          <InlineField
            label="HBsAg"
            value={data.hbsag}
            onChange={(v) => setField("hbsag", v)}
            readOnly={readOnly}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InlineField
            label="VDRL Test (Syphilis)"
            value={data.vdrl}
            onChange={(v) => setField("vdrl", v)}
            readOnly={readOnly}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InlineField
            label="Troponin I"
            value={data.troponinI}
            onChange={(v) => setField("troponinI", v)}
            readOnly={readOnly}
          />
        </Grid>
      </Grid>

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

/* ---------- small reusable pieces ---------- */

function SectionTitle({ text }) {
  return (
    <Typography sx={{ fontWeight: 900, mb: 1, letterSpacing: 0.6 }}>
      {text}
    </Typography>
  );
}

function InlineField({ label, value, onChange, readOnly }) {
  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Typography sx={{ fontWeight: 700, minWidth: 150 }}>{label}</Typography>
      <Typography sx={{ fontWeight: 700 }}>:</Typography>
      <TextField
        variant="standard"
        fullWidth
        disabled={readOnly}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
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
