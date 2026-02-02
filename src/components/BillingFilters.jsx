import {
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Box,
  Chip,
  Divider,
  Typography,
} from "@mui/material";
import { STATUS, todayISO } from "./helpers/billingHelpers";

export default function BillingFilters({
  q,
  setQ,
  filterStatus,
  setFilterStatus,
  quickDate,
  setQuickDate,
}) {
  return (
    <Card className="rounded-2xl shadow">
      <CardContent>
        <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>
          Filters
        </Typography>

        {/* ✅ more space between inputs */}
        <Grid container spacing={3} alignItems="flex-start">
          <Grid item xs={12} md={4}>
            <TextField
              label="Search"
              size="small"
              fullWidth
              placeholder="Patient name, invoice #, date..."
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
              helperText={`Today: ${todayISO()}`}
            >
              <MenuItem value="all">All Dates</MenuItem>
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="thisWeek">This Week</MenuItem>
            </TextField>
          </Grid>

          {/* ✅ separate the chips */}
          <Grid item xs={12}>
            <Divider sx={{ my: 1.5 }} />

            <Box className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ minWidth: 110 }}
              >
                Quick Status:
              </Typography>

              {/* ✅ more gap between chips */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                <Chip
                  size="small"
                  label="All"
                  clickable
                  color={filterStatus === "All" ? "primary" : "default"}
                  onClick={() => setFilterStatus("All")}
                />
                {STATUS.map((s) => (
                  <Chip
                    key={s}
                    size="small"
                    label={s}
                    clickable
                    color={filterStatus === s ? "primary" : "default"}
                    onClick={() => setFilterStatus(s)}
                  />
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
