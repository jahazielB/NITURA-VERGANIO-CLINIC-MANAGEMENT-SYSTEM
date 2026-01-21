import AdminLayout from "../layout/AdminLayout";
import PatientFormDialog from "../components/PatientFormDialog";
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
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { useState } from "react";

export default function Patients() {
  const [search, setSearch] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState([
    {
      id: 1,
      firstName: "Juan",
      lastName: "Dela Cruz",
      gender: "Male",
      contact: "09123456789",
    },
    {
      id: 2,
      firstName: "Maria",
      lastName: "Santos",
      gender: "Female",
      contact: "09987654321",
    },
  ]);
  const filteredPatients = patients.filter((p) =>
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase()),
  );
  const handleSave = (patient) => {
    if (patient.id) {
      setPatients((prev) =>
        prev.map((p) => (p.id === patient.id ? patient : p)),
      );
    } else {
      setPatients((prev) => [...prev, { ...patient, id: Date.now() }]);
    }
  };

  const handleDelete = (id) => {
    if (confirm("Delete this patient?")) {
      setPatients((prev) => prev.filter((p) => p.id !== id));
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
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>
                    {patient.firstName} {patient.lastName}
                  </TableCell>
                  <TableCell>{patient.gender}</TableCell>
                  <TableCell>{patient.contact}</TableCell>
                  <TableCell>01/01/01</TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => {
                        setSelectedPatient(patient);
                        setOpenForm(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(patient.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              {filteredPatients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No patients found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <PatientFormDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSave={handleSave}
        patient={selectedPatient}
      />
    </Box>
  );
}
