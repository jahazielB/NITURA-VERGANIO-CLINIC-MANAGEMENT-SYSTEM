import { Box, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

import ScienceIcon from "@mui/icons-material/Science";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import MedTechStatCard from "./components/MedTechStatCard";
import WorklistPreviewTable from "./components/WorklistPreviewTable";
import ReadyToReleaseCard from "./components/ReadyToReleaseCard";
import MedTechQuickActions from "./components/MedTechQuickActions";
import {
  getTodayLabRequests,
  subscribeToLabRequestChanges,
  updateLabRequest,
} from "../../services/labRequestService";
import CustomSnackbar from "../../components/modals/CustomSnackBar";
import { todayISO } from "../../components/helpers/labHelpers";

export default function MedTechDashboardPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const notify = useCallback((message, severity = "success") => {
    setSnack({ open: true, message, severity });
  }, []);
  const fetchRows = useCallback(async () => {
    try {
      setLoading(true);
      const { rows: data } = await getTodayLabRequests();
      setRows(data);
    } catch (error) {
      notify(
        error?.message || "Failed to fetch medtech dashboard data.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const fetchRowsRef = useRef(fetchRows);
  fetchRowsRef.current = fetchRows;

  useEffect(() => {
    const channel = subscribeToLabRequestChanges(() => fetchRowsRef.current());
    return () => channel.unsubscribe();
  }, []);

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

  const goToWorklist = (status) => {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    navigate(`/MedTech/laboratory${query}`);
  };

  const onSeeAll = () => goToWorklist();
  const onGoWorklist = () => goToWorklist();
  const onGoStatus = (status) => goToWorklist(status);

  const onStart = async (r) => {
    try {
      await updateLabRequest(r.id, { status: "Processing" });
      setRows((prev) =>
        prev.map((x) => (x.id === r.id ? { ...x, status: "Processing" } : x)),
      );
      notify(`Started ${r.testType}.`, "success");
    } catch (error) {
      notify(error?.message || "Failed to start request.", "error");
    }
  };

  const onEnter = async (r) => {
    try {
      await updateLabRequest(r.id, { status: "Ready" });
      setRows((prev) =>
        prev.map((x) => (x.id === r.id ? { ...x, status: "Ready" } : x)),
      );
      notify(`Marked ${r.testType} as Ready.`, "success");
    } catch (error) {
      notify(error?.message || "Failed to mark result ready.", "error");
    }
  };

  const onRelease = async (r) => {
    if (!confirm(`Release this result?`)) return;

    try {
      const { data: userData } = await supabase.auth.getUser();
      const authUserId = userData?.user?.id;
      let profileId = null;
      if (authUserId) {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("id")
          .eq("id", authUserId)
          .maybeSingle();
        profileId = profile?.id ?? null;
      }

      await updateLabRequest(r.id, {
        status: "Released",
        releasedBy: profileId,
        releasedDate: todayISO(),
      });

      setRows((prev) =>
        prev.map((x) => (x.id === r.id ? { ...x, status: "Released" } : x)),
      );
      notify(`Released ${r.testType}.`, "success");
    } catch (error) {
      notify(error?.message || "Failed to release result.", "error");
    }
  };

  return (
    <Box className="space-y-4 p-5.5">
      {/* Stat cards */}
      <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MedTechStatCard
          title="Today's Pending Requests"
          value={stats.pending}
          loading={loading}
          icon={<PendingActionsIcon />}
          iconBg="bg-yellow-100"
          iconColor="text-yellow-700"
        />
        <MedTechStatCard
          title="Today's Processing"
          value={stats.processing}
          loading={loading}
          icon={<HourglassTopIcon />}
          iconBg="bg-blue-100"
          iconColor="text-blue-700"
        />
        <MedTechStatCard
          title="Today's Ready to Release"
          value={stats.ready}
          loading={loading}
          icon={<ScienceIcon />}
          iconBg="bg-green-100"
          iconColor="text-green-700"
        />
        <MedTechStatCard
          title="Today's Released"
          value={stats.released}
          loading={loading}
          icon={<CheckCircleIcon />}
          iconBg="bg-slate-200"
          iconColor="text-slate-700"
        />
      </Box>

      {/* Main grid */}
      <Box className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Box className="lg:col-span-2">
          <WorklistPreviewTable
            rows={rows.slice(0, 10)}
            onSeeAll={onSeeAll}
            loading={loading}
          />
        </Box>

        <Box className="flex flex-col gap-4">
          <ReadyToReleaseCard rows={readyList} onRelease={onRelease} />
        </Box>

        <Box className="lg:col-span-3">
          <MedTechQuickActions
            onGoWorklist={onGoWorklist}
            onGoStatus={onGoStatus}
          />
        </Box>
      </Box>

      <CustomSnackbar
        open={snack.open}
        onClose={() => setSnack((prev) => ({ ...prev, open: false }))}
        message={snack.message}
        severity={snack.severity}
      />
    </Box>
  );
}
