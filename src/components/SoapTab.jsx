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
import { upperCaseFirstLetter } from "./helpers/nameHelper";
import { useSelector, useDispatch } from "react-redux";

// expects visits like:
// [{ id, date, doctor, reason, vitals: {...} }]

export default function SoapTab({ visits = [] }) {
  const [selectedVisitId, setSelectedVisitId] = useState("");
  const [soapByVisit, setSoapByVisit] = useState({}); // { [visitId]: soapObj }

  const { patientInfo } = useSelector((s) => s.patientProfile);

  const visit = patientInfo?.visits;

  useEffect(() => {
    if (!visit.length) return;
    setSelectedVisitId(visit[0]?.id);
  }, [visit]);

  const selectedVisit = useMemo(
    () => visit.find((v) => v.id === selectedVisitId) || null,
    [visit, selectedVisitId],
  );

  const soap = useMemo(() => {
    const soapNote = selectedVisit?.soap_notes;
    return (
      soapNote?.find((s) => selectedVisitId === s.visit_id) || {
        subjective: "",
        objective: "",
        assessment: "",
        plan: "",
      }
    );
  }, [visit, selectedVisitId]);

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
      {/* Header */}
      <Card className="rounded-2xl shadow">
        <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <Box>
            <Typography variant="h6" className="font-bold">
              SOAP Notes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View and manage SOAP notes per patient visit.
            </Typography>
          </Box>

          {/* Visit Selector */}
          <Box className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <TextField
              select
              size="small"
              label="Select Visit"
              value={selectedVisitId}
              onChange={(e) => setSelectedVisitId(e.target.value)}
              sx={{ minWidth: 260 }}
              disabled={!visit?.length}
            >
              {[...(visit || [])]
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .map((v) => {
                  const doctor = v?.doctor;
                  return (
                    <MenuItem key={v?.id} value={v?.id}>
                      {new Date(v.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                      • Dr. {doctor?.full_name}
                    </MenuItem>
                  );
                })}
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

      {/* Visit Info Card */}
      {selectedVisit && (
        <Card className="rounded-2xl shadow border border-slate-100">
          <CardContent className="flex flex-col gap-1">
            <Typography className="font-semibold text-base">
              {upperCaseFirstLetter(selectedVisit?.chief_complaint) ||
                "No reason provided"}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {new Date(selectedVisit?.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
              • Dr. {selectedVisit?.doctor?.full_name || "N/A"} •{" "}
              {selectedVisit?.visit_type || "General Consultation"}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!visit?.length ? (
        <Card className="rounded-2xl shadow">
          <CardContent>
            <Typography className="font-semibold">No visits yet</Typography>
            <Typography variant="body2" color="text.secondary">
              Add a visit first to create or view SOAP notes.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        /* SOAP Form Card */
        <Card className="rounded-2xl shadow">
          <CardContent>
            <Box className="flex items-center justify-between mb-3">
              <Typography className="font-semibold">SOAP Details</Typography>

              {/* Admin Mode Indicator */}
              <Typography
                variant="caption"
                className="bg-slate-100 px-2 py-1 rounded-md"
              >
                Admin View
              </Typography>
            </Box>

            <SoapForm
              soap={soap}
              onChange={handleChange}
              readOnly={true} // 🔥 admin mode
            />
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
