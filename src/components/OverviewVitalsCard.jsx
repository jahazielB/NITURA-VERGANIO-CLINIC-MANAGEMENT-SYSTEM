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
import { useMemo } from "react";

function fmt(dt) {
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return dt;
  }
}

/**
 * vitalsByVisit: array of objects like:
 * {
 *   visitId: "V001",
 *   visitDate: "2026-01-22T10:30",
 *   temp: 37.8, bpS: 120, bpD: 80, pulse: 86, weight: 72, spo2: 97
 * }
 */
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
          {sorted.length > 1 && (
            <TextField
              select
              size="small"
              label="Select Visit Date"
              value={selected?.visitId || ""}
              onChange={(e) => onSelectVisit?.(e.target.value)}
              sx={{ minWidth: 220 }}
            >
              {sorted.map((v) => (
                <MenuItem key={v.visitId} value={v.visitId}>
                  {fmt(v.visitDate)}
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
