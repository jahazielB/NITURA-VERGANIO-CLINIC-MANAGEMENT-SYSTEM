import {
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Divider,
  Card,
  CardContent,
} from "@mui/material";

export default function VisitDetailsModal({ open, onClose }) {
  // later: these come from DB using visit.id
  const vitals = {
    temp: "37.8°C",
    bp: "120/80",
    pulse: "86",
    weight: "72kg",
    spo2: "97%",
  };

  const soap = {
    subjective: "Patient reports cough and fatigue.",
    objective: "Mild fever, congested lungs.",
    assessment: "Viral infection.",
    plan: "Rest, fluids, meds, follow-up.",
  };

  const prescriptions = [
    "Amoxicillin 500mg - 3x daily",
    "Ibuprofen 200mg - as needed",
  ];

  const labs = [
    { test: "CBC", status: "Pending" },
    { test: "Urinalysis", status: "Released" },
  ];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Box className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <Typography className="font-bold">Visit Details</Typography>
          <Chip label={"Completed"} color="success" size="small" />
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          className="mt-1"
        ></Typography>
      </DialogTitle>

      <DialogContent dividers>
        {/* Vitals */}
        <Card className="rounded-2xl shadow mb-4">
          <CardContent>
            <Typography className="font-semibold mb-2">Vitals</Typography>
            <Box className="flex flex-wrap gap-2">
              <Chip label={`Temp: ${vitals.temp}`} />
              <Chip label={`BP: ${vitals.bp}`} />
              <Chip label={`Pulse: ${vitals.pulse}`} />
              <Chip label={`Weight: ${vitals.weight}`} />
              <Chip label={`SpO₂: ${vitals.spo2}`} />
            </Box>
            <Typography variant="body2" color="text.secondary" className="mt-2">
              Recorded: {}
            </Typography>
          </CardContent>
        </Card>

        {/* SOAP */}
        <Card className="rounded-2xl shadow mb-4">
          <CardContent>
            <Typography className="font-semibold mb-2">SOAP Note</Typography>
            <Box className="space-y-2">
              <Typography variant="body2">
                <span className="font-semibold">S:</span> {soap.subjective}
              </Typography>
              <Typography variant="body2">
                <span className="font-semibold">O:</span> {soap.objective}
              </Typography>
              <Typography variant="body2">
                <span className="font-semibold">A:</span> {soap.assessment}
              </Typography>
              <Typography variant="body2">
                <span className="font-semibold">P:</span> {soap.plan}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Prescriptions + Labs */}
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="rounded-2xl shadow">
            <CardContent>
              <Typography className="font-semibold mb-2">
                Prescriptions
              </Typography>
              <Box className="space-y-1">
                {prescriptions.map((p, idx) => (
                  <Typography key={idx} variant="body2">
                    • {p}
                  </Typography>
                ))}
              </Box>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow">
            <CardContent>
              <Typography className="font-semibold mb-2">
                Lab Requests
              </Typography>
              <Box className="space-y-2">
                {labs.map((l, idx) => (
                  <Box key={idx} className="flex items-center justify-between">
                    <Typography variant="body2">{l.test}</Typography>
                    <Chip
                      label={l.status}
                      size="small"
                      color={l.status === "Released" ? "success" : "warning"}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Divider className="my-4" />

        <Typography variant="body2" color="text.secondary">
          Tip: Later we can add “Print Visit Summary” and “Open Full Visit”.
        </Typography>
      </DialogContent>

      <DialogActions className="px-6 py-4">
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        <Button onClick={() => alert("Edit Visit next")} variant="contained">
          Edit Visit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
