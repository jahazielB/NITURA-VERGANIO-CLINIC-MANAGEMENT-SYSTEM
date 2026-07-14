import { Box, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { supabase } from "../../../lib/supabaseClient";
import { fetchPatientProfile } from "../../../store/patientProfileSlice";
import PrescriptionViewModal from "../../../components/modals/PrescriptionViewModal";
import RxFilters from "./components/RxFilters";
import RxTable from "./components/RxTable";

export default function DoctorPrescriptionsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((s) => s.auth);

  const [rows, setRows] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [quickDate, setQuickDate] = useState("all");
  const [viewItem, setViewItem] = useState(null);
  const [openView, setOpenView] = useState(false);

  const fetchData = useCallback(async () => {
    if (!currentUser?.id) return;
    setLoading(true);

    try {
      let orderQuery = supabase
        .from("prescription_orders")
        .select(
          `
          id,
          rx_number,
          prescribed_at,
          created_at,
          is_active,
          prescribed_by,
          visit_id,
          prescription_items(medication, dosage)
        `,
          { count: "exact" },
        )
        .eq("prescribed_by", currentUser.id);

      if (q.trim()) {
        const searchTerm = `%${q.trim()}%`;

        const { data: matchingPatients } = await supabase
          .from("patients")
          .select("id")
          .or(
            `first_name.ilike.${searchTerm},middle_name.ilike.${searchTerm},last_name.ilike.${searchTerm}`,
          );

        const patientIds = matchingPatients?.map((p) => p.id) || [];

        if (patientIds.length === 0) {
          setRows([]);
          setTotalCount(0);
          setLoading(false);
          return;
        }

        const { data: matchingVisits } = await supabase
          .from("visits")
          .select("id")
          .in("patient_id", patientIds)
          .eq("doctor_id", currentUser.id);

        const visitIdFilter = matchingVisits?.map((v) => v.id) || [];

        if (visitIdFilter.length === 0) {
          setRows([]);
          setTotalCount(0);
          setLoading(false);
          return;
        }

        orderQuery = orderQuery.in("visit_id", visitIdFilter);
      }

      const now = new Date();
      if (quickDate === "today") {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        orderQuery = orderQuery.gte("created_at", start.toISOString());
      } else if (quickDate === "thisWeek") {
        const start = new Date(now);
        start.setDate(now.getDate() - now.getDay());
        start.setHours(0, 0, 0, 0);
        orderQuery = orderQuery.gte("created_at", start.toISOString());
      }

      orderQuery = orderQuery
        .order("created_at", { ascending: false })
        .range(page * rowsPerPage, (page + 1) * rowsPerPage - 1);

      const { data: orders, error, count } = await orderQuery;
      if (error) throw error;

      if (!orders?.length) {
        setRows([]);
        setTotalCount(0);
        setLoading(false);
        return;
      }

      const visitIds = orders.map((o) => o.visit_id).filter(Boolean);
      const doctorIds = orders.map((o) => o.prescribed_by).filter(Boolean);

      const [visitsResult, doctorsResult] = await Promise.all([
        supabase
          .from("visits")
          .select(
            `
            id,
            created_at,
            chief_complaint,
            patient:patient_id(id, first_name, middle_name, last_name, suffix)
          `,
          )
          .in("id", visitIds),
        supabase
          .from("user_profiles")
          .select("id, full_name, lic")
          .in("id", doctorIds),
      ]);

      if (visitsResult.error) throw visitsResult.error;
      if (doctorsResult.error) throw doctorsResult.error;

      const visitMap = {};
      (visitsResult.data || []).forEach((v) => {
        visitMap[v.id] = v;
      });

      const doctorMap = {};
      (doctorsResult.data || []).forEach((d) => {
        doctorMap[d.id] = d;
      });

      const mapped = (orders || []).map((r) => {
        const visit = visitMap[r.visit_id] || {};
        const p = visit.patient || {};
        const doctor = doctorMap[r.prescribed_by] || {};

        const names = [p.last_name, `${p.first_name}${p.middle_name ? " " + p.middle_name.charAt(0) + "." : ""}`]
          .filter(Boolean)
          .join(", ");

        return {
          id: r.rx_number || r.id,
          patientId: p.id,
          patientName: names,
          dateTime: r.prescribed_at || r.created_at,
          visitId: r.visit_id,
          visitDate: visit.created_at,
          prescribedDate: r.prescribed_at,
          prescribedByName: doctor.full_name || "",
          doctor,
          diagnosis: visit.chief_complaint || "",
          prescription_items: r.prescription_items,
          isActive: r.is_active,
          created_at: r.created_at,
        };
      });

      setRows(mapped);
      setTotalCount(count || 0);
    } catch (e) {
      console.error("Failed to load prescriptions:", e);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, q, quickDate, page, rowsPerPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onOpenChart = (r) => {
    navigate(
      `/doctor/patients/${r.patientId}?tab=prescriptions&visit=${encodeURIComponent(r.visitId)}`,
    );
  };

  const onPageChange = (_e, newPage) => {
    setPage(newPage);
  };

  const onView = (r) => {
    if (r?.patientId) {
      dispatch(fetchPatientProfile(r.patientId));
    }
    setViewItem(r);
    setOpenView(true);
  };

  return (
    <Box className="space-y-4 p-5.5">
      <Box>
        <Typography variant="h6" className="font-bold">
          Prescription History
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Search, review, and reopen prescriptions issued during patient consultations.
        </Typography>
      </Box>

      <RxFilters
        q={q}
        setQ={setQ}
        quickDate={quickDate}
        setQuickDate={setQuickDate}
      />
      <RxTable
        rows={rows}
        loading={loading}
        totalCount={totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={onPageChange}
        onOpenChart={onOpenChart}
        onView={onView}
      />

      <PrescriptionViewModal
        open={openView}
        onClose={() => {
          setViewItem(null);
          setOpenView(false);
        }}
        item={viewItem}
        visitLabel={
          viewItem
            ? new Date(viewItem.visitDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : ""
        }
        editing={false}
        setSave={() => {}}
        saving={false}
        setSnack={() => {}}
      />
    </Box>
  );
}
