import { Box } from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import ScienceIcon from "@mui/icons-material/Science";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import PersonIcon from "@mui/icons-material/Person";

import { useMemo, useState } from "react";
import DoctorStatCard from "./components/DoctorStatCard";
import DoctorQueueTable from "./components/DoctorQueueTable";
import LabReviewCard from "./components/LabReviewCard";
import DoctorQuickActions from "./components/DoctorQuickActions";
import { mockQueue, mockLabReady } from "./components/doctorMockData";

export default function DoctorDashboardPage() {
  const [queue, setQueue] = useState(mockQueue);
  const [labReady] = useState(mockLabReady);

  const stats = useMemo(() => {
    const waiting = queue.filter((x) => x.status === "Waiting").length;
    const inConsult = queue.filter((x) => x.status === "In Consult").length;
    const done = queue.filter((x) => x.status === "Done").length;
    const labCount = labReady.length;
    return { waiting, inConsult, done, labCount };
  }, [queue, labReady]);

  const onStart = (row) => {
    setQueue((prev) =>
      prev.map((x) => (x.id === row.id ? { ...x, status: "In Consult" } : x)),
    );
    alert(`Started consult for ${row.patient} (mock)`);
  };

  const onDone = (row) => {
    setQueue((prev) =>
      prev.map((x) => (x.id === row.id ? { ...x, status: "Done" } : x)),
    );
    alert(`Marked done: ${row.patient} (mock)`);
  };

  const onOpenChart = (row) => {
    alert(`Open patient chart: ${row.patient} (wire to PatientProfile later)`);
  };

  const onViewLab = (r) => {
    alert(`View lab result for ${r.patient}: ${r.test} (mock)`);
  };

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
            title="Lab Results Ready"
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
              rows={queue}
              onStart={onStart}
              onOpenChart={onOpenChart}
              onDone={onDone}
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
