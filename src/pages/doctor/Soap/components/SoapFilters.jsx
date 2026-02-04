import { Card, CardContent, Grid, TextField, MenuItem } from "@mui/material";

export default function SoapFilters({ q, setQ, status, setStatus }) {
  return (
    <Card className="rounded-2xl shadow">
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField
              label="Search"
              size="small"
              fullWidth
              placeholder="Patient name, visit ID, complaint..."
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
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Draft">Draft</MenuItem>
              <MenuItem value="Final">Final</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
