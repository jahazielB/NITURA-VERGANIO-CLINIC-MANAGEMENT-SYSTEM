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
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useDebounce from "../../../hooks/useDebounce";
import { getPatientsPage } from "../../../services/patientService";

const ROWS_PER_PAGE = 10;

function getAge(birthDate) {
  if (!birthDate) return "";
  const dob = new Date(birthDate);
  if (Number.isNaN(dob.getTime())) return "";
  const diff = Date.now() - dob.getTime();
  return Math.max(0, Math.floor(diff / 31557600000));
}

function formatPatientName(patient) {
  const cap = (value) => {
    const text = (value ?? "").trim();
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  const first = cap(patient.first_name);
  const middle = cap(patient.middle_name);
  const last = cap(patient.last_name);
  const middleInitial = middle ? `${middle.charAt(0)}.` : "";

  return [first, middleInitial, last].filter(Boolean).join(" ");
}

function formatDisplayDate(value) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function MedTechPatientsPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const debouncedQ = useDebounce(q.trim(), 400);

  useEffect(() => {
    setPage(0);
  }, [q]);

  useEffect(() => {
    let active = true;

    const fetchPatients = async () => {
      try {
        setLoading(true);
        const { rows, total: count } = await getPatientsPage({
          page: page + 1,
          limit: ROWS_PER_PAGE,
          search: debouncedQ,
        });

        if (!active) return;
        setPatients(rows);
        setTotal(count);
      } catch {
        if (active) {
          setPatients([]);
          setTotal(0);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchPatients();

    return () => {
      active = false;
    };
  }, [page, debouncedQ]);

  const openLabChart = (patient) => {
    navigate(`/medtech/patients/${patient.id}?tab=lab`);
  };

  return (
    <Box className="space-y-4 p-5.5">
      <Box>
        <Typography variant="h6" className="font-bold">
          Patients (Lab View)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Search patients and view their lab results history (view-only).
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
                placeholder="Name or Patient ID"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Note"
                size="small"
                fullWidth
                value="This is view-only. To add/edit results, use Laboratory Worklist."
                disabled
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow">
        <CardContent>
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table size="small" sx={{ minWidth: 950 }}>
              <TableHead>
                <TableRow className="bg-slate-100">
                  <TableCell>Patient</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Age</TableCell>
                  <TableCell>Gender</TableCell>
                  <TableCell>Last Lab</TableCell>
                  <TableCell>Last Test</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Box className="flex items-center justify-center py-10">
                        <CircularProgress />
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  patients.map((patient) => (
                    <TableRow key={patient.id} hover>
                      <TableCell className="font-semibold">
                        {formatPatientName(patient)}
                      </TableCell>
                      <TableCell>{patient.address || "N/A"}</TableCell>
                      <TableCell>{getAge(patient.birth_date) || "N/A"}</TableCell>
                      <TableCell>{patient.gender || "N/A"}</TableCell>
                      <TableCell>{formatDisplayDate(patient.lastLabDate)}</TableCell>
                      <TableCell>{patient.lastLabTest || "N/A"}</TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => openLabChart(patient)}
                        >
                          View Lab Results
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}

                {!loading && patients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No patients found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box className="flex justify-end">
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(_, value) => setPage(value)}
              rowsPerPage={ROWS_PER_PAGE}
              rowsPerPageOptions={[]}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
