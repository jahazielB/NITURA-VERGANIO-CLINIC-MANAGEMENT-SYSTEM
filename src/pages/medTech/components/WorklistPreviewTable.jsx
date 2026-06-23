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
  CircularProgress,
} from "@mui/material";

const statusColor = (s) => {
  if (s === "Pending") return "warning";
  if (s === "Processing") return "info";
  if (s === "Ready") return "success";
  if (s === "Released") return "default";
  return "default";
};

const priorityColor = (p) => (p === "STAT" ? "error" : "default");

const formatRequestDate = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export default function WorklistPreviewTable({ rows, onSeeAll, loading = false }) {
  const pendingRows = rows.filter((r) => r.status === "Pending");

  return (
    <Card className="rounded-2xl shadow-2xl">
      <CardContent>
        <Box className="flex justify-between items-center mb-2">
          <Typography className="font-extrabold">Today’s Worklist</Typography>
          <Typography className="cursor-pointer underline" onClick={onSeeAll}>
            See all
          </Typography>
        </Box>

        {loading ? (
          <Box className="flex justify-center py-10">
            <CircularProgress size={28} />
          </Box>
        ) : (
          <Table size="small">
          <TableHead>
            <TableRow className="bg-slate-100">
              <TableCell>Date Requested</TableCell>
              <TableCell>Patient</TableCell>
              <TableCell>Test</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {pendingRows.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell className="font-semibold">
                  {formatRequestDate(r.requestedDate || r.dateRequested)}
                </TableCell>
                <TableCell>{r.patientName}</TableCell>
                <TableCell>{r.testType}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={r.priority}
                    color={priorityColor(r.priority)}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={r.status}
                    color={statusColor(r.status)}
                  />
                </TableCell>
              </TableRow>
            ))}

            {pendingRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No lab requests
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
