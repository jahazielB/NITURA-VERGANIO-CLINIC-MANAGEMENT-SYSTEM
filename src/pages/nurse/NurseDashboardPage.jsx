import { Box, Typography } from "@mui/material";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import PeopleIcon from "@mui/icons-material/People";
import AccessibilityNewIcon from "@mui/icons-material/AccessibilityNew";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";

import NurseStatCard from "./components/NurseStatCard";
import QueuePreviewTable from "./components/QueuePreviewTable";
import NurseQuickActions from "./components/NurseQuickActions";
import { nurseQueueMock } from "./components/nurseQueueMock";

export default function NurseDashboardPage() {
  const navigate = useNavigate();

  const stats = useMemo(() => {
    return {
      waiting: nurseQueueMock.filter((r) => r.status === "Waiting").length,
      triage: nurseQueueMock.filter((r) => r.status === "In Triage").length,
      ready: nurseQueueMock.filter((r) => r.status === "Ready for Doctor")
        .length,
      urgent: 1, // mock
    };
  }, []);

  return (
    <Box className="space-y-4 p-5.5">
      <Box>
        <Typography variant="h6" className="font-bold">
          Nurse Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage triage, monitor patient flow, and prepare patients for
          consultation.
        </Typography>
      </Box>

      {/* Stat Cards */}
      <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <NurseStatCard
          title="Waiting Patients"
          value={stats.waiting}
          icon={<PeopleIcon />}
          bg="bg-yellow-100"
          color="text-yellow-700"
        />
        <NurseStatCard
          title="In Triage"
          value={stats.triage}
          icon={<AccessibilityNewIcon />}
          bg="bg-blue-100"
          color="text-blue-700"
        />
        <NurseStatCard
          title="Ready for Doctor"
          value={stats.ready}
          icon={<CheckCircleIcon />}
          bg="bg-green-100"
          color="text-green-700"
        />
        <NurseStatCard
          title="Urgent Cases"
          value={stats.urgent}
          icon={<WarningIcon />}
          bg="bg-red-100"
          color="text-red-700"
        />
      </Box>

      {/* Queue Preview */}
      <QueuePreviewTable
        rows={nurseQueueMock.slice(0, 5)}
        onSeeAll={() => navigate("/nurse/queue")}
      />

      {/* Quick Actions */}
      <NurseQuickActions onGoQueue={() => navigate("/nurse/queue")} />
    </Box>
  );
}
