import { Box, Typography } from "@mui/material";
import { useMemo, useState } from "react";

import LabWorklistFilters from "./components/LabWorlistFilters";
import LabWorklistTable from "./components/LabWorklistTable";
import EnterResultsDialog from "./components/EnterResultsDialog";
import { labWorklistMock } from "./components/labWorklistMock";
import { isToday } from "./components/LabWorklistHelpers";

export default function MedTechLaboratoryPage() {
  const [rows, setRows] = useState(labWorklistMock);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");
  const [quickDate, setQuickDate] = useState("today"); // medtech focus

  const [openEnter, setOpenEnter] = useState(false);
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();

    return rows
      .filter((r) => (status === "All" ? true : r.status === status))
      .filter((r) => (priority === "All" ? true : r.priority === priority))
      .filter((r) => (quickDate === "today" ? isToday(r.dateRequested) : true))
      .filter((r) => {
        if (!qq) return true;
        return (
          String(r.id).toLowerCase().includes(qq) ||
          String(r.patientName).toLowerCase().includes(qq) ||
          String(r.testType).toLowerCase().includes(qq) ||
          String(r.requestedBy).toLowerCase().includes(qq) ||
          String(r.dateRequested).toLowerCase().includes(qq)
        );
      })
      .sort((a, b) =>
        String(b.dateRequested).localeCompare(String(a.dateRequested)),
      );
  }, [rows, q, status, priority, quickDate]);

  const onStart = (r) => {
    setRows((prev) =>
      prev.map((x) => (x.id === r.id ? { ...x, status: "Processing" } : x)),
    );
  };

  const onEnterResults = (r) => {
    setSelected(r);
    setOpenEnter(true);
  };

  const onSaveResults = (updatedRow) => {
    setRows((prev) =>
      prev.map((x) => (x.id === updatedRow.id ? updatedRow : x)),
    );
    setOpenEnter(false);
  };

  const onRelease = (r) => {
    if (!confirm(`Release ${r.id} to doctor/patient chart?`)) return;

    // ✅ only Ready -> Released
    setRows((prev) =>
      prev.map((x) =>
        x.id === r.id
          ? {
              ...x,
              status: "Released",
              releasedBy: "MedTech (Mock)",
              dateReleased: new Date()
                .toISOString()
                .slice(0, 16)
                .replace("T", " "),
            }
          : x,
      ),
    );
  };

  const onView = (r) => {
    alert(
      `View ${r.id}\n\nPatient: ${r.patientName}\nTest: ${r.testType}\nStatus: ${r.status}\nSummary: ${
        r.results?.summary || "—"
      }`,
    );
  };

  return (
    <Box className="space-y-4 p-5.5">
      <Box>
        <Typography variant="h6" className="font-bold">
          Laboratory Worklist
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage lab requests: start processing, enter results, and release
          completed tests.
        </Typography>
      </Box>

      <LabWorklistFilters
        q={q}
        setQ={setQ}
        status={status}
        setStatus={setStatus}
        priority={priority}
        setPriority={setPriority}
        quickDate={quickDate}
        setQuickDate={setQuickDate}
      />

      <LabWorklistTable
        rows={filtered}
        onStart={onStart}
        onEnterResults={onEnterResults}
        onRelease={onRelease}
        onView={onView}
      />

      <EnterResultsDialog
        open={openEnter}
        onClose={() => setOpenEnter(false)}
        row={selected}
        onSave={onSaveResults}
      />
    </Box>
  );
}
