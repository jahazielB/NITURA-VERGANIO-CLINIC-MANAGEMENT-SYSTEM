import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Pagination,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

import CustomSnackbar from "../../../components/modals/CustomSnackBar";
import ViewLabModal from "../../../components/modals/ViewLabModal";
import LabWorklistTable from "../../../components/LabSidebar/LabWorklistTable";
import LabWorklistFilters from "./components/LabWorlistFilters";
import EnterResultsDialog from "../../../components/forms/EnterResultsDialog";
import useDebounce from "../../../hooks/useDebounce";
import {
  deleteLabRequest,
  getLabRequests,
  subscribeToLabRequestChanges,
  updateLabRequest,
} from "../../../services/labRequestService";
import { todayISO } from "../../../components/helpers/labHelpers";
import { getAge } from "../../../components/helpers/dateHelper";

export default function MedTechLaboratoryPage() {
  const PAGE_SIZE = 10;
  const [items, setItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");
  const debouncedQ = useDebounce(q, 400);

  const [openEnter, setOpenEnter] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [selected, setSelected] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const notify = useCallback((message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  }, []);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const { rows, total } = await getLabRequests({
        page,
        limit: PAGE_SIZE,
        search: debouncedQ,
        status,
      });
      setItems(rows);
      setTotalItems(total);
    } catch (error) {
      notify(error?.message || "Failed to fetch lab requests.", "error");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedQ, status, notify]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const fetchRequestsRef = useRef(fetchRequests);
  fetchRequestsRef.current = fetchRequests;

  useEffect(() => {
    const channel = subscribeToLabRequestChanges(() =>
      fetchRequestsRef.current(),
    );
    return () => channel.unsubscribe();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [debouncedQ, status, priority]);

  const filtered = useMemo(() => {
    return items
      .filter((r) => (priority === "All" ? true : r.priority === priority))
      .sort((a, b) =>
        String(b.requestedDate || "").localeCompare(
          String(a.requestedDate || ""),
        ),
      );
  }, [items, priority]);

  const onStart = async (id) => {
    try {
      await updateLabRequest(id, { status: "Processing" });
      setItems((prev) =>
        prev.map((x) => (x.id === id ? { ...x, status: "Processing" } : x)),
      );
      notify("Status updated to Processing.", "success");
    } catch (error) {
      notify(error?.message || "Failed to update status.", "error");
    }
  };

  const onEnterResults = (row) => {
    setSelected(row);
    setOpenEnter(true);
  };

  const onSaveResults = (updatedRow) => {
    setItems((prev) =>
      prev.map((x) => (x.id === updatedRow.id ? updatedRow : x)),
    );
  };

  const onRelease = async (id) => {
    const row = items.find((x) => x.id === id);
    if (!confirm("Release this result?")) return;

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

      await updateLabRequest(id, {
        status: "Released",
        releasedBy: profileId,
        releasedDate: todayISO(),
      });

      setItems((prev) =>
        prev.map((x) => (x.id === id ? { ...x, status: "Released" } : x)),
      );
      notify(`Released ${row?.testType || "request"}.`, "success");
    } catch (error) {
      notify(error?.message || "Failed to release result.", "error");
    }
  };

  const onDelete = (id) => {
    deleteLabRequest(id)
      .then(() => {
        notify("Lab request deleted.");
        if (items.length === 1 && page > 1) setPage(page - 1);
        setItems((prev) => prev.filter((x) => x.id !== id));
      })
      .catch(() => notify("Failed to delete lab request.", "error"));
  };

  const onView = (row) => {
    setSelected(row);
    setOpenView(true);
  };

  return (
    <Box className="space-y-4 p-5.5">
      <Box>
        <Typography variant="h6" className="font-bold">
          Laboratory Worklist
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage lab requests: start processing, enter results, release, and
          keep the worklist synced with live data.
        </Typography>
      </Box>

      <Card className="rounded-2xl shadow">
        <CardContent>
          <LabWorklistFilters
            q={q}
            setQ={setQ}
            status={status}
            setStatus={setStatus}
            priority={priority}
            setPriority={setPriority}
          />
        </CardContent>
      </Card>

      {loading ? (
        <Box className="flex justify-center py-10">
          <CircularProgress />
        </Box>
      ) : (
        <LabWorklistTable
          rows={filtered}
          onView={onView}
          onEnter={(row) => onEnterResults(row)}
          onMarkProcessing={onStart}
          onRelease={onRelease}
          onDelete={onDelete}
          role="medtech"
        />
      )}

      {totalItems > PAGE_SIZE && (
        <Box className="flex justify-end">
          <Pagination
            count={Math.ceil(totalItems / PAGE_SIZE)}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      <EnterResultsDialog
        open={openEnter}
        onClose={() => setOpenEnter(false)}
        item={selected}
        onSave={onSaveResults}
        onNotify={notify}
        patient={{
          name: selected?.patientName || "",
          age: selected?.birthDate ? String(getAge(selected.birthDate)) : "",
          sex: selected?.gender || "",
          date: selected?.requestedDate
            ? new Intl.DateTimeFormat("en-US", {
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
              }).format(new Date(selected.requestedDate))
            : "",
          address: selected?.address || "",
          requestingPhysician: selected?.requestedBy || "",
        }}
      />

      <ViewLabModal
        open={openView}
        onClose={() => setOpenView(false)}
        item={selected}
        visitLabel={selected?.requestedDate || selected?.visitId || ""}
        patient={{
          name: selected?.patientName || "",
          age: selected?.birthDate ? String(getAge(selected.birthDate)) : "",
          sex: selected?.gender || "",
          date: selected?.requestedDate
            ? new Intl.DateTimeFormat("en-US", {
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
              }).format(new Date(selected.requestedDate))
            : "",
          address: selected?.address || "",
          requestingPhysician: selected?.requestedBy || "",
        }}
      />

      <CustomSnackbar
        open={snackbar.open}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Box>
  );
}
