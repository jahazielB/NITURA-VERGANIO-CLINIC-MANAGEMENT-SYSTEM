import { Box, TablePagination, TextField, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getLabRequests } from "../../../services/labRequestService";
import { getAge } from "../../../components/helpers/dateHelper";
import { fullName } from "../../../components/helpers/nameHelper";
import LabReviewTable from "./components/LabReviewTable";
import ViewLabModal from "../../../components/modals/ViewLabModal";

export default function DoctorLabReviewPage() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");

  const [openView, setOpenView] = useState(false);
  const [selected, setSelected] = useState(null);

  const templatePatient = useMemo(() => ({
    name: fullName(selected?.patientName || ""),
    age: selected?.birthDate ? String(getAge(selected.birthDate)) : "",
    sex: selected?.gender || "",
    date: selected?.releasedDate
      ? new Date(selected.releasedDate).toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        })
      : "",
    address: selected?.address || "",
    requestingPhysician: selected?.requestedBy || "",
  }), [selected]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { rows: data, total } = await getLabRequests({
        page: page + 1,
        limit: rowsPerPage,
        search: q,
        status: "Released",
      });

      setRows(data || []);
      setTotalCount(total);
    } catch (e) {
      console.error("Failed to load lab results:", e);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, q]);

  useEffect(() => {
    setPage(0);
  }, [q]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onView = (r) => {
    setSelected(r);
    setOpenView(true);
  };

  const onOpenChart = (r) => {
    navigate(
      `/doctor/patients/${r.patientId}?tab=lab&visit=${encodeURIComponent(r.visitId)}`,
    );
  };

  const onPageChange = (_e, newPage) => {
    setPage(newPage);
  };

  return (
    <Box className="space-y-4 p-5.5">
      <Box>
        <Typography variant="h6" className="font-bold">
          Lab Review
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Review released lab results and mark them as reviewed.
        </Typography>
      </Box>

      <TextField
        label="Search"
        size="small"
        fullWidth
        placeholder="Patient, test type..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <LabReviewTable
        rows={rows}
        loading={loading}
        totalCount={totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={onPageChange}
        onOpenChart={onOpenChart}
        onView={onView}
      />

      <ViewLabModal
        open={openView}
        onClose={() => setOpenView(false)}
        visitLabel=""
        item={selected}
        patient={templatePatient}
      />
    </Box>
  );
}
