import {
  Box,
  CircularProgress,
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
  Pagination,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase";

function computeAge(birthDate) {
  if (!birthDate) return "—";
  const today = new Date();
  const bd = new Date(birthDate);
  let age = today.getFullYear() - bd.getFullYear();
  const m = today.getMonth() - bd.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;
  return age;
}

const PATIENT_SELECT = `
  id,
  first_name,
  middle_name,
  last_name,
  suffix,
  gender,
  birth_date,
  contact_number,
  address,
  visits ( id, created_at, chief_complaint, visit_type )
`;

function mapPatient(p) {
  const visits = p.visits || [];
  const last = visits.length
    ? visits.reduce((a, b) =>
        new Date(a.created_at) > new Date(b.created_at) ? a : b,
      )
    : null;
  const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
  const middleInitial = p.middle_name ? cap(p.middle_name).charAt(0) + "." : "";
  return {
    id: p.id,
    firstName: cap(p.first_name),
    lastName: cap(p.last_name),
    name: `${cap(p.first_name)} ${middleInitial} ${cap(p.last_name)}`.trim().replace(/\s+/g, " "),
    address: p.address || "—",
    age: computeAge(p.birth_date),
    gender: p.gender || "—",
    lastVisit: last
      ? new Date(last.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "—",
    lastReason: last?.chief_complaint || "—",
    _raw: p,
  };
}

export default function DoctorPatientsPage() {
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const rowsPerPage = 10;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    let cancelled = false;

    const fetchPatients = async () => {
      const qq = debouncedQ.trim();
      let query = supabase
        .from("patients")
        .select(PATIENT_SELECT, { count: "exact", head: false })
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .range((page - 1) * rowsPerPage, page * rowsPerPage - 1);

      if (qq) {
        const pattern = `%${qq}%`;
        query = query.or(
          `first_name.ilike.${pattern},middle_name.ilike.${pattern},last_name.ilike.${pattern}`,
        );
      }

      const { data, error, count } = await query;

      if (!cancelled) {
        if (!error) {
          setPatients((data || []).map(mapPatient));
          setTotalCount(count ?? 0);
        }
        setLoading(false);
      }
    };

    fetchPatients();
    return () => { cancelled = true; };
  }, [debouncedQ, page]);

  const totalPages = Math.ceil(totalCount / rowsPerPage);

  useEffect(() => { setPage(1); }, [debouncedQ]);

  const openChart = (p) => {
    navigate(`/doctor/patients/${p.id}`);
  };

  if (loading) {
    return (
      <Box className="flex min-h-screen bg-slate-100 justify-center items-center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="space-y-4 p-5.5">
      <Box>
        <Typography variant="h6" className="font-bold">
          Patients
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Search patients and open their medical chart.
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
                placeholder="Name, Patient ID, last visit, reason..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Hint"
                size="small"
                fullWidth
                value="Tip: Click Open Chart to start SOAP / Prescriptions / Lab Review"
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
                  <TableCell>Last Visit</TableCell>
                  <TableCell>Last Reason</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {patients.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell className="font-semibold">{p.name}</TableCell>
                    <TableCell>{p.address}</TableCell>
                    <TableCell>{p.age}</TableCell>
                    <TableCell>{p.gender}</TableCell>
                    <TableCell>{p.lastVisit}</TableCell>
                    <TableCell>{p.lastReason}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => openChart(p)}
                      >
                        Open Chart
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {totalCount === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No patients found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <Box className="mt-4 flex justify-center">
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
