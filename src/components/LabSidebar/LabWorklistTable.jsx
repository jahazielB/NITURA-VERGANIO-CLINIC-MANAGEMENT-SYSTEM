import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import PrintIcon from "@mui/icons-material/Print";
import AutorenewIcon from "@mui/icons-material/Autorenew";

// Adjust path if needed
import { statusColor } from "../helpers/labHelpers";

export default function LabWorklistTable({
  rows = [],
  onView,
  onEnter,
  onMarkProcessing,
  onRelease,
  onPrint,
  showPatientColumn = true,
}) {
  return (
    <Card className="rounded-2xl shadow h-[500px]">
      <CardContent>
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table size="small" sx={{ minWidth: 1150 }}>
            <TableHead>
              <TableRow className="bg-slate-100">
                <TableCell>Date Requested</TableCell>
                {showPatientColumn && <TableCell>Patient</TableCell>}
                <TableCell>Test</TableCell>
                <TableCell>Visit</TableCell>
                <TableCell>Requested By</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.map((x) => (
                <TableRow key={x.id} hover>
                  <TableCell>{x.requestedDate}</TableCell>

                  {showPatientColumn && (
                    <TableCell className="font-semibold">
                      {x.patientName || "—"}
                    </TableCell>
                  )}

                  <TableCell className="font-semibold">{x.testType}</TableCell>
                  <TableCell>{x.visitLabel || x.visitId}</TableCell>
                  <TableCell>{x.requestedBy}</TableCell>

                  <TableCell>
                    <Chip
                      label={x.priority}
                      size="small"
                      color={x.priority === "Urgent" ? "error" : "default"}
                    />
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={x.status}
                      size="small"
                      color={statusColor(x.status)}
                    />
                  </TableCell>

                  <TableCell align="right">
                    <Box className="flex justify-end gap-1 flex-wrap">
                      {x.status === "Pending" && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<AutorenewIcon />}
                          onClick={() => onMarkProcessing?.(x.id)}
                        >
                          Processing
                        </Button>
                      )}

                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<VisibilityIcon />}
                        onClick={() => onView?.(x)}
                      >
                        View
                      </Button>

                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EditNoteIcon />}
                        onClick={() => onEnter?.(x)}
                      >
                        Enter Results
                      </Button>

                      {x.status === "Ready" && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="success"
                          startIcon={<DoneAllIcon />}
                          onClick={() => onRelease?.(x.id)}
                        >
                          Release
                        </Button>
                      )}

                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<PrintIcon />}
                        onClick={() => onPrint?.(x)}
                      >
                        Print
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}

              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={showPatientColumn ? 8 : 7} align="center">
                    No lab requests found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box mt={1}>
          <Typography variant="caption" color="text.secondary">
            Pending → Processing → Ready → Released
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
