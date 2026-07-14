import { Box, CircularProgress } from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import ScienceIcon from "@mui/icons-material/Science";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import PersonIcon from "@mui/icons-material/Person";

import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { supabase } from "../../lib/supabaseClient";
import DoctorStatCard from "./components/DoctorStatCard";
import DoctorQueueTable from "./components/DoctorQueueTable";
import LabReviewCard from "./components/LabReviewCard";
import DoctorQuickActions from "./components/DoctorQuickActions";

const QUEUE_SELECT = `
  id,
  status,
  display_name,
  queue_number,
  queued_at,
  chief_complaint,
  doctor,
  patients ( id, first_name, middle_name, last_name, contact_number ),
  visits ( id, visit_type, status, scheduled_for, chief_complaint )
`;

const mapQueueRow = (r) => {
  const patient = r.patients
    ? [r.patients.first_name, r.patients.middle_name, r.patients.last_name].filter(Boolean).join(" ")
    : r.display_name || "Unknown";
  return {
    id: r.id,
    patient,
    time: r.queued_at
      ? new Date(r.queued_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
      : "—",
    reason: r.chief_complaint || r.visits?.chief_complaint || "—",
    status: r.status,
    _raw: r,
  };
};

const mapLabRow = (r) => ({
  id: r.id,
  patient: r.visits?.patients
    ? [r.visits.patients.first_name, r.visits.patients.middle_name, r.visits.patients.last_name].filter(Boolean).join(" ")
    : "Unknown",
  test: r.lab_services?.name || "—",
  date: r.created_at
    ? new Date(r.created_at).toLocaleDateString("en-US")
    : "—",
  status: r.status,
  _raw: r,
});

const LAB_SELECT = `
  id,
  status,
  created_at,
  lab_services ( id, name ),
  visits (
    id,
    patients ( id, first_name, middle_name, last_name )
  )
`;

export default function DoctorDashboardPage() {
  const user = useSelector((s) => s.auth.user);
  const doctorId = user?.id;

  const [queue, setQueue] = useState([]);
  const [labReady, setLabReady] = useState([]);
  const [loading, setLoading] = useState(true);

  const [doneCount, setDoneCount] = useState(0);

  useEffect(() => {
    if (!doctorId) return;

    let cancelled = false;

    const fetchData = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [queueRes, labRes, doneRes] = await Promise.all([
        supabase
          .from("queue_entries")
          .select(QUEUE_SELECT)
          .eq("doctor", doctorId)
          .in("status", ["Waiting", "In Consult"])
          .gte("created_at", today.toISOString())
          .order("queue_number", { ascending: true, nullsFirst: false })
          .order("queued_at", { ascending: true }),
        supabase
          .from("lab_requests")
          .select(LAB_SELECT)
          .eq("status", "Released")
          .order("created_at", { ascending: false }),
        supabase
          .from("queue_entries")
          .select("id", { count: "exact", head: true })
          .eq("doctor", doctorId)
          .eq("status", "Done")
          .gte("created_at", today.toISOString()),
      ]);

      if (!cancelled) {
        setQueue((queueRes.data || []).map(mapQueueRow));
        setLabReady((labRes.data || []).map(mapLabRow));
        setDoneCount(doneRes.count ?? 0);
        setLoading(false);
      }
    };

    fetchData();

    return () => { cancelled = true; };
  }, [doctorId]);

  const stats = useMemo(() => {
    const waiting = queue.filter((x) => x.status === "Waiting").length;
    const inConsult = queue.filter((x) => x.status === "In Consult").length;
    const labCount = labReady.length;
    return { waiting, inConsult, done: doneCount, labCount };
  }, [queue, labReady, doneCount]);

  const onViewLab = (r) => {
    const labId = r.id;
    window.open(`/Doctor/lab-review?labId=${labId}`, "_blank");
  };

  if (loading) {
    return (
      <Box className="flex min-h-screen bg-slate-100 justify-center items-center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="flex min-h-screen bg-slate-100">
      <Box component="main" sx={{ flexGrow: 1 }}>
        {/* Top Stats */}
        <Box className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DoctorStatCard
            title="Patients Waiting"
            value={stats.waiting}
            icon={<EventIcon />}
            iconBg="bg-yellow-100"
            iconColor="text-yellow-700"
          />
          <DoctorStatCard
            title="In Consult"
            value={stats.inConsult}
            icon={<PersonIcon />}
            iconBg="bg-blue-100"
            iconColor="text-blue-700"
          />
          <DoctorStatCard
            title="Lab Results Released"
            value={stats.labCount}
            icon={<ScienceIcon />}
            iconBg="bg-purple-100"
            iconColor="text-purple-700"
          />
          <DoctorStatCard
            title="Done Today"
            value={stats.done}
            icon={<DoneAllIcon />}
            iconBg="bg-green-100"
            iconColor="text-green-700"
          />
        </Box>

        {/* Main layout */}
        <Box className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Box className="lg:col-span-2">
            <DoctorQueueTable
              rows={queue.filter((x) => x.status !== "Done")}
            />
          </Box>

          <Box className="flex flex-col gap-4">
            <LabReviewCard rows={labReady} onView={onViewLab} />
          </Box>

          <Box className="lg:col-span-3">
            <DoctorQuickActions />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
