import {
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Box,
  Chip,
} from "@mui/material";
import { LAB_STATUS, LAB_PRIORITY } from "./LabWorklistHelpers";

export default function LabWorklistFilters({
  q,
  setQ,
  status,
  setStatus,
  priority,
  setPriority,
}) {
  return (
    <Card className="rounded-2xl shadow">
      <CardContent>
        <Grid container spacing={2} alignItems="flex-start">
          <Grid item xs={12} md={6}>
            <TextField
              label="Search"
              size="small"
              fullWidth
              placeholder="Patient, Lab ID, test type, doctor..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              select
              label="Status"
              size="small"
              fullWidth
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value="All">All</MenuItem>
              {LAB_STATUS.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              select
              label="Priority"
              size="small"
              fullWidth
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <MenuItem value="All">All</MenuItem>
              {LAB_PRIORITY.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={9}>
            <Box className="flex flex-wrap gap-1.5">
              <Chip
                size="small"
                label="All"
                clickable
                color={status === "All" ? "primary" : "default"}
                onClick={() => setStatus("All")}
              />
              {LAB_STATUS.map((s) => (
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
