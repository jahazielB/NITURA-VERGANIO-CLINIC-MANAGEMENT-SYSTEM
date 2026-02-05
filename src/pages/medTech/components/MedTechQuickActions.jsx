import { Card, CardContent, Typography, Button } from "@mui/material";

export default function MedTechQuickActions({ onGoWorklist }) {
  return (
    <Card className="rounded-2xl shadow-2xl">
      <CardContent>
        <Typography className="font-semibold mb-4">Quick Actions</Typography>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Button variant="contained" onClick={onGoWorklist}>
            Open Worklist
          </Button>
          <Button
            variant="outlined"
            onClick={() => alert("Scan/Receive Specimen (mock)")}
          >
            Receive Specimen
          </Button>
          <Button
            variant="outlined"
            onClick={() => alert("Create Lab Request (admin/doctor usually)")}
          >
            Create Request
          </Button>
          <Button
            variant="outlined"
            onClick={() => alert("Released Log (mock)")}
          >
            Released Log
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
