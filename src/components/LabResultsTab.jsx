import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Pagination,
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
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { latestVisitIdFrom, statusColor, todayISO } from "./helpers/labHelpers";
import { fullName } from "./helpers/nameHelper";
import { getAge } from "./helpers/dateHelper";
import RequestLabDialog from "./forms/RequestLabDialog";
import EnterResultsDialog from "./forms/EnterResultsDialog";
import ViewLabModal from "./modals/ViewLabModal";
import ConfirmDelete from "./modals/ConfirmDelete";
import CustomSnackbar from "./modals/CustomSnackBar";
import { fetchPatientProfile } from "../store/patientProfileSlice";
import {
  createLabRequest,
  getLabRequests,
  deleteLabRequest,
  subscribeToLabRequestChanges,
  updateLabRequest,
  getLabRequestsByVisitIds,
} from "../services/labRequestService";

const formatDisplayDate = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const formatDisplayTime = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

const sortNewestFirst = (rows = []) =>
  [...rows].sort(
    (a, b) => new Date(b.requestedDate || 0) - new Date(a.requestedDate || 0),
  );

const formatTemplateDate = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).format(date);
};

export default function LabResultsTab({ visits = [], role }) {
  const PAGE_SIZE = 5;
  const dispatch = useDispatch();
  const { id } = useParams();
  const { patientInfo } = useSelector((s) => s.patientProfile);

  const visitsData = useMemo(() => {
    const sourceVisits = patientInfo?.visits?.length
      ? patientInfo.visits
      : visits;

    return (sourceVisits || []).map((v) => ({
      ...v,
      date:
        v.date ||
        v.created_at ||
        v.scheduled_for ||
        v.visit_date ||
        v.visitDate ||
        "",
    }));
  }, [patientInfo?.visits, visits]);

  const latestVisitId = useMemo(
    () => latestVisitIdFrom(visitsData),
    [visitsData],
  );
  const visitIds = useMemo(() => visitsData.map((v) => v.id), [visitsData]);

  const visitLabel = (visitId) =>
    visitsData.find((v) => String(v.id) === String(visitId))?.date || visitId;

  const [items, setItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [openRequest, setOpenRequest] = useState(false);
  const [openEnter, setOpenEnter] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const templatePatient = useMemo(() => {
    const firstName = patientInfo?.first_name || "";
    const middleName = patientInfo?.middle_name || "";
    const lastName = patientInfo?.last_name || "";
    const combinedName = [lastName, firstName, middleName].filter(Boolean).join(", ");

    return {
      name: combinedName ? fullName(combinedName) : patientInfo?.full_name || "",
      age: patientInfo?.birth_date ? String(getAge(patientInfo.birth_date)) : "",
      sex: patientInfo?.gender || "",
      date: formatTemplateDate(selected?.requestedDate),
      address: patientInfo?.address || "",
      requestingPhysician: selected?.requestedBy || "",
    };
  }, [patientInfo, selected?.requestedDate, selected?.requestedBy]);

  const notify = (message, severity = "success") => {
    setSnack({ open: true, message, severity });
  };

  const loadRequests = useCallback(async () => {
    if (!visitsData.length) return;

    setLoading(true);

    try {
      const { rows, total } = await getLabRequestsByVisitIds(
        visitsData.map((v) => v.id),
        { page, pageSize: PAGE_SIZE },
      );

      setItems(sortNewestFirst(rows));
      setTotalItems(total);
    } catch (error) {
      console.error("Failed to fetch lab requests:", error);
      notify("Failed to load lab requests.", "error");
    } finally {
      setLoading(false);
    }
  }, [page, visitsData.length, PAGE_SIZE]);

  useEffect(() => {
    loadRequests();
    console.log("im running");
  }, [loadRequests]);
  useEffect(() => {
    setPage(1);
  }, [visitsData.length]);
  useEffect(() => {
    const channel = subscribeToLabRequestChanges(() => {
      loadRequests();
    });

    return () => {
      channel.unsubscribe();
    };
  }, [loadRequests]);

  const handleRequestSave = (payload) => {
    const services = Array.isArray(payload.testType)
      ? payload.testType
      : [payload.testType];

    Promise.all(
      services.map((service) =>
        createLabRequest({
          ...payload,
          testType: service,
        }),
      ),
    )
      .then(() => {
        notify("Lab request created successfully.");
      })
      .catch((error) => {
        console.error("Failed to create lab request:", error);
        notify("Failed to create lab request.", "error");
      });
  };

  const handleEnterSave = () => {};

  const handleRelease = (id) => {
    if (!confirm("Release this result?")) return;

    updateLabRequest(id, {
      status: "Released",
      releasedBy: "Doctor",
      releasedDate: todayISO(),
    })
      .then(() => {
        notify("Lab result released successfully.");
      })
      .catch((error) => {
        console.error("Failed to release lab request:", error);
        notify("Failed to release lab result.", "error");
      });
  };

  const handleDeleteClick = (item) => {
    setSelected(item);
    setOpenDelete(true);
  };

  const handleDelete = async () => {
    if (!selected?.id) return;

    setDeleteLoading(true);

    try {
      await deleteLabRequest(selected.id);
      notify("Lab request deleted successfully.");
      setOpenDelete(false);

      const { rows, total } = await getLabRequestsByVisitIds(
        visitsData.map((v) => v.id),
        { page, pageSize: PAGE_SIZE },
      );

      if (!rows.length && page > 1) {
        setPage((p) => p - 1);
        return;
      }

      setItems(sortNewestFirst(rows));
      setTotalItems(total);
    } catch (error) {
      console.error("Failed to delete lab request:", error);
      notify("Failed to delete lab request.", "error");
    } finally {
      setDeleteLoading(false);
    }
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
          disabled={!visitsData.length}
        >
          Request Lab Test
        </Button>
      </Box>

      {!visitsData.length ? (
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
            <Box sx={{ position: "relative" }}>
              {loading && (
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "rgba(255, 255, 255, 0.6)",
                    zIndex: 1,
                  }}
                >
                  <CircularProgress />
                </Box>
              )}
              <TableContainer sx={{ overflowX: "auto" }}>
                <Table size="small" sx={{ minWidth: 1050 }}>
                  <TableHead>
                    <TableRow className="bg-slate-100">
                      <TableCell>Date Requested</TableCell>
                      <TableCell>Time Requested</TableCell>
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
                        <TableCell>
                          {formatDisplayDate(x.requestedDate)}
                        </TableCell>
                        <TableCell>
                          {new Date(x.requestedDate).toLocaleTimeString(
                            "en-Us",
                          )}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {x.testType}
                        </TableCell>
                        <TableCell>
                          {formatDisplayDate(visitLabel(x.visitId))}
                        </TableCell>
                        <TableCell>Dr. {x.requestedBy}</TableCell>

                        <TableCell>
                          <Chip
                            label={x.priority}
                            size="small"
                            color={
                              x.priority === "Urgent" ? "error" : "default"
                            }
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

                            {role === "admin" ||
                              (role === "MedTech" && (
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
                              ))}

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
                              onClick={() => {
                                setSelected(x);
                                setOpenView(true);
                              }}
                            >
                              Print
                            </Button>

                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => handleDeleteClick(x)}
                            >
                              Delete
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}

                    {!loading && items.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          No lab requests found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </CardContent>
          {totalItems > PAGE_SIZE && (
            <Box className="flex justify-end px-6 pb-4">
              <Pagination
                count={Math.ceil(totalItems / PAGE_SIZE)}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </Card>
      )}

      {/* dialogs */}
      <RequestLabDialog
        open={openRequest}
        onClose={() => setOpenRequest(false)}
        onSave={handleRequestSave}
        visits={visitsData}
        latestVisitId={latestVisitId}
      />

      <EnterResultsDialog
        open={openEnter}
        onClose={() => setOpenEnter(false)}
        item={selected}
        onSave={handleEnterSave}
        patient={templatePatient}
      />

      <ViewLabModal
        open={openView}
        onClose={() => setOpenView(false)}
        item={selected}
        visitLabel={selected ? visitLabel(selected.visitId) : ""}
        patient={templatePatient}
      />

      <ConfirmDelete
        open={openDelete}
        cancel={() => setOpenDelete(false)}
        handleDelete={handleDelete}
        loading={deleteLoading}
      />

      <CustomSnackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((prev) => ({ ...prev, open: false }))}
        message={snack.message}
        severity={snack.severity}
      />
    </Box>
  );
}
