import { Card, Typography, Stack, Chip, Box } from "@mui/material";
import ScienceIcon from "@mui/icons-material/Science";

export default function LabsSection({ labRequests }) {
  return (
    <Card className="rounded-2xl p-4 shadow-sm">
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <ScienceIcon fontSize="small" color="warning" />
        <Typography fontWeight={600}>Lab Requests</Typography>
      </Box>

      <Stack spacing={2}>
        {labRequests.length > 0 ? (
          labRequests.map((l) => (
            <Box
              key={l.id}
              className="flex justify-between items-center p-2 border rounded-lg"
            >
              <Stack>
                <Typography variant="body2">{l.test_type}</Typography>
              </Stack>

              <Chip
                label={l.status}
                size="small"
                color={l.status === "Released" ? "success" : "warning"}
              />
            </Box>
          ))
        ) : (
          <Typography className="text-gray-400 italic">No labs</Typography>
        )}
      </Stack>
    </Card>
  );
}
