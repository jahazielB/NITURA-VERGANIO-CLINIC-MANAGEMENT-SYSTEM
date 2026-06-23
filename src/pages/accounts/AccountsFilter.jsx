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
import { ROLES, STATUSES } from "./helper/accountHelpers";

export default function AccountsFilters({
  q,
  setQ,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
}) {
  return (
    <Card className="rounded-2xl shadow">
      <CardContent>
        <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>
          Filters
        </Typography>

        <Grid container spacing={3} alignItems="flex-start">
          <Grid item xs={12} md={4}>
            <TextField
              label="Search"
              size="small"
              fullWidth
              placeholder="Name, email..."
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="All">All Status</MenuItem>
              {STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1.5 }} />
            <Box className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ minWidth: 110 }}
              >
                Quick:
              </Typography>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                <Chip
                  size="small"
                  label="All"
                  clickable
                  color={
                    roleFilter === "All" && statusFilter === "All"
                      ? "primary"
                      : "default"
                  }
                  onClick={() => {
                    setRoleFilter("All");
                    setStatusFilter("All");
                  }}
                />

                {ROLES.map((r) => (
                  <Chip
                    key={r}
                    size="small"
                    label={r}
                    clickable
                    color={roleFilter === r ? "primary" : "default"}
                    onClick={() => setRoleFilter(r)}
                  />
                ))}

                {STATUSES.map((s) => (
                  <Chip
                    key={s}
                    size="small"
                    label={s}
                    clickable
                    color={statusFilter === s ? "primary" : "default"}
                    onClick={() => setStatusFilter(s)}
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
