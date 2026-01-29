import {
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import PeopleIcon from "@mui/icons-material/People";
import ScienceIcon from "@mui/icons-material/Science";
import PaymentsIcon from "@mui/icons-material/Payments";
import { drawerWidth } from "../components/AdminShell";

/* ---------------- Dashboard Widgets ---------------- */

export const StatCard = ({
  title,
  value,
  icon,
  iconBg = "bg-blue-100",
  iconColor = "text-blue-600",
}) => (
  <Card className="w-full ">
    <CardContent className={`flex items-center gap-4 shadow-2xl  ${iconBg}`}>
      {/* Icon */}
      <Box className={`p-3 rounded-xl ${iconBg} ${iconColor} `}>{icon}</Box>

      {/* Text */}
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
      <CardContent className="flex  justify-between items-center bg-green-100 ">
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
      <Box className="mt-0 px-2 text-sm text-gray-600 flex justify-between bg-green-100 p-2 ">
        <span>Patients today</span>
        <span className="font-semibold">{patientsToday}</span>
      </Box>
    </Card>

    {/* Patients Today */}
  </Box>
);

export const AppointmentTable = () => (
  <Card className="p-4 h-full">
    <CardContent className="">
      <div className="flex justify-between ">
        <Typography className="font-extrabold mb-2 ">
          Today's Appointments
        </Typography>
        <Typography className="cursor-pointer underline">See all </Typography>
      </div>
      <Table size="small">
        <TableHead>
          <TableRow className="bg-slate-100">
            <TableCell>Patient</TableCell>
            <TableCell>Time</TableCell>
            <TableCell>Doctor</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {[].map((row, i) => (
            <TableRow key={i}>
              <TableCell>{row.p}</TableCell>
              <TableCell>{row.t}</TableCell>
              <TableCell>{row.d}</TableCell>
              <TableCell>
                <Chip label={row.s} size="small" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);
export const QuickActionsCard = () => (
  <Card className="rounded-2xl shadow-2xl ">
    <CardContent>
      <Typography className="font-semibold mb-4">Quick Actions</Typography>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Button sx={{ minWidth: 150 }} variant="contained">
          New Appointment
        </Button>
        <Button sx={{ minWidth: 150 }} variant="outlined">
          Add Walk-in
        </Button>
        <Button sx={{ minWidth: 150 }} variant="outlined">
          Register Patient
        </Button>
        <Button sx={{ minWidth: 150 }} variant="outlined">
          Create Invoice
        </Button>
      </div>
    </CardContent>
  </Card>
);

/* ---------------- Main Dashboard Page ---------------- */

export default function DashboardPage() {
  return (
    <Box className="flex min-h-screen bg-slate-100">
      <Box
        component="main"
        sx={{
          flexGrow: 1,
        }}
      >
        <Box className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ">
          <StatCard
            title="Today's Appointments"
            value="12"
            icon={<EventIcon />}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
          />
          <StatCard
            title="Doctors Available"
            value="1"
            iconBg="bg-green-100"
            icon={<PeopleIcon />}
            iconColor="text-green-600"
          />
          <StatCard
            title="Pending Lab Tests"
            value="3"
            icon={<ScienceIcon />}
            iconBg="bg-yellow-100"
            iconColor="text-yellow-600"
          />
          <StatCard
            title="Today's Collection"
            value="₱4,500"
            icon={<PaymentsIcon />}
            iconBg="bg-purple-100"
            iconColor="text-purple-600"
          />
        </Box>

        <Box className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Box className=" lg:col-span-2 rounded-2xl shadow-2xl ">
            <AppointmentTable />
          </Box>
          <Box className="flex flex-col gap-1 bg-white p-4 rounded-2xl shadow-2xl h-fit">
            <div className="flex justify-between">
              <Typography>Doctor Status</Typography>
              {/* <Typography>Doctor Status</Typography> */}
            </div>
            <div className="grid gap-4">
              <DoctorCard name="Dr. Alex" status="Available" />
              <DoctorCard name="Dr. Bea" status="Busy" />
            </div>
          </Box>
          <Box className="p-4 lg:col-span-3 ">
            <QuickActionsCard />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
