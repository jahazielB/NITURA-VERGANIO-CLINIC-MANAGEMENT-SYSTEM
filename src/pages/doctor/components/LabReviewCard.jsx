import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Divider,
} from "@mui/material";

export default function LabReviewCard({ rows, onView }) {
  return (
    <Card className="rounded-2xl shadow-2xl h-fit">
      <CardContent>
        <Box className="flex justify-between items-center">
          <Typography className="font-extrabold">Lab Results Ready</Typography>
          <Chip size="small" label={`${rows.length}`} color="info" />
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Box className="space-y-2">
          {rows.map((r) => (
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

          {rows.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No lab results awaiting review.
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
