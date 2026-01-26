import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import PrintIcon from "@mui/icons-material/Print";

import PrescriptionFormDialog from "./forms/PrescriptionFormDialog";
import PrescriptionViewModal from "./modals/PrescriptionViewModal";

function latestVisitIdFrom(visits) {
  if (!visits?.length) return "";
  // assumes visits already have date strings; if ISO date, parse works too
  return [...visits].sort((a, b) => new Date(b.date) - new Date(a.date))[0].id;
}

export default function PrescriptionsTab({
  visits = [], // [{id, date}]
  allergyNoted = false,
  allergyDetails = "",
}) {
  const [filter, setFilter] = useState(1); // 0 all, 1 active, 2 past
  const [openForm, setOpenForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [openView, setOpenView] = useState(false);
  const [viewItem, setViewItem] = useState(null);

  const [items, setItems] = useState([
    {
      id: 1,
      visitId: visits[0]?.id || "V3",
      medication: "Amoxicillin 500mg",
      dosage: "500mg capsule",
      frequency: "3x daily",
      duration: "7 days",
      startDate: "2024-04-24",
      status: "Active",
      instructions: "Take after meals",
    },
    {
      id: 2,
      visitId: visits[1]?.id || "V2",
      medication: "Ibuprofen 200mg",
      dosage: "200mg tablet",
      frequency: "As needed",
      duration: "—",
      startDate: "2024-01-15",
      status: "Active",
      instructions: "",
    },
    {
      id: 3,
      visitId: visits[2]?.id || "V1",
      medication: "Metformin 1000mg",
      dosage: "500mg tablet",
      frequency: "2x daily",
      duration: "Chronic",
      startDate: "2023-08-05",
      status: "Active",
      instructions: "",
    },
  ]);

  const latestVisitId = useMemo(() => latestVisitIdFrom(visits), [visits]);

  const activeCount = useMemo(
    () => items.filter((x) => x.status === "Active").length,
    [items],
  );

  const lastPrescribed = useMemo(() => {
    if (!items.length) return "—";
    const sorted = [...items].sort(
      (a, b) => new Date(b.startDate) - new Date(a.startDate),
    );
    return sorted[0]?.startDate || "—";
  }, [items]);

  const filtered = useMemo(() => {
    if (filter === 1) return items.filter((x) => x.status === "Active");
    if (filter === 2) return items.filter((x) => x.status !== "Active");
    return items;
  }, [items, filter]);

  const visitLabel = (visitId) =>
    visits.find((v) => v.id === visitId)?.date || visitId;

  const handleSave = (payload) => {
    setItems((prev) => {
      const exists = prev.some((p) => p.id === payload.id);
      if (exists) return prev.map((p) => (p.id === payload.id ? payload : p));
      return [payload, ...prev];
    });
  };

  const handleStop = (id) => {
    if (!confirm("Stop this prescription?")) return;
    setItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "Stopped" } : p)),
    );
  };

  return (
    <Box className="space-y-4">
      {/* Header */}
      <Box className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Typography variant="h6" className="font-bold">
          {activeCount} Active Prescriptions{" "}
          <span className="font-normal text-slate-500">
            • Last Prescribed: {lastPrescribed}
          </span>
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditItem(null);
            setOpenForm(true);
          }}
        >
          Add Prescription
        </Button>
      </Box>

      {/* Allergy banner */}
      {allergyNoted && (
        <Card className="rounded-2xl shadow">
          <CardContent className="bg-amber-50">
            <Typography className="font-semibold">
              ⚠ Allergy noted: {allergyDetails || "—"}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Filter tabs */}
      <Card className="rounded-2xl shadow">
        <Tabs value={filter} onChange={(_, v) => setFilter(v)}>
          <Tab label="All" />
          <Tab label="Active" />
          <Tab label="Past" />
          <Button
            size="small"
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={() => alert("Print prescription feature coming soon")}
          >
            Print
          </Button>
        </Tabs>
        <Divider />

        <CardContent>
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table size="small" sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow className="bg-slate-100">
                  <TableCell>Medication</TableCell>
                  <TableCell>Dosage</TableCell>
                  <TableCell>Frequency</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell className="font-semibold">
                      {p.medication}
                      <Typography variant="body2" color="text.secondary">
                        Visit: {visitLabel(p.visitId)}
                      </Typography>
                    </TableCell>
                    <TableCell>{p.dosage}</TableCell>
                    <TableCell>{p.frequency}</TableCell>
                    <TableCell>{p.duration}</TableCell>
                    <TableCell>{p.startDate}</TableCell>
                    <TableCell>
                      <Chip
                        label={p.status}
                        size="small"
                        color={p.status === "Active" ? "success" : "default"}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box className="flex justify-end gap-1 flex-wrap">
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<VisibilityIcon />}
                          onClick={() => {
                            setViewItem(p);
                            setOpenView(true);
                          }}
                        >
                          View
                        </Button>

                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<EditIcon />}
                          onClick={() => {
                            setEditItem(p);
                            setOpenForm(true);
                          }}
                        >
                          Edit
                        </Button>

                        {p.status === "Active" && (
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            startIcon={<BlockIcon />}
                            onClick={() => handleStop(p.id)}
                          >
                            Stop
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}

                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No prescriptions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add/Edit dialog */}
      <PrescriptionFormDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSave={handleSave}
        initial={editItem}
        latestVisitId={latestVisitId}
        visits={visits}
      />

      {/* View modal */}
      <PrescriptionViewModal
        open={openView}
        onClose={() => setOpenView(false)}
        item={viewItem}
        visitLabel={viewItem ? visitLabel(viewItem.visitId) : ""}
      />
    </Box>
  );
}
