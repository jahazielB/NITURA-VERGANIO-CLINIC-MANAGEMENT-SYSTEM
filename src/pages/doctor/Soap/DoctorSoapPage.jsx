import { Box, Typography, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import SoapFilters from "./components/SoapFilters";
import SoapTable from "./components/SoapTable";
import { soapMock } from "./components/soapMock";

export default function DoctorSoapPage() {
  const navigate = useNavigate();

  const [rows] = useState(soapMock);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();

    return rows
      .filter((r) => (status === "All" ? true : r.status === status))
      .filter((r) => {
        if (!qq) return true;
        return (
          (r.patientName || "").toLowerCase().includes(qq) ||
          (r.visitId || "").toLowerCase().includes(qq) ||
          (r.chiefComplaint || "").toLowerCase().includes(qq)
        );
      })
      .sort((a, b) => String(b.dateTime).localeCompare(String(a.dateTime)));
  }, [rows, q, status]);

  const goToSoapInChart = (r) => {
    // ✅ Jump to patient chart; you can later auto-open SOAP tab with a query param
    // Example: /doctor/patients/PT001?tab=soap&visit=V1001
    navigate(
      `/doctor/patients/${r.patientId}?tab=soap&visit=${encodeURIComponent(r.visitId)}`,
    );
  };

  const onContinue = (r) => goToSoapInChart(r);
  const onView = (r) => alert(`View SOAP ${r.id} (mock)`);
  const onPrint = (r) => alert(`Print SOAP ${r.id} (mock)`);

  const onNewSoap = () => {
    alert("New SOAP (mock) — wire to Queue / select patient later");
  };

  return (
    <Box className="space-y-4 p-5.5">
      <Box className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Box>
          <Typography variant="h6" className="font-bold">
            SOAP Notes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and continue your SOAP notes across patients.
          </Typography>
        </Box>

        <Button variant="contained" startIcon={<AddIcon />} onClick={onNewSoap}>
          New SOAP
        </Button>
      </Box>

      <SoapFilters q={q} setQ={setQ} status={status} setStatus={setStatus} />
      <SoapTable
        rows={filtered}
        onContinue={onContinue}
        onView={onView}
        onPrint={onPrint}
      />
    </Box>
  );
}
