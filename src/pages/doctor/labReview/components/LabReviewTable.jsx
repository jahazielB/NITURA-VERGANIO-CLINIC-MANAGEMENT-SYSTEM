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
  if (s === "Ready") return "info";
  if (s === "Reviewed") return "success";
  return "default";
};

export default function LabReviewTable({
  rows,
  onOpenChart,
  onView,
  onMarkReviewed,
}) {
  return (
    <Card className="rounded-2xl shadow">
      <CardContent>
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table size="small" sx={{ minWidth: 1100 }}>
            <TableHead>
              <TableRow className="bg-slate-100">
                <TableCell>Lab ID</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Visit ID</TableCell>
                <TableCell>Test Type</TableCell>
                <TableCell>Released</TableCell>
                <TableCell>Released By</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell className="font-semibold">{r.id}</TableCell>
                  <TableCell>{r.patientName}</TableCell>
                  <TableCell>{r.visitId}</TableCell>
                  <TableCell>{r.testType}</TableCell>
                  <TableCell>{r.dateReleased}</TableCell>
                  <TableCell>{r.releasedBy}</TableCell>
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
                        variant="contained"
                        onClick={() => onView(r)}
                      >
                        View
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => onOpenChart(r)}
                      >
                        Open Chart
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={r.status === "Reviewed"}
                        onClick={() => onMarkReviewed(r)}
                      >
                        Mark Reviewed
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}

              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No lab results found
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
