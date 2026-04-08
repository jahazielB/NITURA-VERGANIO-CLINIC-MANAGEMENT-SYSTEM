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

export default function SoapForm({ soap, onChange, vitals, readOnly = false }) {
  const chips = fmtVitals(vitals);

  const sectionStyle = "rounded-xl border border-slate-100";

  return (
    <Box className="space-y-4">
      {/* VITALS */}
      <Card className="rounded-2xl shadow">
        <CardContent>
          <Typography className="font-semibold mb-2">
            Vitals (this visit)
          </Typography>

          {chips.length ? (
            <Box className="flex flex-wrap gap-2">
              {chips.map((c) => (
                <Chip key={c} label={c} size="small" />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No vitals recorded.
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* SOAP */}
      <Card className="rounded-2xl shadow">
        <CardContent>
          <Box className="mb-3">
            <Typography className="font-semibold text-lg">
              SOAP Notes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Structured clinical documentation per visit.
            </Typography>
          </Box>

          <Divider className="mb-4" />

          <Grid container spacing={2}>
            {/* SUBJECTIVE */}
            <Grid item xs={12}>
              <Box className={sectionStyle + " p-3"}>
                <Typography className="font-semibold text-sm mb-1 text-blue-600">
                  S — Subjective
                </Typography>

                <TextField
                  name="subjective"
                  value={soap.subjective}
                  onChange={onChange}
                  fullWidth
                  multiline
                  minRows={3}
                  placeholder="Patient complaints, symptoms, history..."
                  InputProps={{ readOnly }}
                  helperText="What the patient reports"
                />
              </Box>
            </Grid>

            {/* OBJECTIVE */}
            <Grid item xs={12}>
              <Box className={sectionStyle + " p-3"}>
                <Typography className="font-semibold text-sm mb-1 text-green-600">
                  O — Objective
                </Typography>

                <TextField
                  name="objective"
                  value={soap.objective}
                  onChange={onChange}
                  fullWidth
                  multiline
                  minRows={3}
                  placeholder="Exam findings, vitals, observations..."
                  InputProps={{ readOnly }}
                  helperText="What you observe/measured"
                />
              </Box>
            </Grid>

            {/* ASSESSMENT */}
            <Grid item xs={12}>
              <Box className={sectionStyle + " p-3"}>
                <Typography className="font-semibold text-sm mb-1 text-purple-600">
                  A — Assessment
                </Typography>

                <TextField
                  name="assessment"
                  value={soap.assessment}
                  onChange={onChange}
                  fullWidth
                  multiline
                  minRows={3}
                  placeholder="Diagnosis or clinical impression..."
                  InputProps={{ readOnly }}
                  helperText="Your clinical judgment"
                />
              </Box>
            </Grid>

            {/* PLAN */}
            <Grid item xs={12}>
              <Box className={sectionStyle + " p-3"}>
                <Typography className="font-semibold text-sm mb-1 text-orange-600">
                  P — Plan
                </Typography>

                <TextField
                  name="plan"
                  value={soap.plan}
                  onChange={onChange}
                  fullWidth
                  multiline
                  minRows={3}
                  placeholder="Medications, labs, follow-up..."
                  InputProps={{ readOnly }}
                  helperText="Next steps for patient care"
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
