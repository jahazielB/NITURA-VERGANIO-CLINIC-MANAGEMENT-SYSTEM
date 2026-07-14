import {
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
  return "default";
};

export default function QueuePreviewTable({ rows, onSeeAll }) {
  return (
    <Card className="rounded-2xl shadow-2xl">
      <CardContent>
        <Box className="flex justify-between mb-2">
          <Typography className="font-extrabold">Today's Queue</Typography>
          <Typography
            className="underline cursor-pointer text-blue-600"
            onClick={onSeeAll}
          >
            See all
          </Typography>
        </Box>

        <Table size="small">
          <TableHead>
            <TableRow className="bg-slate-100">
              <TableCell sx={{ width: 80 }}>Queue No.</TableCell>
              <TableCell>Patient</TableCell>
              <TableCell>Arrival Time</TableCell>
              <TableCell>Waiting Time</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.queueNo}</TableCell>
                <TableCell className="font-semibold">{r.patient}</TableCell>
                <TableCell>{r.arrivalTime}</TableCell>
                <TableCell>{r.waitingTime}</TableCell>
                <TableCell>
                  <Chip
                    label={r.status}
                    size="small"
                    color={statusColor(r.status)}
                  />
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No patients in queue
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
