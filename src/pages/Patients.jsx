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
  IconButton,
  Chip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { useMemo, useState, useEffect } from "react";

import { fetchPatients } from "../store/patientSlice";
import { useDispatch, useSelector } from "react-redux";

const money = (n) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(
    Number(n || 0),
  );

const computeInvoiceTotals = (inv) => {
  const subtotal = (inv?.items || []).reduce(
    (a, it) => a + Number(it.qty || 0) * Number(it.price || 0),
    0,
  );
  const total = Math.max(0, subtotal - Number(inv?.discount || 0));
  const paid = Number(inv?.paid || 0);
  const balance = Math.max(0, total - paid);
  return { subtotal, total, paid, balance };
};

const patientBillingSummary = (patientId, invoices = []) => {
  const invs = invoices.filter(
    (x) => x.patientId === patientId && x.status !== "Voided",
  );

  if (invs.length === 0) {
    return { label: "No Invoice", color: "default", balance: 0 };
  }

  const balance = invs.reduce(
    (sum, inv) => sum + computeInvoiceTotals(inv).balance,
    0,
  );

  if (balance > 0) return { label: "With Balance", color: "warning", balance };
  return { label: "Clear", color: "success", balance: 0 };
};

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
  const dispatch = useDispatch();
  const { rows, loading, error } = useSelector((s) => s.patients);

  useEffect(() => {
    dispatch(fetchPatients());
  }, [dispatch]);

  console.log(rows);

  // ✅ UI-only mock invoices (ties to patient.id)
  const [mockInvoices] = useState([
    {
      id: 1001,
      patientId: 1,
      status: "Partial",
      discount: 0,
      paid: 300,
      items: [
        { id: 1, desc: "Consultation", qty: 1, price: 500 },
        { id: 2, desc: "CBC", qty: 1, price: 250 },
      ],
    },
    {
      id: 1002,
      patientId: 2,
      status: "Paid",
      discount: 0,
      paid: 500,
      items: [{ id: 1, desc: "Consultation", qty: 1, price: 500 }],
    },
    // Try adding no invoice for a patient to see "No Invoice"
  ]);

  const filteredPatients = useMemo(() => {
    const s = search.toLowerCase();
    return patients.filter((p) =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(s),
    );
  }, [patients, search]);

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
                <TableCell>Billing</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.map((patient) => {
                const bill = patientBillingSummary(patient.id, mockInvoices);

                return (
                  <TableRow key={patient.id} hover>
                    <TableCell>
                      {patient.first_name}{" "}
                      {patient.middle_name[0].toUpperCase()}.{" "}
                      {patient.last_name}
                    </TableCell>
                    <TableCell>{patient.gender}</TableCell>
                    <TableCell>{patient.contact_number}</TableCell>
                    <TableCell>{patient.birth_date}</TableCell>

                    <TableCell>
                      <Box className="flex items-center gap-2 flex-wrap">
                        <Chip
                          size="small"
                          label={bill.label}
                          color={bill.color}
                        />
                        {bill.label === "With Balance" && (
                          <Typography variant="caption" color="text.secondary">
                            {money(bill.balance)}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>

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
                );
              })}

              {filteredPatients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
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
