import { Card, CardContent, Typography, Button } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import QueueIcon from "@mui/icons-material/Queue";

export default function NurseQuickActions({
  onRegisterPatient,
  onNewAppointment,
  onOpenQueue,
}) {
  return (
    <Card className="rounded-2xl shadow-2xl">
      <CardContent>
        <Typography className="font-semibold mb-4">Quick Actions</Typography>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={onRegisterPatient}
          >
            Register Patient
          </Button>
          <Button
            variant="outlined"
            startIcon={<CalendarMonthIcon />}
            onClick={onNewAppointment}
          >
            New Appointment
          </Button>
          <Button
            variant="outlined"
            startIcon={<QueueIcon />}
            onClick={onOpenQueue}
          >
            Open Queue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
