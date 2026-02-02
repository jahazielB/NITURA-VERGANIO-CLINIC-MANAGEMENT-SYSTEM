import { Card, CardContent, Typography, Button } from "@mui/material";

export default function DoctorQuickActions() {
  return (
    <Card className="rounded-2xl shadow-2xl">
      <CardContent>
        <Typography className="font-semibold mb-4">Quick Actions</Typography>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Button variant="contained" onClick={() => alert("New SOAP (mock)")}>
            New SOAP
          </Button>
          <Button
            variant="outlined"
            onClick={() => alert("Write Prescription (mock)")}
          >
            Write Prescription
          </Button>
          <Button
            variant="outlined"
            onClick={() => alert("Request Lab Test (mock)")}
          >
            Request Lab Test
          </Button>
          <Button
            variant="outlined"
            onClick={() => alert("Add Follow-up (mock)")}
          >
            Add Follow-up
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
