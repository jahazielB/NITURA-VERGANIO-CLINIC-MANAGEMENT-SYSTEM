import {
  Button,
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Box,
} from "@mui/material";

const statusColor = (s) => {
  if (s === "Waiting") return "warning";
  if (s === "In Consult") return "info";
  if (s === "Done") return "success";
  return "default";
};

export default function DoctorQueueTable({ rows, onStart, onDone, onOpenChart }) {
  return (
    <Card className="p-2 h-full rounded-2xl shadow-2xl">
      <CardContent>
        <Box className="flex justify-between items-center mb-2">
          <Typography className="font-extrabold">My Queue Today</Typography>
        </Box>

        <Table size="small">
          <TableHead>
            <TableRow className="bg-slate-100">
              <TableCell>Patient</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell className="font-semibold">{row.patient}</TableCell>
                <TableCell>{row.time}</TableCell>
                <TableCell>{row.reason}</TableCell>
                <TableCell>
                  <Chip
                    label={row.status}
                    size="small"
                    color={statusColor(row.status)}
                  />
                </TableCell>
                <TableCell>
                  {row.status === "Waiting" && onStart && (
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      onClick={() => onStart(row)}
                    >
                      Start Consult
                    </Button>
                  )}
                  {row.status === "In Consult" && onDone && (
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={() => onDone(row)}
                    >
                      Mark Done
                    </Button>
                  )}
                  {onOpenChart && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => onOpenChart(row)}
                      sx={{ ml: row.status !== "Done" ? 1 : 0 }}
                    >
                      Chart
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}

            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No patients in queue
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
