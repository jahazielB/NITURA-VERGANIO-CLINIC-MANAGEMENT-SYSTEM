export const nursePatientsMock = [
  {
    id: "PT001",
    firstName: "Juan",
    lastName: "Dela Cruz",
    age: 33,
    gender: "Male",
    lastVisit: "2026-02-05",
  },
  {
    id: "PT002",
    firstName: "Maria",
    lastName: "Santos",
    age: 28,
    gender: "Female",
    lastVisit: "2026-02-04",
  },
  {
    id: "PT003",
    firstName: "Pedro",
    lastName: "Reyes",
    age: 41,
    gender: "Male",
    lastVisit: "2026-02-03",
  },
];

/* =========================
   src/pages/nurse/patients/NursePatientsPage.jsx
========================= */
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

export default function NursePatientsPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [patients] = useState(nursePatientsMock);

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
            .includes(qq)
        );
      })
      .sort((a, b) => String(b.lastVisit).localeCompare(String(a.lastVisit)));
  }, [patients, q]);

  const openChart = (p, tab = "overview") => {
    // ✅ nurse patient chart + auto-open tab
    // tabs supported for nurse: overview | visits | lab
    navigate(`/nurse/patients/${p.id}?tab=${encodeURIComponent(tab)}`);
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
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Note"
                size="small"
                fullWidth
                value="Nurse view is limited: no SOAP, no prescriptions, no billing."
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
                  <TableCell>Patient ID</TableCell>
                  <TableCell>Age</TableCell>
                  <TableCell>Gender</TableCell>
                  <TableCell>Last Visit</TableCell>
                  <TableCell align="right">Actions</TableCell>
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
                    <TableCell align="right">
                      <Box className="flex justify-end gap-1 flex-wrap">
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => openChart(p, "overview")}
                        >
                          Open Chart
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => openChart(p, "lab")}
                        >
                          Lab Results
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}

                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
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
