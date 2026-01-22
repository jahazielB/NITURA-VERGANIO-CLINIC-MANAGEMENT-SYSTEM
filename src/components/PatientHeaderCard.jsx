import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

export default function PatientHeaderCard({ patient, onAddVisit }) {
  return (
    <Card className="rounded-2xl shadow-2xl ">
      <CardContent className="bg-slate-200 ">
        <Box className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 ">
          <Box className="flex items-start gap-4 ">
            <Avatar
              variant="rounded"
              sx={{ width: 110, height: 110 }}
              alt={patient.name}
              src={patient.avatarUrl}
            >
              {patient.name?.[0]}
            </Avatar>

            <Box>
              <Typography variant="h6" className="font-bold">
                Patient: {patient.name}
              </Typography>

              <Box className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
                <Typography variant="body2" color="text.secondary">
                  Patient ID:{" "}
                  <span className="text-slate-900">{patient.patientId}</span>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Age: <span className="text-slate-900">{patient.age}</span>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Gender:{" "}
                  <span className="text-slate-900">{patient.gender}</span>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Contact:{" "}
                  <span className="text-slate-900">{patient.contact}</span>
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  className="sm:col-span-2"
                >
                  Address:{" "}
                  <span className="text-slate-900">{patient.address}</span>
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box className="flex md:justify-end">
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onAddVisit}
            >
              Add Visit
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
