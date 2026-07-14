import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Chip,
  CircularProgress,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import ScienceIcon from "@mui/icons-material/Science";
import PaymentsIcon from "@mui/icons-material/Payments";
import GroupIcon from "@mui/icons-material/Group";
import RecentActivityCard from "./dashboard/RecentActivityCard";
import NeedsAttentionCard from "./dashboard/NeedsAttentionCard";
import { supabase } from "../lib/supabaseClient";

/* ---------------- Dashboard Widgets ---------------- */

export const StatCard = ({
  title,
  value,
  icon,
  iconBg = "bg-blue-100",
  iconColor = "text-blue-600",
}) => (
  <Card className="w-full">
    <CardContent className={`flex items-center gap-4 shadow-2xl ${iconBg}`}>
      <Box className={`p-3 rounded-xl ${iconBg} ${iconColor}`}>{icon}</Box>
      <Box>
        <Typography variant="body2" color="textSecondary">
          {title}
        </Typography>
        <Typography variant="h5" className="font-bold">
          {value}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

export const DoctorCard = ({ name, status, patientsToday }) => (
  <Box className="w-full p-2 flex flex-col">
    <Card>
      <CardContent className="flex justify-between items-center bg-green-100">
        <Box>
          <Typography className="font-semibold">{name}</Typography>
          <Chip
            label={status}
            color={status === "Available" ? "success" : "warning"}
            size="small"
            className="mt-1"
          />
        </Box>
        <Avatar>{name.charAt(0)}</Avatar>
      </CardContent>
      <Box className="mt-0 px-2 text-sm text-gray-600 flex justify-between bg-green-100 p-2">
        <span>Patients today</span>
        <span className="font-semibold">{patientsToday}</span>
      </Box>
    </Card>
  </Box>
);

const QuickActionsCard = () => {
  const navigate = useNavigate();
  const role = useSelector((s) => s.auth.role);
  const base = `/${role}`;

  const go = useCallback((path) => navigate(`${base}/${path}`), [navigate, base]);

  return (
    <Card className="rounded-2xl shadow-2xl">
      <CardContent>
        <Typography className="font-semibold mb-4">Quick Actions</Typography>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Button sx={{ minWidth: 150 }} variant="contained" onClick={() => go("appointments")}>
            New Appointment
          </Button>
          <Button sx={{ minWidth: 150 }} variant="outlined" onClick={() => go("appointments")}>
            Add Walk-in
          </Button>
          <Button sx={{ minWidth: 150 }} variant="outlined" onClick={() => go("patients")}>
            Register Patient
          </Button>
          <Button sx={{ minWidth: 150 }} variant="outlined" onClick={() => go("billing")}>
            Create Invoice
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

/* ---------------- Main Dashboard Page ---------------- */

export default function DashboardPage() {
  const [stats, setStats] = useState({
    appointmentsToday: 0,
    patientsSeenToday: 0,
    pendingLabResults: 0,
    todayCollection: 0,
  });
  const [doctorData, setDoctorData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchDashboardData = async () => {
      setLoading(true);
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const [
        { count: appointmentsCount },
        { count: patientsSeenCount },
        { count: pendingCount },
        { data: paymentsData },
        { data: doctors },
      ] = await Promise.all([
        supabase
          .from("queue_entries")
          .select("*", { count: "exact", head: true })
          .gte("created_at", todayStart.toISOString())
          .lt("created_at", todayEnd.toISOString()),
        supabase
          .from("queue_entries")
          .select("*", { count: "exact", head: true })
          .in("status", ["In Consult", "Done"])
          .gte("created_at", todayStart.toISOString())
          .lt("created_at", todayEnd.toISOString()),
        supabase
          .from("lab_requests")
          .select("*", { count: "exact", head: true })
          .in("status", ["Pending", "Processing"]),
        supabase
          .from("payments")
          .select("amount")
          .gte("paid_at", todayStart.toISOString())
          .lt("paid_at", todayEnd.toISOString()),
        supabase
          .from("user_profiles")
          .select("id, full_name, role, is_logged_in")
          .eq("role", "Doctor"),
      ]);

      if (!cancelled) {
        const totalCollection =
          paymentsData?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;

        setStats({
          appointmentsToday: appointmentsCount || 0,
          patientsSeenToday: patientsSeenCount || 0,
          pendingLabResults: pendingCount || 0,
          todayCollection: totalCollection,
        });

        setDoctorData(doctors || []);
        setLoading(false);
      }
    };

    fetchDashboardData();

    return () => { cancelled = true; };
  }, []);

  const activeDoctors = doctorData.filter((d) => d.is_logged_in);
  const totalDoctors = doctorData.length;

  if (loading) {
    return (
      <Box className="flex min-h-screen bg-slate-100 justify-center items-center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="flex min-h-screen bg-slate-100">
      <Box component="main" sx={{ flexGrow: 1 }}>
        {/* Row 1: Stat Cards */}
        <Box className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Appointments Today"
            value={stats.appointmentsToday}
            icon={<EventIcon />}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
          />
          <StatCard
            title="Patients Seen Today"
            value={stats.patientsSeenToday}
            icon={<GroupIcon />}
            iconBg="bg-cyan-100"
            iconColor="text-cyan-600"
          />
          <StatCard
            title="Pending Lab Results"
            value={stats.pendingLabResults}
            icon={<ScienceIcon />}
            iconBg="bg-yellow-100"
            iconColor="text-yellow-600"
          />
          <StatCard
            title="Today's Collection"
            value={`₱${stats.todayCollection.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
            icon={<PaymentsIcon />}
            iconBg="bg-purple-100"
            iconColor="text-purple-600"
          />
        </Box>

        {/* Row 2: Recent Activity + Doctor Status */}
        <Box className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Box className="lg:col-span-2 rounded-2xl shadow-2xl">
            <RecentActivityCard />
          </Box>
          <Box className="flex flex-col gap-1 bg-white p-4 rounded-2xl shadow-2xl h-fit">
            <Typography className="font-extrabold">
              Doctors On Duty: {activeDoctors.length}/{totalDoctors}
            </Typography>
            <div className="grid gap-4">
              {doctorData.map((d) => (
                <DoctorCard
                  key={d.id}
                  name={d.full_name}
                  status={d.is_logged_in ? "Available" : "Busy"}
                  patientsToday={0}
                />
              ))}
              {doctorData.length === 0 && (
                <Typography variant="body2" color="text.secondary" className="text-center py-2">
                  No doctors registered.
                </Typography>
              )}
            </div>
          </Box>
        </Box>

        {/* Row 3: Needs Attention */}
        <Box className="p-4 lg:col-span-3">
          <NeedsAttentionCard />
        </Box>

        {/* Row 4: Quick Actions */}
        <Box className="p-4 lg:col-span-3">
          <QuickActionsCard />
        </Box>
      </Box>
    </Box>
  );
}
