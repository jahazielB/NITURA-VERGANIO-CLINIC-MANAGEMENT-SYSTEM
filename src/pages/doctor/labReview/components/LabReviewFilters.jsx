import { Card, CardContent, Grid, TextField, MenuItem } from "@mui/material";

const STATUS = ["All", "Ready", "Reviewed"];
const QUICK_DATE = [
  { value: "all", label: "All" },
  { value: "today", label: "Today" },
  { value: "thisWeek", label: "This Week" },
];

export default function LabReviewFilters({
  q,
  setQ,
  status,
  setStatus,
  quickDate,
  setQuickDate,
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
              placeholder="Patient, Lab ID, test type, visit ID..."
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
              {STATUS.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              select
              label="Date Filter"
              size="small"
              fullWidth
              value={quickDate}
              onChange={(e) => setQuickDate(e.target.value)}
            >
              {QUICK_DATE.map((d) => (
                <MenuItem key={d.value} value={d.value}>
                  {d.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
