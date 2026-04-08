import { supabase } from "../lib/supabaseClient";
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
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import PrintIcon from "@mui/icons-material/Print";
import DeleteIcon from "@mui/icons-material/Delete";

import PrescriptionFormDialog from "./forms/PrescriptionFormDialog";
import PrescriptionViewModal from "./modals/PrescriptionViewModal";
import PrescriptionCreateModal from "./modals/PrescriptionCreateModal";
import CustomSnackbar from "./modals/CustomSnackBar";
import ConfirmDeleteCancel from "./modals/ConfirmDelete";

import { useSelector, useDispatch } from "react-redux";
import { fetchPatientProfile } from "../store/patientProfileSlice";
import { useParams } from "react-router-dom";

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
  const [deleteItem, setDeleteItem] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "",
  });

  const [openDeleteDialog, setOpenDeleteDialog] = useState({
    open: false,
    loading: false,
  });

  const dispatch = useDispatch();
  const { patientInfo } = useSelector((s) => s.patientProfile);
  const { userName, role, user } = useSelector((u) => u.auth);
  const patientVisits = patientInfo?.visits;
  const prescriptionOrders = patientVisits?.flatMap(
    (p) => p.prescription_orders,
  );

  const params = useParams();

  // useEffect(() => {
  //   console.log("orders: ", prescriptionOrders);
  // }, []);

  const latestVisitId = useMemo(() => latestVisitIdFrom(visits), [visits]);

  const activeCount = useMemo(
    () => prescriptionOrders.filter((x) => x.is_active === true).length,
    [],
  );

  const filtered = useMemo(() => {
    if (filter === 1)
      return prescriptionOrders?.filter((x) => x.is_active === true);
    if (filter === 2)
      return prescriptionOrders?.filter((x) => x.is_active !== true);
    return prescriptionOrders;
  }, [prescriptionOrders, filter]);

  const visitLabel = (visitId) =>
    visits.find((v) => v.id === visitId)?.date || visitId;

  const handleStop = async (id) => {
    try {
      if (!confirm("Stop this prescription?")) return;
      const { data, error } = await supabase
        .from("prescription_orders")
        .update({ is_active: false })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      dispatch(fetchPatientProfile(params.id));
    } catch (e) {
      console.error("error: ", e);
    }
  };
  const handleDeletePrescription = async () => {
    try {
      setOpenDeleteDialog((prev) => ({
        ...prev,
        loading: true,
      }));

      const { error } = await supabase
        .from("prescription_orders")
        .delete()
        .eq("id", deleteItem);
      if (error) throw error;
      setSnackbar({
        open: true,
        message: "Deleted Successfully!",
        severity: "success",
      });
    } catch (e) {
      console.error(e.message);
      setSnackbar({
        open: true,
        message: "error deleting, contact admin",
        severity: "error",
      });
    } finally {
      setOpenDeleteDialog((prev) => ({
        ...prev,
        loading: false,
        open: false,
      }));
      dispatch(fetchPatientProfile(params.id));
    }
  };
  return (
    <Box className="space-y-4">
      {/* Header */}

      <Box className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Typography variant="h6" className="font-bold">
          {activeCount} Active Prescriptions{" "}
          <span className="font-normal text-slate-500">
            • Last Prescribed:{" "}
            {activeCount
              ? new Date(
                  prescriptionOrders?.[0]?.prescribed_at,
                )?.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "No record"}
          </span>
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            if (patientVisits.length === 0)
              return setSnackbar({
                open: true,
                message: "Add a visit first!",
                severity: "warning",
              });

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
                {filtered?.map((p) => {
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
                        {new Date(p?.prescribed_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )}
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
                              setOpenView(true);
                              setEditMode(true);
                              setViewItem(p);
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
                          <IconButton
                            aria-label="delete"
                            color="error"
                            onClick={() => {
                              setOpenDeleteDialog({
                                ...openDeleteDialog,
                                open: true,
                              });
                              setDeleteItem(p.id);

                              console.log(deleteItem);
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
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
      {/* <PrescriptionFormDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSave={handleSave}
        initial={editItem}
        latestVisitId={latestVisitId}
        visits={visits}
      /> */}
      <PrescriptionCreateModal
        open={openForm}
        onClose={() => setOpenForm(false)}
        setSnack={setSnackbar}
      />

      {/* View modal */}
      <PrescriptionViewModal
        open={openView}
        onClose={() => {
          setViewItem(null);
          setOpenView(false);
          setEditItem(null);
          setEditMode(false);
        }}
        item={viewItem}
        visitLabel={viewItem ? visitLabel(viewItem.visitId) : ""}
        editing={editMode}
        setSave={setSaving}
        setSnack={setSnackbar}
        saving={saving}
      />
      <CustomSnackbar
        open={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        severity={snackbar.severity}
      />
      <ConfirmDeleteCancel
        open={openDeleteDialog.open}
        cancel={() => {
          setOpenDeleteDialog({ ...openDeleteDialog, open: false });
          // setVisitId(null);
        }}
        loading={openDeleteDialog.loading}
        handleDelete={() => handleDeletePrescription(deleteItem)}
      />
    </Box>
  );
}
