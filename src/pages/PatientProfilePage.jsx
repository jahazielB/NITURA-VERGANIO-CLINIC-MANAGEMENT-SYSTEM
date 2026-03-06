import { Box, Typography } from "@mui/material";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useParams, data } from "react-router-dom";

import PatientHeaderCard from "../components/PatientHeaderCard";
import PatientTabs from "../components/PatientTabs";

import { supabase } from "../lib/supabaseClient";

export default function PatientProfilePage({}) {
  const [searchParams] = useSearchParams();
  const param = useParams();
  const [tab, setTab] = useState(1); // Visits default

  const [selectedVisitId, setSelectedVisitId] = useState("");
  const [fetchedPatient, setFetchedPatient] = useState(null);
  const tabParam = searchParams.get("tab");

  useEffect(() => {
    if (tabParam === "soap") {
      setTab(4);
    }
    if (tabParam === "prescriptions") {
      setTab(2);
    }
    if (tabParam === "lab") {
      setTab(3);
    }
  }, [tabParam]);

  useEffect(() => {
    const fetchPatientInfo = async () => {
      const { data, error } = await supabase
        .from("patients")
        .select(
          `
  *,
  visits (
    *,
    doctor:user_profiles (
      id,
      full_name
    ),
    vitals(*),
    soap_notes(*),
    lab_requests(
      *,
      lab_result_items(*)
    ),
    prescription_orders(
      *,
      prescription_items(*)
    ),
    billings(
      *,
      billing_items(*),
      payments(*)
    )
  )
`,
        )
        .eq("id", param.id)
        .single();
      if (data) {
        setFetchedPatient(data);
        console.log(data.visits);
      }
    };

    fetchPatientInfo();
  }, []);

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
      <PatientHeaderCard patient={fetchedPatient || null} />

      <PatientTabs
        patient={patient}
        tab={tab}
        setTab={setTab}
        visits={fetchedPatient?.visits}
        prescriptions={fetchedPatient?.visits}
        latestSoap={latestSoap}
        vitalsByVisit={vitalsByVisit}
        selectedVisitId={selectedVisitId}
        onSelectVisit={setSelectedVisitId}
      />
    </Box>
  );
}
