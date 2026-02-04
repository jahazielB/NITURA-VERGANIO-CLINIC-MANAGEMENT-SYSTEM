import { Box, Typography, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import RxFilters from "./components/RxFilters";
import RxTable from "./components/RxTable";
import { rxMock } from "./components/rxMock";

const todayISO = () => new Date().toISOString().slice(0, 10);

// super simple week filter for mock
const isThisWeek = (isoDateLike) => {
  // expects "YYYY-MM-DD ..." or "YYYY-MM-DD"
  const d = new Date(String(isoDateLike).slice(0, 10));
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay()); // Sunday start
  start.setHours(0, 0, 0, 0);
  return d >= start && d <= now;
};

export default function DoctorPrescriptionsPage() {
  const navigate = useNavigate();

  const [rows] = useState(rxMock);
  const [q, setQ] = useState("");
  const [quickDate, setQuickDate] = useState("today");

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();

    return rows
      .filter((r) => {
        if (quickDate === "all") return true;
        const d = String(r.dateTime).slice(0, 10);
        if (quickDate === "today") return d === todayISO();
        if (quickDate === "thisWeek") return isThisWeek(d);
        return true;
      })
      .filter((r) => {
        if (!qq) return true;
        return (
          (r.id || "").toLowerCase().includes(qq) ||
          (r.patientName || "").toLowerCase().includes(qq) ||
          (r.visitId || "").toLowerCase().includes(qq) ||
          (r.diagnosis || "").toLowerCase().includes(qq) ||
          (r.medsSummary || "").toLowerCase().includes(qq)
        );
      })
      .sort((a, b) => String(b.dateTime).localeCompare(String(a.dateTime)));
  }, [rows, q, quickDate]);

  const onOpenChart = (r) => {
    // optionally jump to prescriptions tab later:
    // /doctor/patients/PT001?tab=prescriptions&visit=V1001
    navigate(
      `/doctor/patients/${r.patientId}?tab=prescriptions&visit=${encodeURIComponent(r.visitId)}`,
    );
  };

  const onView = (r) => alert(`View prescription ${r.id} (mock)`);
  const onPrint = (r) => alert(`Print prescription ${r.id} (mock)`);

  const onNewRx = () => {
    alert("New Prescription (mock) — usually created inside Patient Chart");
  };

  return (
    <Box className="space-y-4 p-5.5">
      <Box className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Box>
          <Typography variant="h6" className="font-bold">
            Prescriptions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and re-open prescriptions across patients.
          </Typography>
        </Box>

        <Button variant="contained" startIcon={<AddIcon />} onClick={onNewRx}>
          New Prescription
        </Button>
      </Box>

      <RxFilters
        q={q}
        setQ={setQ}
        quickDate={quickDate}
        setQuickDate={setQuickDate}
      />
      <RxTable
        rows={filtered}
        onOpenChart={onOpenChart}
        onView={onView}
        onPrint={onPrint}
      />
    </Box>
  );
}
