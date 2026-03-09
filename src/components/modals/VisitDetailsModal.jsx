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
  Stack,
} from "@mui/material";

export default function VisitDetailsModal({ open, onClose, records }) {
  const vitalsRecords = records?.flatMap((v) => v.vitals) || [];
  const soapNotes = records?.flatMap((s) => s.soap_notes) || [];
  const prescriptionsOrder = records?.flatMap((p) => p.prescription_orders);
  const prescriptions =
    prescriptionsOrder?.flatMap((p) => p.prescription_items) || [];

  const labRequests = records?.flatMap((l) => l.lab_requests);
  const labService = labRequests?.flatMap((l) => l.lab_services);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Box className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <Typography className="font-bold text-lg">Visit Details</Typography>
          <Chip label={"Completed"} color="success" size="small" />
        </Box>
      </DialogTitle>

      <DialogContent dividers className="space-y-6">
        {/* Vitals */}
        <Card className="rounded-2xl shadow-sm hover:shadow-md transition p-4">
          <Typography className="font-semibold mb-3 text-md">Vitals</Typography>
          <Stack spacing={3} maxHeight={200} overflow="auto">
            {vitalsRecords.length > 0 ? (
              vitalsRecords.map((v, idx) => (
                <Box
                  key={idx}
                  className="p-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition"
                >
                  <Stack direction="row" spacing={1} flexWrap="wrap" mb={1}>
                    <Chip label={`Temp: ${v.temperature_c}°C`} size="small" />
                    <Chip
                      label={`BP: ${v.blood_pressure_sys}/${v.blood_pressure_dia}`}
                      size="small"
                    />
                    <Chip label={`Pulse: ${v.heart_rate}`} size="small" />
                    <Chip
                      label={`Resp Rate: ${v.respiratory_rate}`}
                      size="small"
                    />
                    <Chip label={`Weight: ${v.weight_kg}kg`} size="small" />
                    <Chip label={`SpO₂: ${v.spo2}`} size="small" />
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    Recorded at: {v.taken_at}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography className="text-gray-400 text-sm italic">
                No vitals recorded
              </Typography>
            )}
          </Stack>
        </Card>

        {/* SOAP */}
        <Card className="rounded-2xl shadow-sm hover:shadow-md transition p-4">
          <Typography className="font-semibold mb-3 text-md">
            SOAP Notes
          </Typography>
          {soapNotes.length > 0 ? (
            <Stack spacing={3} maxHeight={250} overflow="auto">
              {soapNotes.map((s) => (
                <Card
                  key={s.id}
                  className="p-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition"
                >
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      <span className="font-semibold">S:</span> {s.subjective}
                    </Typography>
                    <Typography variant="body2">
                      <span className="font-semibold">O:</span> {s.objective}
                    </Typography>
                    <Typography variant="body2">
                      <span className="font-semibold">A:</span> {s.assessment}
                    </Typography>
                    <Typography variant="body2">
                      <span className="font-semibold">P:</span> {s.plan}
                    </Typography>
                  </Stack>
                </Card>
              ))}
            </Stack>
          ) : (
            <Typography className="text-gray-400 text-sm italic">
              No SOAP recorded
            </Typography>
          )}
        </Card>

        {/* Prescriptions + Labs */}
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Prescriptions */}
          <Card className="rounded-2xl shadow-sm hover:shadow-md transition p-4">
            <Typography className="font-semibold mb-3 text-md">
              Prescriptions
            </Typography>
            <Stack spacing={2} maxHeight={220} overflow="auto">
              {prescriptions.length > 0 ? (
                prescriptions.map((p) => (
                  <Box
                    key={p.id}
                    className="p-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip label={p.medication} size="small" color="primary" />
                      <Chip label={p.dosage} size="small" color="secondary" />
                      <Chip label={p.frequency} size="small" color="warning" />
                      {p.instructions && (
                        <Chip label={p.instructions} size="small" />
                      )}
                      {p.duration && <Chip label={p.duration} size="small" />}
                    </Stack>
                  </Box>
                ))
              ) : (
                <Typography className="text-gray-400 text-sm italic">
                  No prescriptions
                </Typography>
              )}
            </Stack>
          </Card>

          {/* Labs */}
          {labRequests?.length > 0 ? (
            <Card className="rounded-2xl shadow-sm hover:shadow-md transition p-4">
              <Typography className="font-semibold mb-3 text-md">
                Lab Requests
              </Typography>
              <Stack spacing={2}>
                {labRequests?.map((l) => (
                  <Box
                    key={l.id}
                    className="flex items-center justify-between p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                  >
                    {labService.map((s) => (
                      <Typography key={s.id} variant="body2">
                        {s.name}
                      </Typography>
                    ))}
                    <Chip
                      label={l.status}
                      size="small"
                      color={l.status === "Released" ? "success" : "warning"}
                    />
                  </Box>
                ))}
              </Stack>
            </Card>
          ) : (
            <Typography className="text-gray-400 text-sm italic">
              No Lab results
            </Typography>
          )}
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
        <Button
          onClick={() =>
            console.log(labRequests?.flatMap((l) => l.lab_services))
          }
          variant="contained"
        >
          Edit Visit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
