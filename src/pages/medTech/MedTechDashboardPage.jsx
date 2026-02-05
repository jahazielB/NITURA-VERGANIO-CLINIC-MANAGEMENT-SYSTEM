import { Box, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import ScienceIcon from "@mui/icons-material/Science";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import MedTechStatCard from "./components/MedTechStatCard";
import WorklistPreviewTable from "./components/WorklistPreviewTable";
import ReadyToReleaseCard from "./components/ReadyToReleaseCard";
import MedTechQuickActions from "./components/MedTechQuickActions";
import { medtechWorklistMock } from "./components/medTechMock";

export default function MedTechDashboardPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState(medtechWorklistMock);

  const stats = useMemo(() => {
    const pending = rows.filter((r) => r.status === "Pending").length;
    const processing = rows.filter((r) => r.status === "Processing").length;
    const ready = rows.filter((r) => r.status === "Ready").length;
    const released = rows.filter((r) => r.status === "Released").length;
    return { pending, processing, ready, released };
  }, [rows]);

  const readyList = useMemo(
    () => rows.filter((r) => r.status === "Ready").slice(0, 5),
    [rows],
  );

  const onSeeAll = () => navigate("/medtech/laboratory");
  const onGoWorklist = () => navigate("/medtech/laboratory");

  const onStart = (r) => {
    setRows((prev) =>
      prev.map((x) => (x.id === r.id ? { ...x, status: "Processing" } : x)),
    );
  };

  const onEnter = (r) => {
    alert(`Enter Results for ${r.id} (mock)`);
    setRows((prev) =>
      prev.map((x) => (x.id === r.id ? { ...x, status: "Ready" } : x)),
    );
  };

  const onRelease = (r) => {
    if (!confirm(`Release ${r.id} to doctor/patient chart?`)) return;
    setRows((prev) =>
      prev.map((x) => (x.id === r.id ? { ...x, status: "Released" } : x)),
    );
  };

  return (
    <Box className="space-y-4 p-5.5">
      <Box>
        <Typography variant="h6" className="font-bold">
          MedTech Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track today’s lab workload, enter results, and release completed
          tests.
        </Typography>
      </Box>

      {/* Stat cards */}
      <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MedTechStatCard
          title="Pending Requests"
          value={stats.pending}
          icon={<PendingActionsIcon />}
          iconBg="bg-yellow-100"
          iconColor="text-yellow-700"
        />
        <MedTechStatCard
          title="Processing"
          value={stats.processing}
          icon={<HourglassTopIcon />}
          iconBg="bg-blue-100"
          iconColor="text-blue-700"
        />
        <MedTechStatCard
          title="Ready to Release"
          value={stats.ready}
          icon={<ScienceIcon />}
          iconBg="bg-green-100"
          iconColor="text-green-700"
        />
        <MedTechStatCard
          title="Released Today"
          value={stats.released}
          icon={<CheckCircleIcon />}
          iconBg="bg-slate-200"
          iconColor="text-slate-700"
        />
      </Box>

      {/* Main grid */}
      <Box className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Box className="lg:col-span-2">
          <WorklistPreviewTable
            rows={rows.slice(0, 8)}
            onStart={onStart}
            onEnter={onEnter}
            onRelease={onRelease}
            onSeeAll={onSeeAll}
          />
        </Box>

        <Box className="flex flex-col gap-4">
          <ReadyToReleaseCard rows={readyList} onRelease={onRelease} />
        </Box>

        <Box className="lg:col-span-3">
          <MedTechQuickActions onGoWorklist={onGoWorklist} />
        </Box>
      </Box>
    </Box>
  );
}
