import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Divider,
} from "@mui/material";

export default function ReadyToReleaseCard({ rows, onRelease }) {
  return (
    <Card className="rounded-2xl shadow-2xl h-fit">
      <CardContent>
        <Typography className="font-extrabold">Ready to Release</Typography>
        <Typography variant="body2" color="text.secondary">
          Results entered and pending release.
        </Typography>

        <Divider sx={{ my: 1.5 }} />

        <Box className="space-y-2">
          {rows.map((r) => (
            <Box
              key={r.id}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-50"
            >
              <Box>
                <Typography className="font-semibold">
                  {r.patientName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {r.testType} •{" "}
                  {new Date(r.requestedDate).toLocaleDateString("en-US")}
                </Typography>
              </Box>

              <Button
                size="small"
                variant="contained"
                onClick={() => onRelease(r)}
              >
                Release
              </Button>
            </Box>
          ))}

          {rows.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No results ready for release.
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
