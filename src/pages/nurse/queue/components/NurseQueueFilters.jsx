import {
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Box,
  Chip,
} from "@mui/material";

const STATUS = ["All", "Waiting", "In Triage", "Ready for Doctor"];

export default function NurseQueueFilters({ q, setQ, status, setStatus }) {
  return (
    <Card className="rounded-2xl shadow">
      <CardContent>
        <Grid container spacing={2} alignItems="flex-start">
          <Grid item xs={12} md={8}>
            <TextField
              label="Search"
              size="small"
              fullWidth
              placeholder="Patient, ID, reason..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              select
              label="Status"
              size="small"
              fullWidth
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {STATUS.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <Box className="flex flex-wrap gap-1.5">
              {STATUS.map((s) => (
                <Chip
                  key={s}
                  size="small"
                  label={s}
                  clickable
                  color={status === s ? "primary" : "default"}
                  onClick={() => setStatus(s)}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
