import {
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
  Divider,
  MenuItem,
  TextField,
} from "@mui/material";
import { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";

function fmt(dt) {
  try {
    return new Date(dt).toLocaleString("en-US").slice(0, 16);
  } catch {
    return dt;
  }
}

export default function OverviewVitalsCard({
  vitalsByVisit = [],
  selectedVisitId,
  onSelectVisit,
}) {
  const sorted = useMemo(() => {
    return [...vitalsByVisit].sort(
      (a, b) => new Date(b.visitDate) - new Date(a.visitDate),
    );
  }, [vitalsByVisit]);

  const latest = sorted[0] || null;

  const selected = useMemo(() => {
    if (!selectedVisitId) return latest;
    return sorted.find((v) => v.visitId === selectedVisitId) || latest;
  }, [sorted, selectedVisitId, latest]);
  const { patientInfo } = useSelector((s) => s.patientProfile);
  const visits = patientInfo?.visits;

  useEffect(() => {
    console.log(visits?.map((v) => v));
    console.log();
  }, [patientInfo]);
  return (
    <Card className="rounded-2xl shadow">
      <CardContent>
        <Box className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <Box>
            <Typography className="font-semibold">Vitals</Typography>
            <Typography variant="body2" color="text.secondary">
              {selected
                ? `Recorded: ${fmt(selected.visitDate)}`
                : "No vitals recorded yet"}
            </Typography>
          </Box>

          {/* Optional selector: only show if multiple visits */}
          {visits?.length > 1 && (
            <TextField
              type="datetime-local"
              select
              size="small"
              label="Select Visit Date"
              value={visits?.[0].id}
              onChange={(e) => onSelectVisit?.(e.target.value)}
              sx={{ minWidth: 220 }}
            >
              {visits.map((v) => (
                <MenuItem key={v.id} value={v.id}>
                  {new Date(v.created_at).toLocaleString("en-US")}
                </MenuItem>
              ))}
            </TextField>
          )}
        </Box>

        <Divider className="my-3" />

        {/* Chips */}
        <Box className="flex flex-wrap gap-2 p-2">
          {selected ? (
            <>
              <Chip label={`Temp: ${selected.temp ?? "—"}°C`} />
              <Chip
                label={`BP: ${selected.bpS ?? "—"}/${selected.bpD ?? "—"}`}
              />
              <Chip label={`Pulse: ${selected.pulse ?? "—"} bpm`} />
              <Chip label={`Weight: ${selected.weight ?? "—"} kg`} />
              <Chip label={`SpO₂: ${selected.spo2 ?? "—"}%`} />
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No vitals yet. Add vitals during a visit.
            </Typography>
          )}
        </Box>

        {/* Small history (optional): last 3 dates */}
        {sorted.length > 1 && (
          <Box className="mt-4 p-2">
            <Typography className="font-semibold mb-2">
              Recent Visits
            </Typography>
            <Box className="space-y-2">
              {sorted.slice(0, 3).map((v) => (
                <Box
                  key={v.visitId}
                  className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2"
                >
                  <Typography variant="body2">{fmt(v.visitDate)}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    BP {v.bpS ?? "—"}/{v.bpD ?? "—"} • Temp {v.temp ?? "—"}°C
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
