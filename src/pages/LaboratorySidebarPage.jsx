import { useEffect, useMemo, useState } from "react";
import { Box, Card, CardContent, Pagination, Typography } from "@mui/material";

import LabFilters from "../components/LabSidebar/Labfilters";
import LabWorklistTable from "../components/LabSidebar/LabWorklistTable";

import { enrichLabItems } from "../components/helpers/labWorklistMapper";

// Reuse your existing dialogs (move them to features/labs/dialogs or adjust path)
import EnterResultsDialog from "../components/forms/EnterResultsDialog";

// Reuse helper
import { todayISO } from "../components/helpers/labHelpers";
import { getLabRequests } from "../services/labRequestService";

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

  const [openEnter, setOpenEnter] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [selected, setSelected] = useState(null);

  const enriched = useMemo(
    () => enrichLabItems({ labItems: items, visits, patients }),
    [items, visits, patients],
  );

  useEffect(() => {
    let mounted = true;

    const fetchRequests = async () => {
      try {
        setLoading(true);
        const { rows, total } = await getLabRequests({
          page,
          limit: PAGE_SIZE,
        });
        if (mounted) {
          setItems(rows);
          setTotalItems(total);
        }
      } catch (error) {
        console.error("Failed to fetch lab requests:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchRequests();

    return () => {
      mounted = false;
    };
  }, [page]);

  useEffect(() => {
    setPage(1);
  }, [q, statusFilter]);
  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return enriched
      .filter((x) =>
        statusFilter === "All" ? true : x.status === statusFilter,
      )
      .filter((x) => {
        if (!qq) return true;
        return (
          (x.patientName || "").toLowerCase().includes(qq) ||
          (x.testType || "").toLowerCase().includes(qq) ||
          (x.requestedBy || "").toLowerCase().includes(qq) ||
          (x.requestedDate || "").includes(qq)
        );
      })
      .sort((a, b) =>
        String(b.requestedDate || "").localeCompare(
          String(a.requestedDate || ""),
        ),
      );
  }, [enriched, statusFilter, q]);

  const updateItem = (updated) => {
    setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
  };

  const markProcessing = (id) => {
    setItems((prev) =>
      prev.map((x) => (x.id === id ? { ...x, status: "Processing" } : x)),
    );
  };

  const release = (id) => {
    if (!confirm("Release this result?")) return;
    setItems((prev) =>
      prev.map((x) =>
        x.id === id
          ? {
              ...x,
              status: "Released",
              releasedBy: "Doctor",
              releasedDate: todayISO(),
            }
          : x,
      ),
    );
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

      <LabWorklistTable
        rows={filtered}
        loading={loading}
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
        onPrint={() => alert("Print lab result coming soon")}
      />

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
    </Box>
  );
}
