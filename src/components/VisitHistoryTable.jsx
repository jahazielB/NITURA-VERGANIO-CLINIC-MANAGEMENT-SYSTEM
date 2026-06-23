import { supabase } from "../lib/supabaseClient";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  TablePagination,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";

import { useState } from "react";
import { useParams } from "react-router-dom";

import VisitDetailsModal from "./modals/VisitDetailsModal";
import CustomSnackbar from "./modals/CustomSnackBar";
import ConfirmDeleteCancel from "./modals/ConfirmDelete";

import { useSelector, useDispatch } from "react-redux";
import { fetchPatientProfile } from "../store/patientProfileSlice";

export default function VisitHistoryTable({}) {
  const [open, setOpen] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState({
    open: false,
    loading: false,
  });
  const [page, setPage] = useState(0);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [visitId, setVisitId] = useState(null);
  const [mode, setMode] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "",
    message: "",
  });

  const params = useParams();
  const { patientInfo } = useSelector((s) => s.patientProfile);
  const { role } = useSelector((s) => s.auth);
  const visits = patientInfo?.visits;
  const dispatch = useDispatch();
  const rowsPerPage = 4;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const paginatedRows = visits?.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const handleViewButton = (row) => {
    setSelectedVisit([row]);
  };

  const handleDeleteVisit = async (id) => {
    try {
      setOpenDeleteDialog({ ...openDeleteDialog, loading: true });
      const { error } = await supabase.from("visits").delete().eq("id", id);

      if (error) throw error;
      setSnackbar({
        ...snackbar,
        open: true,
        severity: "success",
        message: "Visit Deleted Successfully",
      });
      dispatch(fetchPatientProfile(params.id));
      setOpenDeleteDialog({ ...openDeleteDialog, loading: false, open: false });
    } catch (err) {
      console.error("Delete visit failed:", err.message);
      setSnackbar({
        ...snackbar,
        open: true,
        severity: "error",
        message: "Delete Visit Failed",
      });
      setOpenDeleteDialog({ ...openDeleteDialog, loading: false, open: false });
    }
  };

  return (
    <Card className="rounded-2xl shadow-2xl">
      <CardContent>
        <Typography className="font-semibold mb-3">Visit History</Typography>

        <TableContainer sx={{ overflowX: "auto" }}>
          <Table size="small" sx={{ minWidth: 720 }}>
            <TableHead>
              <TableRow className="bg-slate-100">
                <TableCell>Date</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Allergy Noted</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedRows?.map((r) => {
                const doctor = r.doctor;
                return (
                  <TableRow key={r.id} hover>
                    <TableCell>
                      {new Date(r.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell>{doctor?.full_name}</TableCell>
                    <TableCell>{r.chief_complaint}</TableCell>
                    <TableCell>
                      {r.allergies === null ? "None" : r.allergies}
                    </TableCell>
                    <TableCell align="right">
                      <Box className="flex justify-end gap-1">
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<VisibilityIcon />}
                          onClick={() => {
                            handleViewButton(r);
                            setOpen(true);
                            setMode("view");
                          }}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<EditIcon />}
                          disabled={role === "MedTech"}
                          onClick={() => {
                            if (role === "MedTech") return;
                            handleViewButton(r);
                            setOpen(true);
                            setMode("edit");
                          }}
                        >
                          Edit
                        </Button>
                        <Tooltip title="Delete">
                          <IconButton
                            aria-label="delete"
                            color="error"
                            disabled={role === "MedTech"}
                            onClick={() => {
                              if (role === "MedTech") return;
                              setOpenDeleteDialog({
                                ...openDeleteDialog,
                                open: true,
                              });
                              setVisitId(r.id);
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}

              {visits?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No visits found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {visits?.length > rowsPerPage && (
          <TablePagination
            component="div"
            count={visits?.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[]}
          />
        )}

        <VisitDetailsModal
          open={open}
          onClose={() => {
            setSelectedVisit(null);
            setOpen(false);
            setMode(null);
          }}
          mode={mode}
          records={selectedVisit}
          setSnack={setSnackbar}
        />
      </CardContent>
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
          setVisitId(null);
        }}
        loading={openDeleteDialog.loading}
        handleDelete={() => handleDeleteVisit(visitId)}
      />
    </Card>
  );
}
