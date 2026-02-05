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
  Button,
} from "@mui/material";

const statusColor = (s) => {
  if (s === "Waiting") return "warning";
  if (s === "In Triage") return "info";
  if (s === "Ready for Doctor") return "success";
  return "default";
};

export default function QueuePreviewTable({ rows, onSeeAll }) {
  return (
    <Card className="rounded-2xl shadow-2xl">
      <CardContent>
        <Box className="flex justify-between mb-2">
          <Typography className="font-extrabold">Today’s Queue</Typography>
          <Typography className="underline cursor-pointer" onClick={onSeeAll}>
            See all
          </Typography>
        </Box>

        <Table size="small">
          <TableHead>
            <TableRow className="bg-slate-100">
              <TableCell>Patient</TableCell>
              <TableCell>Arrival Time</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.patient}</TableCell>
                <TableCell>{r.time}</TableCell>
                <TableCell>
                  <Chip
                    label={r.status}
                    size="small"
                    color={statusColor(r.status)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
