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
import { statusColor, priorityColor } from "./LabWorklistHelpers";

export default function LabWorklistTable({
  rows,
  onStart,
  onEnterResults,
  onRelease,
  onView,
}) {
  return (
    <Card className="rounded-2xl shadow">
      <CardContent>
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table size="small" sx={{ minWidth: 1200 }}>
            <TableHead>
              <TableRow className="bg-slate-100">
                <TableCell>Lab ID</TableCell>
                <TableCell>Date Requested</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Test Type</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Requested By</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell className="font-semibold">{r.id}</TableCell>
                  <TableCell>{r.dateRequested}</TableCell>
                  <TableCell>{r.patientName}</TableCell>
                  <TableCell>{r.testType}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={r.priority}
                      color={priorityColor(r.priority)}
                    />
                  </TableCell>
                  <TableCell>{r.requestedBy}</TableCell>
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
                        onClick={() => onEnterResults(r)}
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

                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => onView(r)}
                      >
                        View
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}

              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No lab requests found
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
