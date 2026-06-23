import { Box, Typography } from "@mui/material";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useParams, data } from "react-router-dom";

import PatientHeaderCard from "../components/PatientHeaderCard";
import PatientTabs from "../components/PatientTabs";

import { fetchPatientProfile } from "../store/patientProfileSlice";
import { useDispatch, useSelector } from "react-redux";
import { getAge } from "../components/helpers/dateHelper";

export default function PatientProfilePage({}) {
  const [searchParams] = useSearchParams();
  const { id } = useParams();
  const [tab, setTab] = useState(1); // Visits default

  const [selectedVisitId, setSelectedVisitId] = useState("");
  const tabParam = searchParams.get("tab");
  const dispatch = useDispatch();
  const { patientInfo } = useSelector((s) => s.patientProfile);
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
    if (id) {
      dispatch(fetchPatientProfile(id));
    }
  }, [id, dispatch]);
  useEffect(() => {
    console.log(patientInfo);
  }, [patientInfo]);
  const vitalsByVisit = useMemo(
    () =>
      (patientInfo?.visits ?? []).map((visit) => ({
        visitId: visit.id,
        visitDate:
          visit.created_at ?? visit.scheduled_for ?? visit.visit_date ?? "",
        temp: visit.vitals?.[0]?.temp ?? "",
        bpS: visit.vitals?.[0]?.bp_systolic ?? "",
        bpD: visit.vitals?.[0]?.bp_diastolic ?? "",
        pulse: visit.vitals?.[0]?.pulse_rate ?? "",
        weight: visit.vitals?.[0]?.weight ?? "",
        spo2: visit.vitals?.[0]?.spo2 ?? "",
      })),
    [patientInfo?.visits],
  );

  const patient = useMemo(() => {
    if (!patientInfo) return null;

    const firstName = patientInfo.first_name ?? "";
    const middleName = patientInfo.middle_name ?? "";
    const lastName = patientInfo.last_name ?? "";
    const middleInitial = middleName ? `${middleName.charAt(0).toUpperCase()}.` : "";

    return {
      name: [firstName, middleInitial, lastName].filter(Boolean).join(" "),
      patientId: patientInfo.id ?? "",
      age: patientInfo.birth_date ? String(getAge(patientInfo.birth_date)) : "",
      gender: patientInfo.gender ?? "",
      contact: patientInfo.contact_number ?? "",
      address: patientInfo.address ?? "",
      avatarUrl: "",
    };
  }, [patientInfo]);

  return (
    <Box className="space-y-4 p-4">
      <PatientHeaderCard />

      <PatientTabs
        patient={patient}
        tab={tab}
        setTab={setTab}
        visits={patientInfo?.visits ?? []}
        vitalsByVisit={vitalsByVisit}
        selectedVisitId={selectedVisitId}
        onSelectVisit={setSelectedVisitId}
      />
    </Box>
  );
}
