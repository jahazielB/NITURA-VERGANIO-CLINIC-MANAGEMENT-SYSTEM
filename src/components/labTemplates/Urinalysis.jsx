import { useMemo } from "react";
import { Box, Typography, Grid, TextField, Divider } from "@mui/material";
import clinicHeaderLogo from "../../assets/HEADER-CLINIC.png";

const DEFAULTS = {
  // URINALYSIS (top)
  color: "",
  protein: "",
  transparency: "",
  sugar: "",
  ph: "",
  bilirubin: "",
  specificGravity: "",
  urobilinogen: "",
  blood: "",
  leucocytes: "",

  // MICROSCOPIC FINDINGS
  pusCells: "",
  epithelialCells: "",
  rbc: "",
  mucusThread: "",
  cast: "",
  aUrates: "",
  crystals: "",
  aPhosphates: "",
  pregnancyTest: "",
  bacteria: "",
  others: "",
};

/**
 * UrinalysisTemplate.jsx
 * Matches the provided URINALYSIS LAB RESULT form layout. :contentReference[oaicite:1]{index=1}
 *
 * Props:
 * - value: resultDetails object
 * - onChange: (next) => void
 * - readOnly: boolean
 * - patient (optional): { name, age, sex, date, address, requestingPhysician }
 */
export default function UrinalysisTemplate({
  value,
  onChange,
  readOnly = false,
  patient,
}) {
  const data = useMemo(() => ({ ...DEFAULTS, ...(value || {}) }), [value]);

  const p = patient || {
    name: "ABON, YLIZAH BETTINA",
    age: "4",
    sex: "F",
    date: "10/28/23",
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

      {/* Patient info lines (as in the ODT) */}
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
        <Box
          sx={{
            display: "inline-block",
            fontWeight: 900,
            letterSpacing: 1,
          }}
        >
          URINALYSIS
        </Box>
      </Box>

      {/* Two-column pairs exactly like the ODT */}
      <Grid container spacing={2}>
        <Pair
          left={{ label: "Color", key: "color" }}
          right={{ label: "Protein", key: "protein" }}
          data={data}
          setField={setField}
          readOnly={readOnly}
        />
        <Pair
          left={{ label: "Transparency", key: "transparency" }}
          right={{ label: "Sugar", key: "sugar" }}
          data={data}
          setField={setField}
          readOnly={readOnly}
        />
        <Pair
          left={{ label: "Ph", key: "ph" }}
          right={{ label: "Bilirubin", key: "bilirubin" }}
          data={data}
          setField={setField}
          readOnly={readOnly}
        />
        <Pair
          left={{ label: "Specific Gravity", key: "specificGravity" }}
          right={{ label: "Urobilinogen", key: "urobilinogen" }}
          data={data}
          setField={setField}
          readOnly={readOnly}
        />
        <Pair
          left={{ label: "Blood", key: "blood" }}
          right={{ label: "Leucocytes", key: "leucocytes" }}
          data={data}
          setField={setField}
          readOnly={readOnly}
        />
      </Grid>

      <Box mt={2} mb={1}>
        <Divider sx={{ borderColor: "black" }} />
      </Box>

      {/* Microscopic findings header */}
      <Box textAlign="center" mb={2}>
        <Typography sx={{ fontWeight: 900, letterSpacing: 0.6 }}>
          MICROSCOPIC FINDINGS
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Pair
          left={{ label: "Pus Cells/ HPF", key: "pusCells" }}
          right={{ label: "Epithelial Cells", key: "epithelialCells" }}
          data={data}
          setField={setField}
          readOnly={readOnly}
        />
        <Pair
          left={{ label: "RBC / HPF", key: "rbc" }}
          right={{ label: "Mucus Thread", key: "mucusThread" }}
          data={data}
          setField={setField}
          readOnly={readOnly}
        />
        <Pair
          left={{ label: "Cast / HPF", key: "cast" }}
          right={{ label: "A. Urates", key: "aUrates" }}
          data={data}
          setField={setField}
          readOnly={readOnly}
        />
        <Pair
          left={{ label: "Crystals", key: "crystals" }}
          right={{ label: "A. Phosphates", key: "aPhosphates" }}
          data={data}
          setField={setField}
          readOnly={readOnly}
        />
        <Pair
          left={{ label: "Pregnancy Test", key: "pregnancyTest" }}
          right={{ label: "Bacteria", key: "bacteria" }}
          data={data}
          setField={setField}
          readOnly={readOnly}
        />

        {/* Others (single wide line like the ODT) */}
        <Grid item xs={12}>
          <WideField
            label="Others"
            value={data.others}
            onChange={(v) => setField("others", v)}
            readOnly={readOnly}
          />
        </Grid>
      </Grid>

      {/* Footer signatures */}
      <Box
        mt={4}
        display="flex"
        justifyContent="space-between"
        alignItems="flex-end"
      >
        <Box width="45%">
          <Typography sx={{ fontWeight: 800, fontSize: 12 }}>
            JENINA A MACADAEG, RMT
          </Typography>
          <Typography
            variant="body2"
            sx={{ borderTop: "1px solid", width: "85%" }}
          >
            &nbsp;
          </Typography>
          <Typography variant="caption">PRC LIC NO. 89605</Typography>
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

/** Pair row: Left label+field and Right label+field (like the ODT) */
function Pair({ left, right, data, setField, readOnly }) {
  return (
    <>
      <Grid item xs={12} sm={6}>
        <InlineField
          label={left.label}
          value={data[left.key]}
          onChange={(v) => setField(left.key, v)}
          readOnly={readOnly}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <InlineField
          label={right.label}
          value={data[right.key]}
          onChange={(v) => setField(right.key, v)}
          readOnly={readOnly}
        />
      </Grid>
    </>
  );
}

/** Inline label ":" field with a line-box look */
function InlineField({ label, value, onChange, readOnly }) {
  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Typography sx={{ fontWeight: 700, minWidth: 140 }}>{label}</Typography>
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

/** Full-width field for "Others" */
function WideField({ label, value, onChange, readOnly }) {
  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Typography sx={{ fontWeight: 700, minWidth: 140 }}>{label}</Typography>
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

/** Patient info line (label + underline box) */
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
