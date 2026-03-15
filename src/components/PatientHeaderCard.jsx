import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AddVisitDialog from "./modals/AddvisitDialog";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import CustomSnackbar from "./modals/CustomSnackBar";
import { defaultVisitDateTime } from "./helpers/dateHelper";
export default function PatientHeaderCard({ onAddVisit, onClose }) {
  const [openAddVisit, setOpenAddVisit] = useState(false);
  const [form, setForm] = useState({
    visitDateTime: defaultVisitDateTime,
    doctorId: "",
    visitType: "",
    reason: "",
    notes: "",
    tempC: "",
    pulse: "",
    bp: "",
    spo2: "",
    weightKg: "",
    heightCm: "",
    respiratoryRate: "",
    allergyNoted: false,
    allergyDetails: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "",
  });
  const { role } = useSelector((s) => s.auth);
  const { patientInfo } = useSelector((s) => s.patientProfile);
  function getAge(dateString) {
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();

    // Adjust age if the birthday hasn't happened this year yet
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }
  function fullName(name) {
    if (!name) return "fetching....";
    return name
      .split(" ")
      .map((letters) => {
        return letters.charAt(0).toUpperCase() + letters.slice(1);
      })
      .join(" ");
  }
  // const fullName = patient?.first_name + patient?.last_name;
  return (
    <Card className="rounded-2xl shadow-2xl ">
      <CardContent className="bg-slate-200 ">
        <Box className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 ">
          {!patientInfo ? (
            "Fetching..."
          ) : (
            <Box className="flex items-start gap-4 ">
              <Avatar variant="rounded" sx={{ width: 110, height: 110 }}>
                {patientInfo?.first_name?.[0]}
              </Avatar>

              <Box>
                <Typography variant="h6" className="font-bold">
                  Patient:{" "}
                  {fullName(
                    patientInfo?.first_name + " " + patientInfo?.last_name,
                  )}
                </Typography>

                <Box className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
                  {/* <Typography variant="body2" color="text.secondary">
                  Patient ID:{" "}
                  <span className="text-slate-900">{patient.patientId}</span>
                </Typography> */}
                  <Typography variant="body2" color="text.secondary">
                    Age:{" "}
                    <span className="text-slate-900">
                      {getAge(patientInfo?.birth_date)}
                    </span>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Gender:{" "}
                    <span className="text-slate-900">
                      {patientInfo?.gender}
                    </span>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Contact:{" "}
                    <span className="text-slate-900">
                      {patientInfo?.contact_number}
                    </span>
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    className="sm:col-span-2"
                  >
                    Address:{" "}
                    <span className="text-slate-900">
                      {patientInfo?.address}
                    </span>
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          {(role === "Admin" || role === "Nurse") && (
            <Box className="flex md:justify-end">
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenAddVisit(true)}
              >
                Add Visit
              </Button>
            </Box>
          )}
        </Box>
        <AddVisitDialog
          open={openAddVisit}
          onClose={() => {
            setOpenAddVisit(false);
          }}
          setSnack={setSnackbar}
          form={form}
          setForm={setForm}
        />
      </CardContent>
      <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Card>
  );
}
