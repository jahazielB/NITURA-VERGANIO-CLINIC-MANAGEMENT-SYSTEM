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
} from "@mui/material";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doctorPatientsMock } from "./doctorPatientsMock";

export default function DoctorPatientsPage() {
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [patients] = useState(doctorPatientsMock);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();

    return patients
      .filter((p) => {
        if (!qq) return true;
        const name = `${p.lastName} ${p.firstName}`.toLowerCase();
        return (
          name.includes(qq) ||
          String(p.id || "")
            .toLowerCase()
            .includes(qq) ||
          String(p.lastVisit || "")
            .toLowerCase()
            .includes(qq) ||
          String(p.lastReason || "")
            .toLowerCase()
            .includes(qq)
        );
      })
      .sort((a, b) => String(b.lastVisit).localeCompare(String(a.lastVisit)));
  }, [patients, q]);

  const openChart = (p) => {
    // ✅ doctor route (adjust if your route differs)
    navigate(`/doctor/patients/${p.id}`);
  };

  return (
    <Box className="space-y-4 p-5.5">
      {/* Header */}
      <Box>
        <Typography variant="h6" className="font-bold">
          Patients
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Search patients and open their medical chart.
        </Typography>
      </Box>

      {/* Filters */}
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

      {/* Table */}
      <Card className="rounded-2xl shadow">
        <CardContent>
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table size="small" sx={{ minWidth: 950 }}>
              <TableHead>
                <TableRow className="bg-slate-100">
                  <TableCell>Patient</TableCell>
                  <TableCell>Patient ID</TableCell>
                  <TableCell>Age</TableCell>
                  <TableCell>Gender</TableCell>
                  <TableCell>Last Visit</TableCell>
                  <TableCell>Last Reason</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell className="font-semibold">
                      {p.lastName}, {p.firstName}
                    </TableCell>
                    <TableCell>{p.id}</TableCell>
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

                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No patients found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
