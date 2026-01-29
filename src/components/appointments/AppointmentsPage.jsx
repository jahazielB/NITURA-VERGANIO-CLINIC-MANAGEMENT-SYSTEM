import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EventIcon from "@mui/icons-material/Event";
import AppointmentsTable from "./AppointmentsTable";
import AppointmentFormDialog from "../forms/AppointmentFormDialog";
import {
  APPT_STATUS,
  APPT_TAB,
  isToday,
  isUpcoming,
  matchesSearch,
  nowTimeHM,
} from "../helpers/appointmentHelpers";
import { todayISO } from "../helpers/labHelpers";

export default function AppointmentsPage() {
  const [tab, setTab] = useState(APPT_TAB.TODAY);
  const [search, setSearch] = useState("");

  const [openForm, setOpenForm] = useState(false);
  const [formMode, setFormMode] = useState("walkin"); // walkin | schedule | edit
  const [selected, setSelected] = useState(null);

  const [rows, setRows] = useState([
    {
      id: 1,
      patientName: "Anna Reyes",
      contact: "0912-345-6789",
      date: todayISO(),
      time: nowTimeHM(),
      reason: "Fever",
      doctor: "Unassigned",
      visitType: "Consultation",
      status: APPT_STATUS.WAITING,
      isWalkIn: true,
    },
    {
      id: 2,
      patientName: "Jane Castillo",
      contact: "",
      date: todayISO(),
      time: "09:30",
      reason: "Follow-up (Cough symptoms)",
      doctor: "Dr. Alex",
      visitType: "Follow-up",
      status: APPT_STATUS.IN_CONSULT,
      isWalkIn: false,
    },
    {
      id: 3,
      patientName: "Bobby De Leon",
      contact: "",
      date: todayISO(),
      time: "09:00",
      reason: "Lab requested",
      doctor: "Dr. Alex",
      visitType: "Laboratory",
      status: APPT_STATUS.DONE,
      isWalkIn: false,
    },
    {
      id: 4,
      patientName: "Paolo Mercado",
      contact: "",
      date: todayISO(),
      time: "08:45",
      reason: "Headaches",
      doctor: "Dr. Bea",
      visitType: "Consultation",
      status: APPT_STATUS.CANCELLED,
      isWalkIn: false,
    },
  ]);

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

  const handleSave = (appt) => {
    setRows((prev) => {
      const exists = prev.some((x) => x.id === appt.id);
      if (exists) return prev.map((x) => (x.id === appt.id ? appt : x));
      return [appt, ...prev];
    });
  };

  const handleStart = (r) => {
    setRows((prev) =>
      prev.map((x) =>
        x.id === r.id ? { ...x, status: APPT_STATUS.IN_CONSULT } : x,
      ),
    );
  };

  const handleDone = (r) => {
    setRows((prev) =>
      prev.map((x) => (x.id === r.id ? { ...x, status: APPT_STATUS.DONE } : x)),
    );
  };

  const handleCancelMore = (r) => {
    const choice = prompt(
      "Type one: cancel | noshow\n\n(cancel = Cancelled, noshow = No-show)",
    );
    if (!choice) return;

    const normalized = choice.toLowerCase().trim();
    if (normalized !== "cancel" && normalized !== "noshow") {
      alert("Invalid choice.");
      return;
    }

    setRows((prev) =>
      prev.map((x) =>
        x.id === r.id
          ? {
              ...x,
              status:
                normalized === "cancel"
                  ? APPT_STATUS.CANCELLED
                  : APPT_STATUS.NO_SHOW,
            }
          : x,
      ),
    );
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
      const da = new Date(`${a.date}T${a.time}:00`);
      const db = new Date(`${b.date}T${b.time}:00`);
      return db - da; // newest on top
    });
  }, [rows, search, tab]);

  return (
    <Box className="space-y-4 p-5.5">
      {/* Header row */}
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
          >
            Add Walk-in
          </Button>
          <Button
            variant="outlined"
            startIcon={<EventIcon />}
            onClick={openSchedule}
          >
            Schedule Appointment
          </Button>
        </Box>
      </Box>

      {/* Search + Tabs */}
      <Card className="rounded-2xl shadow">
        <CardContent className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <TextField
            placeholder="Search name or contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
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

      {/* Table */}
      <Card className="rounded-2xl shadow">
        <CardContent>
          <AppointmentsTable
            rows={filtered}
            onStart={handleStart}
            onDone={handleDone}
            onEdit={openEdit}
            onCancel={handleCancelMore}
          />
        </CardContent>
      </Card>

      {/* Dialog */}
      <AppointmentFormDialog
        open={openForm}
        mode={formMode}
        onClose={() => setOpenForm(false)}
        onSave={handleSave}
        initialValues={selected}
      />
    </Box>
  );
}
