import PatientFormDialog from "../../../components/forms/PatientFormDialog";
import CustomSnackbar from "../../../components/modals/CustomSnackBar";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  TableContainer,
  TablePagination,
  CircularProgress,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchPatients } from "../../../store/patientSlice";
import useDebounce from "../../../hooks/useDebounce";
import { upperCaseFirstLetter } from "../../../components/helpers/nameHelper";

export default function NursePatientsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { rows, loading, total } = useSelector((s) => s.patients);

  const [search, setSearch] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [page, setPage] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "",
    message: "",
  });

  const rowsPerPage = 10;
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    dispatch(fetchPatients({ page, rowsPerPage, search: debouncedSearch }));
  }, [dispatch, page, debouncedSearch]);

  const refetchPatients = () => {
    dispatch(fetchPatients({ page, rowsPerPage, search: debouncedSearch }));
    setPage(0);
  };

  const openChart = (p) => {
    navigate(`/nurse/patients/${p.id}?tab=overview`);
  };

  const fullName = (p) => {
    const first = p.first_name || "";
    const middle = p.middle_name ? p.middle_name.charAt(0) + ". " : "";
    const last = p.last_name || "";
    return upperCaseFirstLetter(`${first} ${middle}${last}`.trim());
  };

  return (
    <Box className="space-y-4 p-5.5">
      <Box>
        <Typography variant="h6" className="font-bold">
          Patients
        </Typography>
        <Typography variant="body2" color="text.secondary">
          View patient chart (nurse view) and focus on vitals/visits/labs.
        </Typography>
      </Box>

      <Card className="rounded-2xl shadow">
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                label="Search"
                size="small"
                fullWidth
                placeholder="Name, Patient ID, last visit..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box className="flex justify-end gap-2">
                <TextField
                  label="Note"
                  size="small"
                  value="Nurse view is limited: no SOAP, no prescriptions, no billing."
                  disabled
                  sx={{ minWidth: 300 }}
                />
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
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow">
        <CardContent>
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table size="small" sx={{ minWidth: 1050 }}>
              <TableHead>
                <TableRow className="bg-slate-100">
                  <TableCell>Patient</TableCell>
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
                  rows.map((p) => (
                    <TableRow key={p.id} hover>
                      <TableCell className="font-semibold">
                        {fullName(p)}
                      </TableCell>
                      <TableCell>{p.gender || "—"}</TableCell>
                      <TableCell>{p.contact_number || "—"}</TableCell>
                      <TableCell>{p.birth_date || "—"}</TableCell>
                      <TableCell>
                        {upperCaseFirstLetter(p.address || "") || "—"}
                      </TableCell>
                      <TableCell align="right">
                        <Box className="flex justify-end gap-1 flex-wrap">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<VisibilityIcon />}
                            onClick={() => openChart(p)}
                          >
                            Open Chart
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={() => {
                              setSelectedPatient(p);
                              setOpenForm(true);
                            }}
                          >
                            Edit
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}

                {!loading && rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No patients found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[]}
          />
        </CardContent>
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

      <CustomSnackbar
        open={snackbar.open}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Box>
  );
}
