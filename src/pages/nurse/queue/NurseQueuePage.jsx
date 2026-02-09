import { Box, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import NurseQueueFilters from "./components/NurseQueueFilters";
import NurseQueueTable from "./components/NurseQueueTable";
import TriageVitalsDialog from "./components/TriageVitalsDialog";
import { nurseQueueMock } from "./components/nurseQueueMock";

export default function NurseQueuePage() {
  const navigate = useNavigate();

  const [rows, setRows] = useState(nurseQueueMock);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("Waiting");

  const [openTriage, setOpenTriage] = useState(false);
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();

    return rows
      .filter((r) => (status === "All" ? true : r.status === status))
      .filter((r) => {
        if (!qq) return true;
        return (
          (r.patientName || "").toLowerCase().includes(qq) ||
          (r.patientId || "").toLowerCase().includes(qq) ||
          (r.reason || "").toLowerCase().includes(qq) ||
          (r.time || "").toLowerCase().includes(qq)
        );
      })
      .sort((a, b) => String(a.time).localeCompare(String(b.time)));
  }, [rows, q, status]);

  const onStartTriage = (r) => {
    setRows((prev) =>
      prev.map((x) => (x.id === r.id ? { ...x, status: "In Triage" } : x)),
    );
    setSelected({ ...r, status: "In Triage" });
    setOpenTriage(true);
  };

  const onOpenTriage = (r) => {
    setSelected(r);
    setOpenTriage(true);
  };

  const onSaveTriage = (updatedRow) => {
    setRows((prev) =>
      prev.map((x) => (x.id === updatedRow.id ? updatedRow : x)),
    );
    setOpenTriage(false);
  };

  const onMarkReady = (r) => {
    if (!r.vitals) {
      alert("Please record vitals first before marking as Ready.");
      return;
    }
    setRows((prev) =>
      prev.map((x) =>
        x.id === r.id ? { ...x, status: "Ready for Doctor" } : x,
      ),
    );
  };

  const onOpenChart = (r) => {
    // Nurse can open patient chart (view-limited later)
    navigate(`/nurse/patients/${r.patientId}?tab=overview`);
  };

  return (
    <Box className="space-y-4 p-5.5">
      <Box>
        <Typography variant="h6" className="font-bold">
          Queue (Triage)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Start triage, record vitals, and mark patients ready for the doctor.
        </Typography>
      </Box>

      <NurseQueueFilters
        q={q}
        setQ={setQ}
        status={status}
        setStatus={setStatus}
      />

      <NurseQueueTable
        rows={filtered}
        onStartTriage={onStartTriage}
        onOpenTriage={onOpenTriage}
        onMarkReady={onMarkReady}
        onOpenChart={onOpenChart}
      />

      <TriageVitalsDialog
        open={openTriage}
        onClose={() => setOpenTriage(false)}
        row={selected}
        onSave={onSaveTriage}
      />
    </Box>
  );
}
