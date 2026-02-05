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
  if (s === "Pending") return "warning";
  if (s === "Processing") return "info";
  if (s === "Ready") return "success";
  if (s === "Released") return "default";
  return "default";
};

const priorityColor = (p) => (p === "STAT" ? "error" : "default");

export default function WorklistPreviewTable({
  rows,
  onStart,
  onEnter,
  onRelease,
  onSeeAll,
}) {
  return (
    <Card className="rounded-2xl shadow-2xl">
      <CardContent>
        <Box className="flex justify-between items-center mb-2">
          <Typography className="font-extrabold">Today’s Worklist</Typography>
          <Typography className="cursor-pointer underline" onClick={onSeeAll}>
            See all
          </Typography>
        </Box>

        <Table size="small">
          <TableHead>
            <TableRow className="bg-slate-100">
              <TableCell>Lab ID</TableCell>
              <TableCell>Patient</TableCell>
              <TableCell>Test</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell className="font-semibold">{r.id}</TableCell>
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
                <TableCell align="right">
                  <Box className="flex justify-end gap-1 flex-wrap">
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={r.status !== "Pending"}
                      onClick={() => onStart(r)}
                    >
                      Start
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      disabled={r.status !== "Processing"}
                      onClick={() => onEnter(r)}
                    >
                      Enter Results
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={r.status !== "Ready"}
                      onClick={() => onRelease(r)}
                    >
                      Release
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}

            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No lab requests today
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
