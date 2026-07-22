import PatientFormDialog from "../components/forms/PatientFormDialog";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  CircularProgress,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ConfirmDeleteCancel from "../components/modals/ConfirmDelete";
import CustomSnackbar from "../components/modals/CustomSnackBar";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deletePatient, fetchPatients } from "../store/patientSlice";

import useDebounce from "../hooks/useDebounce";
import { upperCaseFirstLetter } from "../components/helpers/nameHelper";

export default function Patients() {
  const [search, setSearch] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [page, setPage] = useState(0);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "",
    message: "",
  });

  const rowsPerPage = 7;
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { rows, loading, error, total } = useSelector((s) => s.patients);

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    dispatch(fetchPatients({ page, rowsPerPage, search: debouncedSearch }));
  }, [dispatch, page, debouncedSearch]);

  const refetchPatients = () => {
    dispatch(fetchPatients({ page, rowsPerPage, search: debouncedSearch }));
    setPage(0);
  };

  const handleDelete = async () => {
    try {
      await dispatch(deletePatient(selectedPatient)).unwrap();
      setSnackbar({
        ...snackbar,
        open: true,
        severity: "success",
        message: "Patient Deleted Successfully!",
      });
      dispatch(fetchPatients({ page, rowsPerPage, search: debouncedSearch }));
      setOpenDeleteDialog(false);
      setSelectedPatient(null);
      setPage(0);
    } catch (e) {
      setSnackbar({ ...snackbar, open: true, severity: "error", message: e });
    }
  };

  return (
    <Box className="p-4">
      <Card className="rounded-2xl shadow-2xl">
        <CardContent>
          {/* Header */}
          <Box className="flex justify-between items-center mb-4">
            <Typography variant="h6">Patient Records</Typography>
            <Button
              variant="contained"
              onClick={() => {
                setSelectedPatient(null);
                setOpenForm(true);
              }}
            >
              Add Patient
            </Button>
          </Box>

          {/* Search */}
          <TextField
            placeholder="Search patient..."
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4"
          />

          {/* Table */}
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Birthday</TableCell>
                <TableCell>Address</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Box className="flex items-center justify-center py-10">
                      <CircularProgress />
                    </Box>
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                rows.map((patient) => {
                  const fullName =
                    patient.first_name +
                    " " +
                    patient.middle_name.charAt(0) +
                    ". " +
                    patient.last_name;
                  const address = patient.address;

                  return (
                    <TableRow key={patient.id} hover>
                      <TableCell>{upperCaseFirstLetter(fullName)}</TableCell>
                      <TableCell>{patient.gender}</TableCell>
                      <TableCell>{`${patient.contact_number || "N/A"} `}</TableCell>
                      <TableCell>{patient.birth_date}</TableCell>
                      <TableCell>{upperCaseFirstLetter(address)}</TableCell>

                      <TableCell align="right">
                        <Box className="flex justify-end gap-1 flex-wrap">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<VisibilityIcon />}
                            disabled={!patient?.id}
                            onClick={() => navigate(`${patient.id}`)}
                          >
                            Open Chart
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={() => {
                              setSelectedPatient(patient);
                              setOpenForm(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => {
                              setOpenDeleteDialog(true);
                              setSelectedPatient(patient.id);
                            }}
                          >
                            Delete
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}

              {!loading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No patients found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <TablePagination
          component="div"
          count={total} // use total from supabase
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[]}
        />
      </Card>

      <PatientFormDialog
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setSelectedPatient(null);
        }}
        patient={selectedPatient}
        onSaved={refetchPatients}
      />
      <ConfirmDeleteCancel
        open={openDeleteDialog}
        cancel={() => setOpenDeleteDialog(false)}
        loading={loading}
        handleDelete={() => handleDelete()}
      />
      <CustomSnackbar
        open={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Box>
  );
}
