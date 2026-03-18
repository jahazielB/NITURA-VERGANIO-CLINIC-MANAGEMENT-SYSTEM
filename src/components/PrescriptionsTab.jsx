import { useEffect, useMemo, useState } from "react";
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

import { useSelector } from "react-redux";

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

  const { patientInfo } = useSelector((s) => s.patientProfile);
  const { userName, role, user } = useSelector((u) => u.auth);
  const patientVisits = patientInfo?.visits;
  const prescriptionOrders = patientVisits?.flatMap(
    (p) => p.prescription_orders,
  );

  useEffect(() => {
    console.log("orders: ", prescriptionOrders);
  }, []);

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
        <Box className="flex items-center justify-between px-2">
          <Tabs value={filter} onChange={(_, v) => setFilter(v)}>
            <Tab label="All" />
            <Tab label="Active" />
            <Tab label="Past" />
          </Tabs>
        </Box>
        <Divider />

        <CardContent>
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table size="small" sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow className="bg-slate-100">
                  <TableCell>Visit</TableCell>
                  <TableCell>Prescribed</TableCell>
                  <TableCell>Prescribed by</TableCell>
                  <TableCell>Medications</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {prescriptionOrders?.map((p) => {
                  const medsCount = p?.prescription_items.length || 1; // future-proof
                  const firstMed =
                    p.prescription_items?.[0]?.medication || "No Medication";
                  const prescribedBy = p.doctor;
                  return (
                    <TableRow key={p.id} hover>
                      {/* Visit */}
                      <TableCell>
                        <Typography className="font-semibold">
                          {visitLabel(p.visitId)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        {new Date(p?.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell>{`Dr. ${prescribedBy?.full_name} `}</TableCell>

                      {/* Medications summary */}
                      <TableCell>
                        <Typography className="font-semibold">
                          {firstMed}
                        </Typography>

                        {medsCount > 1 && (
                          <Typography variant="body2" color="text.secondary">
                            +{medsCount - 1} more
                          </Typography>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Chip
                          label={p?.is_active === true ? "Active" : "Inactive"}
                          size="small"
                          color={p?.is_active === true ? "success" : "default"}
                        />
                      </TableCell>

                      {/* Actions */}
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
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<PrintIcon />}
                            onClick={() =>
                              alert("Print prescription feature coming soon")
                            }
                          >
                            Print
                          </Button>

                          {p?.is_active === true && (
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
                  );
                })}

                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
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
