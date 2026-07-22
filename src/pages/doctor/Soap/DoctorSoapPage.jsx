import { Box, CircularProgress, Typography, Button, Pagination } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { supabase } from "../../../lib/supabase";

import SoapFilters from "./components/SoapFilters";
import SoapTable from "./components/SoapTable";
import SoapViewDialog from "./components/SoapViewDialog";

const VISIT_SELECT = `
  id,
  created_at,
  chief_complaint,
  status,
  visit_type,
  patient_id,
  patients ( id, first_name, middle_name, last_name ),
  soap_notes ( id, created_at, updated_at, subjective, objective, assessment, plan ),
  user_profiles!doctor_id ( id, full_name )
`;

function inferStatus(note) {
  if (!note) return "Draft";
  const hasContent = [note.subjective, note.objective, note.assessment, note.plan]
    .some((v) => v && v.trim());
  return hasContent ? "Final" : "Draft";
}

export default function DoctorSoapPage() {
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);

  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [page, setPage] = useState(1);
  const [viewRow, setViewRow] = useState(null);
  const [printMode, setPrintMode] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const rowsPerPage = 10;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    const fetchVisits = async () => {
      setLoading(true);
      const qq = debouncedQ.trim();

      let patientIds = null;
      if (qq) {
        const pattern = `%${qq}%`;
        const { data: matching } = await supabase
          .from("patients")
          .select("id")
          .or(`first_name.ilike.${pattern},middle_name.ilike.${pattern},last_name.ilike.${pattern}`);
        patientIds = (matching || []).map((p) => p.id);
        if (patientIds.length === 0) {
          if (!cancelled) { setRows([]); setTotalCount(0); setLoading(false); }
          return;
        }
      }

      let query = supabase
        .from("visits")
        .select(VISIT_SELECT, { count: "exact", head: false })
        .eq("doctor_id", user.id)
        .order("created_at", { ascending: false })
        .range((page - 1) * rowsPerPage, page * rowsPerPage - 1);

      if (patientIds) query = query.in("patient_id", patientIds);

      const { data, error, count } = await query;

      if (!cancelled) {
        if (!error) {
          const mapped = (data || []).map((v) => {
            const p = v.patients || {};
            const soap = v.soap_notes?.[0] || null;
            const name = [p.first_name, p.middle_name, p.last_name]
              .filter(Boolean).join(" ");
            return {
              id: soap?.id || v.id,
              patientName: name || "Unknown",
              patientId: v.patient_id,
              visitId: v.id,
              dateTime: new Date(v.created_at).toLocaleString("en-US", {
                month: "short", day: "numeric", year: "numeric",
                hour: "numeric", minute: "2-digit",
              }),
              chiefComplaint: v.chief_complaint || "—",
              status: inferStatus(soap),
              lastUpdated: soap?.updated_at
                ? new Date(soap.updated_at).toLocaleString("en-US", {
                    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
                  })
                : "—",
              soapData: soap || null,
              doctorName: v.user_profiles?.full_name || "—",
            };
          });
          setRows(mapped);
          setTotalCount(count ?? 0);
        }
        setLoading(false);
      }
    };

    fetchVisits();
    return () => { cancelled = true; };
  }, [user?.id, debouncedQ, page]);

  useEffect(() => { setPage(1); }, [debouncedQ]);

  const totalPages = Math.ceil(totalCount / rowsPerPage);

  const goToSoapInChart = (r) => {
    navigate(
      `/doctor/patients/${r.patientId}?tab=soap&visit=${encodeURIComponent(r.visitId)}`,
    );
  };

  const onContinue = (r) => goToSoapInChart(r);
  const onView = (r) => { setPrintMode(false); setViewRow(r); };
  const onPrint = (r) => { setPrintMode(true); setViewRow(r); };

  const onNewSoap = () => {
    navigate("/doctor/patients");
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

      <SoapFilters q={q} setQ={setQ} />

      <SoapTable
        rows={rows}
        onContinue={onContinue}
        onView={onView}
        onPrint={onPrint}
      />

      {totalPages > 1 && (
        <Box className="flex justify-center">
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      <SoapViewDialog
        open={!!viewRow}
        onClose={() => { setViewRow(null); setPrintMode(false); }}
        row={viewRow}
        printMode={printMode}
      />
    </Box>
  );
}
