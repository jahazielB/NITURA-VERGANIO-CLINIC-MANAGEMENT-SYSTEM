import { Card, CardContent, Grid, TextField, MenuItem } from "@mui/material";

const QUICK_DATE = [
  { value: "all", label: "All" },
  { value: "today", label: "Today" },
  { value: "thisWeek", label: "This Week" },
];

export default function RxFilters({ q, setQ, quickDate, setQuickDate }) {
  return (
    <Card className="rounded-2xl shadow">
      <CardContent>
        <Grid container spacing={2} alignItems="flex-start">
          <Grid item xs={12} md={8}>
            <TextField
              label="Search"
              size="small"
              fullWidth
              placeholder="Patient, Rx ID, medicine, diagnosis..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={4}>
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
