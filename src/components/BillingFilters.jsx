import {
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Box,
  Chip,
  Typography,
  InputAdornment,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Search, FilterList, RestartAlt } from "@mui/icons-material";
import { STATUS, todayISO } from "./helpers/billingHelpers";

export default function BillingFilters({
  search,
  setSearch,
  filterStatus,
  setFilterStatus,
  quickDate,
  setQuickDate,
}) {
  const handleReset = () => {
    setQ("");
    setFilterStatus("All");
    setQuickDate("all");
  };

  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
      }}
    >
      <CardContent sx={{ py: 1, px: 1.5 }}>
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Box display="flex" alignItems="center" gap={0.5}>
            <FilterList color="primary" fontSize="small" />
            <Typography variant="subtitle2" fontWeight={700}>
              Filter Invoices
            </Typography>
          </Box>

          <Tooltip title="Reset Filters">
            <IconButton onClick={handleReset} size="small">
              <RestartAlt fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Grid container spacing={1.5}>
          {/* Search */}
          <Grid item xs={12} md={7}>
            <TextField
              placeholder="Search patient, invoice..."
              size="small"
              fullWidth
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: "text.secondary", fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                bgcolor: "grey.50",
                borderRadius: 2,
                "& fieldset": { border: "none" },
                border: "1px solid #e0e0e0",
              }}
            />
          </Grid>

          {/* Timeline (kept readable) */}
          <Grid item xs={12} md={5}>
            <TextField
              select
              label="Timeline"
              size="small"
              fullWidth
              value={quickDate}
              onChange={(e) => setQuickDate(e.target.value)}
            >
              <MenuItem value="all">All Dates</MenuItem>
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="thisWeek">This Week</MenuItem>
            </TextField>
          </Grid>

          {/* Status */}
          <Grid item xs={12}>
            <Box
              display="flex"
              alignItems="center"
              gap={0.5}
              flexWrap="wrap"
              mt={0.5}
            >
              <Typography
                variant="caption"
                fontWeight={600}
                color="text.secondary"
              >
                Status:
              </Typography>

              <Chip
                size="small"
                label="All"
                onClick={() => setFilterStatus("All")}
                variant={filterStatus === "All" ? "filled" : "outlined"}
                color={filterStatus === "All" ? "primary" : "default"}
              />

              {STATUS.map((s) => (
                <Chip
                  key={s}
                  size="small"
                  label={s}
                  onClick={() => setFilterStatus(s)}
                  variant={filterStatus === s ? "filled" : "outlined"}
                  color={filterStatus === s ? "primary" : "default"}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
