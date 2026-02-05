import {
  Card,
  CardContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Box,
  Button,
  Chip,
  Typography,
} from "@mui/material";

const statusColor = (s) => {
  if (s === "Waiting") return "warning";
  if (s === "In Triage") return "info";
  if (s === "Ready for Doctor") return "success";
  return "default";
};

export default function NurseQueueTable({
  rows,
  onStartTriage,
  onOpenTriage,
  onMarkReady,
  onOpenChart,
}) {
  return (
    <Card className="rounded-2xl shadow">
      <CardContent>
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table size="small" sx={{ minWidth: 1050 }}>
            <TableHead>
              <TableRow className="bg-slate-100">
                <TableCell>Patient</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Vitals</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell className="font-semibold">
                    {r.patientName}
                  </TableCell>
                  <TableCell>{r.time}</TableCell>
                  <TableCell>{r.reason}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={r.status}
                      color={statusColor(r.status)}
                    />
                  </TableCell>
                  <TableCell>
                    {r.vitals ? (
                      <Typography variant="caption" color="text.secondary">
                        T:{r.vitals.temp} • BP:{r.vitals.bpS}/{r.vitals.bpD} •
                        P:{r.vitals.pulse}
                      </Typography>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        —
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell align="right">
                    <Box className="flex justify-end gap-1 flex-wrap">
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={r.status !== "Waiting"}
                        onClick={() => onStartTriage(r)}
                      >
                        Start Triage
                      </Button>

                      <Button
                        size="small"
                        variant="contained"
                        disabled={r.status === "Waiting"}
                        onClick={() => onOpenTriage(r)}
                      >
                        Record Vitals
                      </Button>

                      <Button
                        size="small"
                        variant="outlined"
                        disabled={r.status === "Waiting"}
                        onClick={() => onMarkReady(r)}
                      >
                        Mark Ready
                      </Button>

                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => onOpenChart(r)}
                      >
                        Open Chart
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}

              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No patients found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
