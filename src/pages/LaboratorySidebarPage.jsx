import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Pagination,
  Typography,
} from "@mui/material";

import LabFilters from "../components/LabSidebar/Labfilters";
import LabWorklistTable from "../components/LabSidebar/LabWorklistTable";

import { enrichLabItems } from "../components/helpers/labWorklistMapper";

// Reuse your existing dialogs (move them to features/labs/dialogs or adjust path)
import EnterResultsDialog from "../components/forms/EnterResultsDialog";
import ViewLabModal from "../components/modals/ViewLabModal";
import CustomSnackbar from "../components/modals/CustomSnackBar";

// Reuse helper
import { todayISO } from "../components/helpers/labHelpers";
import { getAge } from "../components/helpers/dateHelper";
import { getLabRequests, updateLabRequest, deleteLabRequest, subscribeToLabRequestChanges } from "../services/labRequestService";
import useDebounce from "../hooks/useDebounce";

export default function LaboratorySidebarPage({
  visits = [],
  patients = [],
  labItems = [],
}) {
  const PAGE_SIZE = 10;
  const [items, setItems] = useState(labItems.length ? labItems : []);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [statusFilter, setStatusFilter] = useState("All");
  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q, 400);

  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const notify = (message, severity = "success") => setSnack({ open: true, message, severity });

  const [openEnter, setOpenEnter] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [selected, setSelected] = useState(null);

  const enriched = useMemo(
    () => enrichLabItems({ labItems: items, visits, patients }),
    [items, visits, patients],
  );

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const { rows, total } = await getLabRequests({
        page,
        limit: PAGE_SIZE,
        search: debouncedQ,
      });
      setItems(rows);
      setTotalItems(total);
    } catch (error) {
      notify("Failed to fetch lab requests.", "error");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedQ]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    const channel = subscribeToLabRequestChanges(() => fetchRequests());
    return () => channel.unsubscribe();
  }, [fetchRequests]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQ, statusFilter]);
  const filtered = useMemo(() => {
    return enriched
      .filter((x) =>
        statusFilter === "All" ? true : x.status === statusFilter,
      )
      .sort((a, b) =>
        String(b.requestedDate || "").localeCompare(
          String(a.requestedDate || ""),
        ),
      );
  }, [enriched, statusFilter]);

  const updateItem = (updated) => {
    setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
  };

  const markProcessing = (id) => {
    updateLabRequest(id, { status: "Processing" })
      .then(() => {
        notify("Status updated to Processing.");
        setItems((prev) =>
          prev.map((x) => (x.id === id ? { ...x, status: "Processing" } : x)),
        );
      })
      .catch(() => notify("Failed to update status.", "error"));
  };

  const release = (id) => {
    if (!confirm("Release this result?")) return;
    updateLabRequest(id, { status: "Released", releasedBy: "Doctor", releasedDate: todayISO() })
      .then(() => {
        notify("Result released.");
        setItems((prev) =>
          prev.map((x) =>
            x.id === id ? { ...x, status: "Released" } : x,
          ),
        );
      })
      .catch(() => notify("Failed to release result.", "error"));
  };

  const handleDelete = (id) => {
    deleteLabRequest(id)
      .then(() => {
        notify("Lab request deleted.");
        if (items.length === 1 && page > 1) setPage(page - 1);
        setItems((prev) => prev.filter((x) => x.id !== id));
      })
      .catch(() => notify("Failed to delete lab request.", "error"));
  };

  return (
    <Box className="space-y-4 p-5.5">
      <Box>
        <Typography variant="h6" className="font-bold">
          Laboratory
        </Typography>
      </Box>

      <Card className="rounded-2xl shadow">
        <CardContent>
          <LabFilters
            q={q}
            onQChange={setQ}
            status={statusFilter}
            onStatusChange={setStatusFilter}
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
          showPatientColumn
        onView={(row) => {
          setSelected(row);
          setOpenView(true);
        }}
        onEnter={(row) => {
          setSelected(row);
          setOpenEnter(true);
        }}
        onMarkProcessing={markProcessing}
        onRelease={release}
        onDelete={handleDelete}
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
        onSave={(updated) => updateItem(updated)}
      />

      <ViewLabModal
        open={openView}
        onClose={() => setOpenView(false)}
        item={selected}
        visitLabel={selected?.visitLabel || selected?.visitId || ""}
        patient={{
          name: selected?.patientName || "",
          age: selected?.birthDate ? String(getAge(selected.birthDate)) : "",
          sex: selected?.gender || "",
          date:
            selected?.requestedDate
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
        open={snack.open}
        onClose={() => setSnack((prev) => ({ ...prev, open: false }))}
        message={snack.message}
        severity={snack.severity}
      />
    </Box>
  );
}
