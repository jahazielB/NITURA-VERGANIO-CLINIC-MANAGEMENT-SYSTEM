import { Box, Chip, Stack, TextField } from "@mui/material";

const STATUSES = ["All", "Pending", "Processing", "Ready", "Released"];

export default function LabFilters({ q, onQChange, status, onStatusChange }) {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={2}
      alignItems={{ md: "center" }}
    >
      <Box sx={{ flex: 1 }}>
        <TextField
          size="small"
          fullWidth
          label="Search"
          placeholder="Patient name, test type, doctor, date..."
          value={q}
          onChange={(e) => onQChange(e.target.value)}
        />
      </Box>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {STATUSES.map((s) => (
          <Chip
            key={s}
            label={s}
            clickable
            onClick={() => onStatusChange(s)}
            color={s === status ? "primary" : "default"}
            variant={s === status ? "filled" : "outlined"}
            size="small"
          />
        ))}
      </Stack>
    </Stack>
  );
}
