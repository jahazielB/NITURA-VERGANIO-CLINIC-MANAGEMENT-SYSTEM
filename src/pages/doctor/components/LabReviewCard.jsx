import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function LabReviewCard({ rows, onView }) {
  const navigate = useNavigate();
  const latest = rows.slice(0, 5);

  return (
    <Card className="rounded-2xl shadow-2xl h-fit">
      <CardContent>
        <Box className="flex justify-between items-center">
          <Typography className="font-extrabold">Lab Results Ready</Typography>
          <Button size="small" onClick={() => navigate("/doctor/lab-review")}>
            See All
          </Button>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Box className="space-y-2">
          {latest.map((r) => (
            <Box
              key={r.id}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-50"
            >
              <Box>
                <Typography className="font-semibold">{r.patient}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {r.test} • {r.date}
                </Typography>
              </Box>

              <Button size="small" variant="outlined" onClick={() => onView(r)}>
                View
              </Button>
            </Box>
          ))}

          {latest.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No lab results awaiting review.
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
