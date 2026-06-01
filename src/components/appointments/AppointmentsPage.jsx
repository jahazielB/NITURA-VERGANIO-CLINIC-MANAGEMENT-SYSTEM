import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Pagination,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EventIcon from "@mui/icons-material/Event";
import AppointmentsTable from "./AppointmentsTable";
import AppointmentFormDialog from "../forms/AppointmentFormDialog";
import CustomSnackbar from "../modals/CustomSnackBar";
import {
  APPT_STATUS,
  APPT_TAB,
  isToday,
  isUpcoming,
  matchesSearch,
} from "../helpers/appointmentHelpers";
import {
  mapFormToCreatePayload,
  mapFormToUpdatePatch,
  mapQueueEntryToRow,
  mapUiStatusToDb,
} from "../helpers/queueMappers";
import {
  createQueueEntry,
  deleteQueueEntry,
  getTodayQueue,
  subscribeToQueueChanges,
  updateQueueEntry,
} from "../../services/queueService";

export default function AppointmentsPage() {
  const [tab, setTab] = useState(APPT_TAB.TODAY);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const [openForm, setOpenForm] = useState(false);
  const [formMode, setFormMode] = useState("walkin");
  const [selected, setSelected] = useState(null);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "info",
    message: "",
  });

  const showSnackbar = useCallback((severity, message) => {
    setSnackbar({
      open: true,
      severity,
      message,
    });
  }, []);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTodayQueue();
      setRows(data.map(mapQueueEntryToRow));
    } catch (e) {
      const message = e.message || "Failed to load today's queue";
      setError(message);
      showSnackbar("error", message);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  useEffect(() => {
    const channel = subscribeToQueueChanges(() => {
      loadQueue();
    });

    return () => {
      channel.unsubscribe();
    };
  }, [loadQueue]);

  const upsertRow = useCallback((entry) => {
    const row = mapQueueEntryToRow(entry);
    setRows((prev) => {
      const exists = prev.some((x) => x.id === row.id);
      if (exists) return prev.map((x) => (x.id === row.id ? row : x));
      return [row, ...prev];
    });
  }, []);

  const runAction = useCallback(async (fn, successMessage) => {
    setActionError(null);
    try {
      await fn();
      if (successMessage) showSnackbar("success", successMessage);
      return true;
    } catch (e) {
      const message = e.message || "Action failed";
      setActionError(message);
      showSnackbar("error", message);
      return false;
    }
  }, [showSnackbar]);

  const openWalkIn = () => {
    setFormMode("walkin");
    setSelected(null);
    setOpenForm(true);
  };

  const openSchedule = () => {
    setFormMode("schedule");
    setSelected(null);
    setOpenForm(true);
  };

  const openEdit = (row) => {
    setFormMode("edit");
    setSelected(row);
    setOpenForm(true);
  };

  const handleSave = async (appt) => {
    const successMessage =
      formMode === "edit"
        ? "Appointment updated successfully."
        : "Appointment created successfully.";

    const ok = await runAction(async () => {
      if (formMode === "edit" && appt.id) {
        const updated = await updateQueueEntry(
          appt.id,
          mapFormToUpdatePatch(appt),
        );
        upsertRow(updated);
      } else {
        const created = await createQueueEntry(mapFormToCreatePayload(appt));
        upsertRow(created);
      }
    }, successMessage);
    if (ok) setOpenForm(false);
  };

  const handleStart = (r) =>
    runAction(async () => {
      const updated = await updateQueueEntry(r.id, {
        status: APPT_STATUS.IN_CONSULT,
      });
      upsertRow(updated);
    }, "Appointment marked as In Consult.");

  const handleDone = (r) =>
    runAction(async () => {
      const updated = await updateQueueEntry(r.id, { status: APPT_STATUS.DONE });
      upsertRow(updated);
    }, "Appointment marked as completed.");

  const handleCancelMore = (r) => {
    const choice = prompt(
      "Type one: cancel | noshow\n\n(cancel = Cancelled, noshow = No-show)",
    );
    if (!choice) return;

    const normalized = choice.toLowerCase().trim();
    if (normalized !== "cancel" && normalized !== "noshow") {
      showSnackbar("error", "Invalid choice.");
      return;
    }

    const status =
      normalized === "cancel" ? APPT_STATUS.CANCELLED : APPT_STATUS.NO_SHOW;

    runAction(async () => {
      const updated = await updateQueueEntry(r.id, {
        status: mapUiStatusToDb(status),
      });
      upsertRow(updated);
    }, status === APPT_STATUS.CANCELLED
      ? "Appointment cancelled."
      : "Appointment marked as no-show.");
  };

  const handleDelete = (r) => {
    if (!window.confirm(`Remove ${r.patientName} from the queue?`)) return;

    runAction(async () => {
      await deleteQueueEntry(r.id);
      setRows((prev) => prev.filter((x) => x.id !== r.id));
    }, "Appointment removed from the queue.");
  };

  const filtered = useMemo(() => {
    const base = rows
      .filter((r) => matchesSearch(r, search))
      .filter((r) => {
        if (tab === APPT_TAB.TODAY) return isToday(r.date);
        if (tab === APPT_TAB.UPCOMING)
          return isUpcoming(r.date) && r.status !== APPT_STATUS.CANCELLED;
        if (tab === APPT_TAB.COMPLETED) return r.status === APPT_STATUS.DONE;
        if (tab === APPT_TAB.CANCELLED)
          return (
            r.status === APPT_STATUS.CANCELLED ||
            r.status === APPT_STATUS.NO_SHOW
        );
        return true;
      });

    return base.sort((a, b) => {
      if (tab === APPT_TAB.TODAY) {
        const aq = a.queueNumber ?? null;
        const bq = b.queueNumber ?? null;
        if (aq != null && bq != null && aq !== bq) return aq - bq;
        if (aq != null && bq == null) return -1;
        if (aq == null && bq != null) return 1;
        const da = new Date(`${a.date}T${a.time}:00`);
        const db = new Date(`${b.date}T${b.time}:00`);
        return da - db;
      }

      const da = new Date(`${a.date}T${a.time}:00`);
      const db = new Date(`${b.date}T${b.time}:00`);
      return db - da;
    });
  }, [rows, search, tab]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  useEffect(() => {
    setPage(1);
  }, [tab, search]);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const showEmpty = !loading && !error && filtered.length === 0;

  return (
    <Box className="space-y-4 p-5.5">
      <Box className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <Box>
          <Typography variant="h6" className="font-bold">
            Appointments / Queue
          </Typography>
        </Box>

        <Box className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openWalkIn}
            disabled={loading}
          >
            Add Walk-in
          </Button>
          <Button
            variant="outlined"
            startIcon={<EventIcon />}
            onClick={openSchedule}
            disabled={loading}
          >
            Schedule Appointment
          </Button>
        </Box>
      </Box>

      {actionError && (
        <Alert severity="error" onClose={() => setActionError(null)}>
          {actionError}
        </Alert>
      )}

      <Card className="rounded-2xl shadow">
        <CardContent className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <TextField
            placeholder="Search name or contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: "50%" }}
            disabled={loading}
          />

          <Tabs
            value={tab}
            onChange={(e, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ minHeight: 44 }}
          >
            <Tab value={APPT_TAB.TODAY} label="Queue (Today)" />
            <Tab value={APPT_TAB.UPCOMING} label="Upcoming" />
            <Tab value={APPT_TAB.COMPLETED} label="Completed" />
            <Tab value={APPT_TAB.CANCELLED} label="Cancelled / No-show" />
          </Tabs>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow">
        <CardContent>
          {loading && (
            <Box className="flex justify-center py-12">
              <CircularProgress />
            </Box>
          )}

          {!loading && error && (
            <Box className="space-y-3 py-6">
              <Alert severity="error">{error}</Alert>
              <Button variant="outlined" onClick={loadQueue}>
                Retry
              </Button>
            </Box>
          )}

          {!loading && !error && showEmpty && (
            <Box className="py-12 text-center">
              <Typography variant="body1" color="text.secondary">
                No queue entries for this view.
              </Typography>
              <Typography variant="body2" color="text.secondary" className="mt-1">
                Add a walk-in or schedule an appointment to get started.
              </Typography>
            </Box>
          )}

          {!loading && !error && !showEmpty && (
            <>
              <AppointmentsTable
                rows={paginated}
                onStart={handleStart}
                onDone={handleDone}
                onEdit={openEdit}
                onCancel={handleCancelMore}
                onDelete={handleDelete}
              />

              {totalPages > 1 && (
                <Box className="mt-4 flex justify-center">
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, value) => setPage(value)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <AppointmentFormDialog
        open={openForm}
        mode={formMode}
        onClose={() => setOpenForm(false)}
        onSave={handleSave}
        initialValues={selected}
      />

      <CustomSnackbar
        open={snackbar.open}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Box>
  );
}
