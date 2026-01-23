import { Box, Typography } from "@mui/material";
import { useMemo, useState } from "react";

import PatientHeaderCard from "../components/PatientHeaderCard";
import PatientTabs from "../components/PatientTabs";

export default function PatientProfilePage() {
  const [tab, setTab] = useState(1); // Visits default

  const [selectedVisitId, setSelectedVisitId] = useState("");

  const vitalsByVisit = [
    {
      visitId: "V3",
      visitDate: "2026-01-22T10:30",
      temp: 37.8,
      bpS: 120,
      bpD: 80,
      pulse: 86,
      weight: 72,
      spo2: 97,
    },
    {
      visitId: "V2",
      visitDate: "2026-01-10T09:00",
      temp: 37.2,
      bpS: 118,
      bpD: 78,
      pulse: 82,
      weight: 72,
      spo2: 98,
    },
    {
      visitId: "V1",
      visitDate: "2025-12-15T14:15",
      temp: 36.9,
      bpS: 125,
      bpD: 85,
      pulse: 90,
      weight: 73,
      spo2: 97,
    },
  ];

  const patient = useMemo(
    () => ({
      name: "John Doe",
      patientId: "PT00123",
      age: 58,
      gender: "Male",
      contact: "555-123-4567",
      address: "123 Main St, Springfield",
      avatarUrl: "",
    }),
    [],
  );

  const visits = useMemo(
    () => [
      {
        id: 1,
        date: "04/20/2024",
        doctor: "Dr. Smith",
        reason: "Follow-up Checkup",
      },
      { id: 2, date: "03/10/2024", doctor: "Dr. Alex", reason: "Flu Symptoms" },
      {
        id: 3,
        date: "01/15/2024",
        doctor: "Dr. Bea",
        reason: "Annual Physical",
      },
      {
        id: 3,
        date: "01/15/2024",
        doctor: "Dr. Bea",
        reason: "Annual Physical",
      },
      {
        id: 3,
        date: "01/15/2024",
        doctor: "Dr. Bea",
        reason: "Annual Physical",
      },
    ],
    [],
  );

  const prescriptions = useMemo(
    () => [
      "Amoxicillin 500mg, 3x daily",
      "Ibuprofen 200mg, as needed",
      "Lisinopril 10mg, daily",
    ],
    [],
  );

  const latestSoap = useMemo(
    () => ({
      subjective: "Patient reports persistent cough and fatigue.",
      objective: "Mild fever, congested lungs.",
      assessment: "Viral infection.",
      plan: "Increase fluids, rest, prescribed meds.",
    }),
    [],
  );

  return (
    <Box className="space-y-4 p-4">
      <PatientHeaderCard patient={patient} />

      <PatientTabs
        tab={tab}
        setTab={setTab}
        visits={visits}
        prescriptions={prescriptions}
        latestSoap={latestSoap}
        vitalsByVisit={vitalsByVisit}
        selectedVisitId={selectedVisitId}
        onSelectVisit={setSelectedVisitId}
      />
    </Box>
  );
}
