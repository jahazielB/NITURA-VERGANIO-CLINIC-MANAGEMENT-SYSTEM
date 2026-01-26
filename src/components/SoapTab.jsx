import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import PrintIcon from "@mui/icons-material/Print";
import SoapForm from "./forms/SoapForm";

// expects visits like:
// [{ id, date, doctor, reason, vitals: {...} }]
function getLatestVisitId(visits) {
  if (!visits?.length) return "";
  return [...visits].sort((a, b) => new Date(b.date) - new Date(a.date))[0].id;
}

export default function SoapTab({ visits = [] }) {
  const [selectedVisitId, setSelectedVisitId] = useState("");
  const [soapByVisit, setSoapByVisit] = useState({}); // { [visitId]: soapObj }

  useEffect(() => {
    if (!visits.length) return;
    setSelectedVisitId((prev) => prev || getLatestVisitId(visits));
  }, [visits]);

  const selectedVisit = useMemo(
    () => visits.find((v) => v.id === selectedVisitId) || null,
    [visits, selectedVisitId],
  );

  const soap = useMemo(() => {
    const existing = soapByVisit[selectedVisitId];
    return (
      existing || {
        subjective: "",
        objective: "",
        assessment: "",
        plan: "",
      }
    );
  }, [soapByVisit, selectedVisitId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSoapByVisit((prev) => ({
      ...prev,
      [selectedVisitId]: {
        ...soap,
        [name]: value,
      },
    }));
  };

  const handleSave = () => {
    if (!selectedVisitId) return alert("Please select a visit first.");
    alert("SOAP saved (placeholder). Wire this to DB later.");
  };

  const handlePrint = () => {
    alert("Print SOAP feature coming soon");
  };

  return (
    <Box className="space-y-4">
      {/* Header / Visit selector */}
      <Card className="rounded-2xl shadow">
        <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <Box>
            <Typography variant="h6" className="font-bold">
              SOAP Notes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Choose a visit and document notes for that encounter.
            </Typography>
          </Box>

          <Box className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <TextField
              select
              size="small"
              label="Select Visit"
              value={selectedVisitId}
              onChange={(e) => setSelectedVisitId(e.target.value)}
              sx={{ minWidth: 260 }}
              disabled={!visits.length}
            >
              {visits.map((v) => (
                <MenuItem key={v.id} value={v.id}>
                  {v.date} • {v.doctor}
                </MenuItem>
              ))}
            </TextField>

            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={!selectedVisitId}
            >
              Save
            </Button>

            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              disabled={!selectedVisitId}
            >
              Print
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Visit meta preview (optional but helpful) */}
      {selectedVisit && (
        <Card className="rounded-2xl shadow">
          <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <Typography className="font-semibold">
              {selectedVisit.reason}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedVisit.date} • {selectedVisit.doctor} •{" "}
              {selectedVisit.visitType || "—"}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      {!visits.length ? (
        <Card className="rounded-2xl shadow">
          <CardContent>
            <Typography className="font-semibold">No visits yet</Typography>
            <Typography variant="body2" color="text.secondary">
              Add a visit first to create SOAP notes.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <SoapForm
          soap={soap}
          onChange={handleChange}
          vitals={selectedVisit?.vitals}
        />
      )}
    </Box>
  );
}
