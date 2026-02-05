import { Card, CardContent, Typography, Button } from "@mui/material";

export default function NurseQuickActions({ onGoQueue }) {
  return (
    <Card className="rounded-2xl shadow-2xl">
      <CardContent>
        <Typography className="font-semibold mb-4">Quick Actions</Typography>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Button variant="contained" onClick={onGoQueue}>
            Open Queue
          </Button>
          <Button
            variant="outlined"
            onClick={() => alert("Add Walk-in (mock)")}
          >
            Add Walk-in
          </Button>
          <Button
            variant="outlined"
            onClick={() => alert("Record Vitals (mock)")}
          >
            Record Vitals
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
