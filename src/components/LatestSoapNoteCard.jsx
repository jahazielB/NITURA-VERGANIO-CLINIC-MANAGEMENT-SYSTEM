import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";

export default function LatestSoapNoteCard({ soap, onViewNote }) {
  return (
    <Card className="rounded-2xl shadow-2xl h-full">
      <CardContent>
        <Typography className="font-semibold mb-3">Latest SOAP Note</Typography>

        <Box className="rounded-xl bg-slate-100 p-3 space-y-2">
          <Typography variant="body2">
            <span className="font-semibold">Subjective:</span>{" "}
            <span className="text-slate-700">{soap.subjective}</span>
          </Typography>
          <Typography variant="body2">
            <span className="font-semibold">Objective:</span>{" "}
            <span className="text-slate-700">{soap.objective}</span>
          </Typography>
          <Typography variant="body2">
            <span className="font-semibold">Assessment:</span>{" "}
            <span className="text-slate-700">{soap.assessment}</span>
          </Typography>
          <Typography variant="body2">
            <span className="font-semibold">Plan:</span>{" "}
            <span className="text-slate-700">{soap.plan}</span>
          </Typography>
        </Box>

        <Box className="mt-3 flex justify-end">
          <Button
            variant="contained"
            startIcon={<VisibilityIcon />}
            onClick={onViewNote}
          >
            View Note
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
