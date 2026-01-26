import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  TextField,
  Typography,
  Chip,
} from "@mui/material";

function fmtVitals(v) {
  if (!v) return [];
  return [
    v.tempC != null ? `Temp: ${v.tempC}°C` : null,
    v.bpS != null || v.bpD != null
      ? `BP: ${v.bpS ?? "—"}/${v.bpD ?? "—"}`
      : null,
    v.pulse != null ? `Pulse: ${v.pulse} bpm` : null,
    v.weightKg != null ? `Weight: ${v.weightKg} kg` : null,
    v.heightCm != null ? `Height: ${v.heightCm} cm` : null,
    v.bmi != null ? `BMI: ${Number(v.bmi).toFixed(1)}` : null,
    v.spo2 != null ? `SpO₂: ${v.spo2}%` : null,
  ].filter(Boolean);
}

export default function SoapForm({ soap, onChange, vitals }) {
  const chips = fmtVitals(vitals);

  return (
    <Box className="space-y-4">
      {/* Vitals summary (read-only) */}
      <Card className="rounded-2xl shadow">
        <CardContent>
          <Typography className="font-semibold mb-2">
            Vitals (from this visit)
          </Typography>

          {chips.length ? (
            <Box className="flex flex-wrap gap-2">
              {chips.map((c) => (
                <Chip key={c} label={c} />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No vitals recorded for this visit yet.
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* SOAP editor */}
      <Card className="rounded-2xl shadow">
        <CardContent>
          <Typography className="font-semibold">SOAP Notes</Typography>
          <Typography variant="body2" color="text.secondary">
            Saved per visit. Keep it concise but complete.
          </Typography>

          <Divider className="my-3" />

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="S — Subjective"
                name="subjective"
                value={soap.subjective}
                onChange={onChange}
                fullWidth
                multiline
                minRows={3}
                placeholder="Chief complaint, symptoms, history..."
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="O — Objective"
                name="objective"
                value={soap.objective}
                onChange={onChange}
                fullWidth
                multiline
                minRows={3}
                placeholder="Physical exam findings, relevant observations..."
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="A — Assessment"
                name="assessment"
                value={soap.assessment}
                onChange={onChange}
                fullWidth
                multiline
                minRows={3}
                placeholder="Diagnosis / impression..."
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="P — Plan"
                name="plan"
                value={soap.plan}
                onChange={onChange}
                fullWidth
                multiline
                minRows={3}
                placeholder="Treatment, meds, labs, follow-up..."
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
