import { Box, CircularProgress, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { supabase } from "../../../../lib/supabaseClient";
import { subscribeToQueueChanges, updateQueueEntry } from "../../../../services/queueService";
import DoctorQueueTable from "../../components/DoctorQueueTable";
import DoctorQueueFilters from "../components/DoctorQueueFilters";

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

const mapRow = (r) => {
  const patient = r.patients
    ? [r.patients.first_name, r.patients.middle_name, r.patients.last_name].filter(Boolean).join(" ")
    : r.display_name || "Unknown";
  return {
    id: r.id,
    patientId: r.patients?.id,
    patient,
    time: r.queued_at
      ? new Date(r.queued_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
      : "—",
    reason: r.chief_complaint || r.visits?.chief_complaint || "—",
    status: r.status,
    _raw: r,
  };
};

export default function DoctorQueuePage() {
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);

  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    let cancelled = false;
    let channel;

    const fetchData = async () => {
      const { data, error } = await supabase
        .from("queue_entries")
        .select(QUEUE_SELECT)
        .eq("doctor", user.id)
        .in("status", ["Waiting", "In Consult", "Done"])
        .order("queue_number", { ascending: true, nullsFirst: false })
        .order("queued_at", { ascending: true });

      if (!cancelled) {
        if (!error) setRows((data || []).map(mapRow));
        setLoading(false);
      }
    };

    fetchData();

    channel = subscribeToQueueChanges(() => {
      if (!cancelled) fetchData();
    });

    return () => {
      cancelled = true;
      if (channel) channel.unsubscribe();
    };
  }, [user?.id]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return rows
      .filter((r) => (status === "All" ? true : r.status === status))
      .filter((r) => {
        if (!qq) return true;
        return (
          (r.patient || "").toLowerCase().includes(qq) ||
          (r.reason || "").toLowerCase().includes(qq) ||
          (r.time || "").toLowerCase().includes(qq)
        );
      });
  }, [rows, q, status]);

  const onStart = async (row) => {
    try {
      await updateQueueEntry(row.id, { status: "In Consult" });
    } catch (err) {
      console.error("Failed to start consult:", err);
    }
  };

  const onDone = async (row) => {
    try {
      await updateQueueEntry(row.id, { status: "Done" });
    } catch (err) {
      console.error("Failed to mark done:", err);
    }
  };

  const onOpenChart = (row) => {
    navigate(`/doctor/patients/${row.patientId}`);
  };

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
          Queue Today
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Start consults, open charts, and mark visits as done.
        </Typography>
      </Box>

      <DoctorQueueFilters
        q={q}
        setQ={setQ}
        status={status}
        setStatus={setStatus}
      />

      <DoctorQueueTable
        rows={filtered}
        onStart={onStart}
        onOpenChart={onOpenChart}
        onDone={onDone}
      />
    </Box>
  );
}
