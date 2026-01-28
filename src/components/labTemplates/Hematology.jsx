import { useMemo } from "react";
import { Box, Typography, Grid, TextField } from "@mui/material";
import clinicHeaderLogo from "../../assets/HEADER-CLINIC.png";

/**
 * HematologyTemplate.jsx
 * Updated:
 * - Labels are beside input boxes (inline)
 * - TOTAL is a line (not an input box)
 * - Clotting Time + Bleeding Time moved just below Platelet Count
 *
 * Props:
 *  value: resultDetails object
 *  onChange: (next) => void
 *  readOnly: boolean
 *  patient: optional { name, age, sex, date, address, requestingPhysician }
 */

const DEFAULTS = {
  // main counts
  rbcCount: "",
  hemoglobin: "",
  hematocrit: "",
  wbcCount: "",
  plateletCount: "",

  // differential
  segmenters: "",
  lymphocytes: "",
  eosinophils: "",
  monocytes: "",
  basophils: "",
  total: "",

  // times + blood type
  clottingTime: "",
  bleedingTime: "",
  bloodType: "",
};

export default function HematologyTemplate({
  value,
  onChange,
  readOnly = false,
  patient,
}) {
  const data = useMemo(() => ({ ...DEFAULTS, ...(value || {}) }), [value]);

  const p = patient || {
    name: "DOE, JUAN",
    age: "25",
    sex: "M",
    date: "01/29/26",
    address: "SANTO TOMAS, LA UNION",
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
          HEMATOLOGY RESULT FORM
        </Typography>
      </Box>

      {/* Body: Left panel + Right panel */}
      <Grid container spacing={2}>
        {/* LEFT PANEL */}
        <Grid item xs={12} md={6}>
          <InlineField
            label="RBC Count"
            subLabel="(N.V. 4.5-5.5 x10¹²/L)"
            value={data.rbcCount}
            onChange={(v) => setField("rbcCount", v)}
            readOnly={readOnly}
          />

          <InlineField
            label="Hemoglobin"
            subLabel="M (140-180 g/L) • F (120-160 g/L)"
            value={data.hemoglobin}
            onChange={(v) => setField("hemoglobin", v)}
            readOnly={readOnly}
          />

          <InlineField
            label="Hematocrit"
            subLabel="M (0.40-0.54) • F (0.31-0.47)"
            value={data.hematocrit}
            onChange={(v) => setField("hematocrit", v)}
            readOnly={readOnly}
          />

          <InlineField
            label="WBC Count"
            subLabel="(N.V. 5-11 x10⁹/L)"
            value={data.wbcCount}
            onChange={(v) => setField("wbcCount", v)}
            readOnly={readOnly}
          />

          <InlineField
            label="Platelet Count"
            subLabel="(N.V. 150-450 x10⁹/L)"
            value={data.plateletCount}
            onChange={(v) => setField("plateletCount", v)}
            readOnly={readOnly}
          />

          {/* moved here (below platelet count) */}
          <InlineField
            label="Clotting Time"
            subLabel="(2-6 min)"
            value={data.clottingTime}
            onChange={(v) => setField("clottingTime", v)}
            readOnly={readOnly}
          />

          <InlineField
            label="Bleeding Time"
            subLabel="(1-7 min)"
            value={data.bleedingTime}
            onChange={(v) => setField("bleedingTime", v)}
            readOnly={readOnly}
          />
        </Grid>

        {/* RIGHT PANEL: Differential Count */}
        <Grid item xs={12} md={6}>
          <Typography sx={{ fontWeight: 900, mb: 1 }}>
            DIFFERENTIAL COUNT
          </Typography>

          <InlineField
            label="Segmenters"
            subLabel="(0.60-0.70)"
            value={data.segmenters}
            onChange={(v) => setField("segmenters", v)}
            readOnly={readOnly}
          />

          <InlineField
            label="Lymphocytes"
            subLabel="(0.20-0.30)"
            value={data.lymphocytes}
            onChange={(v) => setField("lymphocytes", v)}
            readOnly={readOnly}
          />

          <InlineField
            label="Eosinophils"
            subLabel="(0-0.05)"
            value={data.eosinophils}
            onChange={(v) => setField("eosinophils", v)}
            readOnly={readOnly}
          />

          <InlineField
            label="Monocytes"
            subLabel="(0.03-0.08)"
            value={data.monocytes}
            onChange={(v) => setField("monocytes", v)}
            readOnly={readOnly}
          />

          <InlineField
            label="Basophils"
            subLabel=""
            value={data.basophils}
            onChange={(v) => setField("basophils", v)}
            readOnly={readOnly}
          />

          {/* TOTAL as line (not a box) */}
          <Box display="flex" alignItems="flex-end" gap={1} sx={{ mt: 1 }}>
            <Typography sx={{ fontWeight: 900, minWidth: 180 }}>
              TOTAL
            </Typography>
            <Typography sx={{ fontWeight: 900 }}>:</Typography>
            <Box
              flex={1}
              borderBottom="1px solid black"
              sx={{ minHeight: 20, fontSize: 13, px: 1 }}
            >
              {data.total || ""}
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Bottom: Blood Type only */}
      <Grid container spacing={2} mt={2}>
        <Grid item xs={12} md={4}>
          <InlineField
            label="BLOOD TYPE"
            subLabel=""
            value={data.bloodType}
            onChange={(v) => setField("bloodType", v)}
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
          <Typography variant="caption">PRC LIC NO. 0089605</Typography>
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

function InlineField({ label, subLabel, value, onChange, readOnly }) {
  return (
    <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1.2 }}>
      <Box sx={{ minWidth: 180 }}>
        <Typography sx={{ fontWeight: 800, fontSize: 13, lineHeight: 1.1 }}>
          {label}
        </Typography>
        {subLabel ? (
          <Typography sx={{ fontSize: 11, lineHeight: 1.1 }}>
            {subLabel}
          </Typography>
        ) : null}
      </Box>

      <Typography sx={{ fontWeight: 800 }}>:</Typography>

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
            py: 0.4,
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
