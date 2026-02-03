import { Box, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import DoctorQueueTable from "../../components/DoctorQueueTable";
// ✅ adjust import path to where your DoctorQueueTable.jsx lives

import DoctorQueueFilters from "../components/DoctorQueueFilters";
import { doctorQueueMock } from "../components/doctorQueueMock";

export default function DoctorQueuePage() {
  const navigate = useNavigate();

  const [rows, setRows] = useState(doctorQueueMock);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("Waiting"); // ✅ default for doctors

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

  const updateStatus = (id, next) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: next } : r)),
    );
  };

  const onStart = (row) => updateStatus(row.id, "In Consult");
  const onDone = (row) => updateStatus(row.id, "Done");

  const onOpenChart = (row) => {
    // ✅ wire later to your patient profile route
    navigate(`/doctor/patients/${row.patientId}`);
  };

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
