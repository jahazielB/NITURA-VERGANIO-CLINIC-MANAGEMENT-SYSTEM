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
import { medtechPatientsMock } from "./components/medTechPatientsMock";

export default function MedTechPatientsPage() {
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [patients] = useState(medtechPatientsMock);

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
          String(p.lastLab || "")
            .toLowerCase()
            .includes(qq) ||
          String(p.lastTest || "")
            .toLowerCase()
            .includes(qq)
        );
      })
      .sort((a, b) => String(b.lastLab).localeCompare(String(a.lastLab)));
  }, [patients, q]);

  const openLabChart = (p) => {
    // ✅ route to patient profile (MedTech side) + auto-open Lab Results tab
    // Your PatientTabs: Lab Results index = 3, so we send tab=lab
    navigate(`/medtech/patients/${p.id}?tab=lab`);
  };

  return (
    <Box className="space-y-4 p-5.5">
      {/* Header */}
      <Box>
        <Typography variant="h6" className="font-bold">
          Patients (Lab View)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Search patients and view their lab results history (view-only).
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
                placeholder="Name, Patient ID, last lab date, test type..."
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
                  <TableCell>Last Lab</TableCell>
                  <TableCell>Last Test</TableCell>
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
                    <TableCell>{p.lastLab}</TableCell>
                    <TableCell>{p.lastTest}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => openLabChart(p)}
                      >
                        View Lab Results
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
