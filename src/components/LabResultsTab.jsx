import { useMemo, useState } from "react";
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

import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import PrintIcon from "@mui/icons-material/Print";

import { latestVisitIdFrom, statusColor, todayISO } from "./helpers/labHelpers";
import RequestLabDialog from "./forms/RequestLabDialog";
import EnterResultsDialog from "./forms/EnterResultsDialog";
import ViewLabModal from "./modals/ViewLabModal";

export default function LabResultsTab({ visits = [] }) {
  const latestVisitId = useMemo(() => latestVisitIdFrom(visits), [visits]);

  const visitLabel = (visitId) =>
    visits.find((v) => v.id === visitId)?.date || visitId;

  const [items, setItems] = useState([
    {
      id: 101,
      visitId: visits[0]?.id || "V1",
      testType: "CBC",
      priority: "Routine",
      notes: "Fever x3 days",
      requestedBy: "Dr. Alex",
      requestedDate: todayISO(),
      status: "Pending",
      resultSummary: "",
      impression: "",
      techNotes: "",
      performedBy: "",
      performedDate: "",
      releasedBy: "",
      releasedDate: "",
    },
  ]);

  const [openRequest, setOpenRequest] = useState(false);
  const [openEnter, setOpenEnter] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [selected, setSelected] = useState(null);

  const handleRequestSave = (payload) => {
    setItems((prev) => [payload, ...prev]);
  };

  const handleEnterSave = (updated) => {
    setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
  };

  const handleRelease = (id) => {
    if (!confirm("Release this result?")) return;
    setItems((prev) =>
      prev.map((x) =>
        x.id === id
          ? {
              ...x,
              status: "Released",
              releasedBy: "Doctor",
              releasedDate: todayISO(),
            }
          : x,
      ),
    );
  };

  return (
    <Box className="space-y-4">
      {/* Header */}
      <Box className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Box>
          <Typography variant="h6" className="font-bold">
            Lab Results
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Admin view: request tests, enter results, and release results.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenRequest(true)}
          disabled={!visits.length}
        >
          Request Lab Test
        </Button>
      </Box>

      {!visits.length ? (
        <Card className="rounded-2xl shadow">
          <CardContent>
            <Typography className="font-semibold">No visits yet</Typography>
            <Typography variant="body2" color="text.secondary">
              Add a visit first to request lab tests.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-2xl shadow">
          <CardContent>
            <TableContainer sx={{ overflowX: "auto" }}>
              <Table size="small" sx={{ minWidth: 1050 }}>
                <TableHead>
                  <TableRow className="bg-slate-100">
                    <TableCell>Date Requested</TableCell>
                    <TableCell>Test</TableCell>
                    <TableCell>Visit</TableCell>
                    <TableCell>Requested By</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {items.map((x) => (
                    <TableRow key={x.id} hover>
                      <TableCell>{x.requestedDate}</TableCell>
                      <TableCell className="font-semibold">
                        {x.testType}
                      </TableCell>
                      <TableCell>{visitLabel(x.visitId)}</TableCell>
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
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<VisibilityIcon />}
                            onClick={() => {
                              setSelected(x);
                              setOpenView(true);
                            }}
                          >
                            View
                          </Button>

                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<EditNoteIcon />}
                            onClick={() => {
                              setSelected(x);
                              setOpenEnter(true);
                            }}
                          >
                            Enter Results
                          </Button>

                          {x.status === "Ready" && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="success"
                              startIcon={<DoneAllIcon />}
                              onClick={() => handleRelease(x.id)}
                            >
                              Release
                            </Button>
                          )}

                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<PrintIcon />}
                            onClick={() =>
                              alert("Print lab result coming soon")
                            }
                          >
                            Print
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}

                  {items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No lab requests found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* dialogs */}
      <RequestLabDialog
        open={openRequest}
        onClose={() => setOpenRequest(false)}
        onSave={handleRequestSave}
        visits={visits}
        latestVisitId={latestVisitId}
      />

      <EnterResultsDialog
        open={openEnter}
        onClose={() => setOpenEnter(false)}
        item={selected}
        onSave={handleEnterSave}
      />

      <ViewLabModal
        open={openView}
        onClose={() => setOpenView(false)}
        item={selected}
        visitLabel={selected ? visitLabel(selected.visitId) : ""}
      />
    </Box>
  );
}
