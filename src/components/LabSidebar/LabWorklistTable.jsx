import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
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
import DeleteIcon from "@mui/icons-material/Delete";
import AutorenewIcon from "@mui/icons-material/Autorenew";

// Adjust path if needed
import { statusColor } from "../helpers/labHelpers";
import ConfirmDelete from "../modals/ConfirmDelete";

function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatRequestedDate(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const t = date.toLocaleTimeString("en-US");
  return `${formatDate(date)} ${t}`;
}

export default function LabWorklistTable({
  rows = [],
  onView,
  onEnter,
  onMarkProcessing,
  onRelease,
  onDelete,
  showPatientColumn = true,
}) {
  const [loadingKey, setLoadingKey] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    setLoadingKey(null);
    setDeleteTarget(null);
  }, [rows]);

  return (
    <>
      <Card className="rounded-2xl shadow">
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
                    <TableCell>
                      {formatRequestedDate(x.requestedDate)}
                    </TableCell>

                    {showPatientColumn && (
                      <TableCell className="font-semibold">
                        {x.patientName || "â€”"}
                      </TableCell>
                    )}

                    <TableCell className="font-semibold">
                      {x.testType}
                    </TableCell>
                    <TableCell>
                      {formatDate(x.visitLabel) || x.visitId}
                    </TableCell>
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
                            disabled={loadingKey === `proc-${x.id}`}
                            startIcon={
                              loadingKey === `proc-${x.id}` ? (
                                <CircularProgress size={16} />
                              ) : (
                                <AutorenewIcon />
                              )
                            }
                            onClick={() => {
                              setLoadingKey(`proc-${x.id}`);
                              onMarkProcessing?.(x.id);
                            }}
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
                            disabled={loadingKey === `rel-${x.id}`}
                            startIcon={
                              loadingKey === `rel-${x.id}` ? (
                                <CircularProgress size={16} />
                              ) : (
                                <DoneAllIcon />
                              )
                            }
                            onClick={() => {
                              setLoadingKey(`rel-${x.id}`);
                              onRelease?.(x.id);
                            }}
                          >
                            Release
                          </Button>
                        )}

                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => setDeleteTarget(x.id)}
                        >
                          Delete
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}

                {rows.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={showPatientColumn ? 8 : 7}
                      align="center"
                    >
                      No lab requests found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* <Box mt={1}>
          <Typography variant="caption" color="text.secondary">
            Pending â†’ Processing â†’ Ready â†’ Released
          </Typography>
        </Box> */}
        </CardContent>
      </Card>

      <ConfirmDelete
        open={!!deleteTarget}
        cancel={() => setDeleteTarget(null)}
        loading={loadingKey === `del-${deleteTarget}`}
        handleDelete={() => {
          setLoadingKey(`del-${deleteTarget}`);
          onDelete?.(deleteTarget);
        }}
      />
    </>
  );
}
