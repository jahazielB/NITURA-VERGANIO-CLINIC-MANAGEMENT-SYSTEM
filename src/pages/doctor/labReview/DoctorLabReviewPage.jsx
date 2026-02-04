import { Box, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import LabReviewFilters from "./components/LabReviewFilters";
import LabReviewTable from "./components/LabReviewTable";
import ViewLabModal from "../../../components/modals/ViewLabModal";

import { labReviewMock } from "./components/labReviewMock";
import { todayISO } from "../../../components/helpers/billingHelpers";

const isThisWeek = (iso) => {
  const d = new Date(String(iso).slice(0, 10));
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  start.setHours(0, 0, 0, 0);
  return d >= start && d <= now;
};

export default function DoctorLabReviewPage() {
  const navigate = useNavigate();

  const [rows, setRows] = useState(labReviewMock);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("Ready"); // doctor focus
  const [quickDate, setQuickDate] = useState("today");

  const [openView, setOpenView] = useState(false);
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();

    return rows
      .filter((r) => (status === "All" ? true : r.status === status))
      .filter((r) => {
        if (quickDate === "all") return true;
        const d = String(r.dateReleased).slice(0, 10);
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
          (r.testType || "").toLowerCase().includes(qq)
        );
      })
      .sort((a, b) =>
        String(b.dateReleased).localeCompare(String(a.dateReleased)),
      );
  }, [rows, q, status, quickDate]);

  const onView = (r) => {
    setSelected(r);
    setOpenView(true);
    console.log("clicked");
  };

  const onOpenChart = (r) => {
    // Optional: jump to lab results tab later
    navigate(
      `/doctor/patients/${r.patientId}?tab=lab&visit=${encodeURIComponent(r.visitId)}`,
    );
  };

  const onMarkReviewed = (r) => {
    setRows((prev) =>
      prev.map((x) => (x.id === r.id ? { ...x, status: "Reviewed" } : x)),
    );
  };

  return (
    <Box className="space-y-4 p-5.5">
      <Box>
        <Typography variant="h6" className="font-bold">
          Lab Review
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Review released lab results and mark them as reviewed.
        </Typography>
      </Box>

      <LabReviewFilters
        q={q}
        setQ={setQ}
        status={status}
        setStatus={setStatus}
        quickDate={quickDate}
        setQuickDate={setQuickDate}
      />

      <LabReviewTable
        rows={filtered}
        onOpenChart={onOpenChart}
        onView={onView}
        onMarkReviewed={onMarkReviewed}
      />

      <ViewLabModal
        open={openView}
        onClose={() => setOpenView(false)}
        visitLabel=""
        item={selected}
      />
    </Box>
  );
}
