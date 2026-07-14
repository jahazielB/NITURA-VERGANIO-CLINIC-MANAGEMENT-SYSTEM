import { Box, Typography, CircularProgress } from "@mui/material";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { todayISO } from "../../components/helpers/labHelpers";

import QueueIcon from "@mui/icons-material/Queue";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import DoneAllIcon from "@mui/icons-material/DoneAll";

import NurseStatCard from "./components/NurseStatCard";
import QueuePreviewTable from "./components/QueuePreviewTable";
import NurseQuickActions from "./components/NurseQuickActions";

const QUEUE_SELECT = `
  id, queue_number, display_name, queued_at, status,
  patients ( id, first_name, middle_name, last_name ),
  visits ( id, visit_type, scheduled_for, chief_complaint )
`;

const mapQueueRow = (r) => {
  const patient = r.patients
    ? [r.patients.first_name, r.patients.middle_name, r.patients.last_name].filter(Boolean).join(" ")
    : r.display_name || "Unknown";
  return {
    id: r.id,
    queueNo: r.queue_number ?? "—",
    patient,
    arrivalTime: r.queued_at
      ? new Date(r.queued_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
      : "—",
    waitingTime: "—",
    status: r.status,
  };
};

export default function NurseDashboardPage() {
  const navigate = useNavigate();

  const [waitingCount, setWaitingCount] = useState(0);
  const [totalToday, setTotalToday] = useState(0);
  const [registrations, setRegistrations] = useState(0);
  const [served, setServed] = useState(0);
  const [queueRows, setQueueRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isoDate = todayISO();

      const [waitingRes, totalRes, regRes, servedRes, queueRes] = await Promise.all([
        supabase
          .from("queue_entries")
          .select("id", { count: "exact", head: true })
          .eq("queue_date", isoDate)
          .eq("status", "Waiting"),
        supabase
          .from("queue_entries")
          .select("id", { count: "exact", head: true })
          .eq("queue_date", isoDate),
        supabase
          .from("patients")
          .select("id", { count: "exact", head: true })
          .gte("created_at", today.toISOString()),
        supabase
          .from("queue_entries")
          .select("id", { count: "exact", head: true })
          .eq("queue_date", isoDate)
          .eq("status", "Done"),
        supabase
          .from("queue_entries")
          .select(QUEUE_SELECT)
          .eq("queue_date", isoDate)
          .in("status", ["Waiting", "In Consult"])
          .order("queue_number", { ascending: true, nullsFirst: false })
          .order("queued_at", { ascending: true })
          .limit(10),
      ]);

      if (!cancelled) {
        setWaitingCount(waitingRes.count ?? 0);
        setTotalToday(totalRes.count ?? 0);
        setRegistrations(regRes.count ?? 0);
        setServed(servedRes.count ?? 0);
        setQueueRows((queueRes.data || []).map(mapQueueRow));
        setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, []);

  const stats = useMemo(() => ({
    waiting: waitingCount,
    appointments: totalToday,
    registrations,
    served,
  }), [waitingCount, totalToday, registrations, served]);

  if (loading) {
    return (
      <Box className="flex min-h-screen bg-slate-100 justify-center items-center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="space-y-4 p-5.5">
      <Box>
        <Typography variant="h6" className="font-bold">
          Nurse Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage patient flow, registrations, and the daily queue.
        </Typography>
      </Box>

      <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <NurseStatCard
          title="Patients in Queue"
          value={stats.waiting}
          icon={<QueueIcon />}
          bg="bg-yellow-100"
          color="text-yellow-700"
        />
        <NurseStatCard
          title="Today's Appointments"
          value={stats.appointments}
          icon={<CalendarMonthIcon />}
          bg="bg-blue-100"
          color="text-blue-700"
        />
        <NurseStatCard
          title="Today's Registrations"
          value={stats.registrations}
          icon={<PersonAddIcon />}
          bg="bg-green-100"
          color="text-green-700"
        />
        <NurseStatCard
          title="Patients Served Today"
          value={stats.served}
          icon={<DoneAllIcon />}
          bg="bg-purple-100"
          color="text-purple-700"
        />
      </Box>

      <QueuePreviewTable
        rows={queueRows}
        onSeeAll={() => navigate("/nurse/queue")}
      />

      <NurseQuickActions
        onRegisterPatient={() => navigate("/nurse/patients")}
        onNewAppointment={() => navigate("/nurse/queue")}
        onOpenQueue={() => navigate("/nurse/queue")}
      />
    </Box>
  );
}
