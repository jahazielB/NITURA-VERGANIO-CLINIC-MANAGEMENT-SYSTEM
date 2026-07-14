import { useState } from "react";
import {
  Card,
  CardContent,
  Chip,
  Divider,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Box,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PrintIcon from "@mui/icons-material/Print";

const formatDate = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function RxTable({
  rows,
  loading,
  totalCount,
  page,
  rowsPerPage,
  onPageChange,
  onOpenChart,
  onView,
}) {
  const [filter, setFilter] = useState(1);

  const filtered = (rows || []).filter((r) => {
    if (filter === 1) return r.isActive === true;
    if (filter === 2) return r.isActive !== true;
    return true;
  });

  const activeCount = (rows || []).filter((r) => r.isActive === true).length;

  const paginated = filtered.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage,
  );

  return (
    <Card className="rounded-2xl shadow">
      <Box className="flex items-center justify-between px-2">
        <Typography variant="h6" className="font-bold px-2 py-2">
          {activeCount} Active Prescriptions
        </Typography>
        <Tabs value={filter} onChange={(_, v) => setFilter(v)}>
          <Tab label="All" />
          <Tab label="Active" />
          <Tab label="Past" />
        </Tabs>
      </Box>
      <Divider />

      <CardContent>
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table size="small" sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow className="bg-slate-100">
                <TableCell>Visit</TableCell>
                <TableCell>Prescribed</TableCell>
                <TableCell>Prescribed by</TableCell>
                <TableCell>Medications</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No prescriptions found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((r) => {
                  const meds = r.prescription_items || [];
                  const firstMed = meds[0]?.medication || "No Medication";
                  const medsCount = meds.length;

                  return (
                    <TableRow key={r.id} hover>
                      <TableCell>
                        <Typography className="font-semibold">
                          {formatDate(r.visitDate)}
                        </Typography>
                      </TableCell>

                      <TableCell>{formatDate(r.prescribedDate)}</TableCell>

                      <TableCell>Dr. {r.prescribedByName}</TableCell>

                      <TableCell>
                        <Typography className="font-semibold">
                          {firstMed}
                        </Typography>
                        {medsCount > 1 && (
                          <Typography variant="body2" color="text.secondary">
                            +{medsCount - 1} more
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={r.isActive ? "Active" : "Inactive"}
                          size="small"
                          color={r.isActive ? "success" : "default"}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Box className="flex justify-end gap-1 flex-wrap">
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<VisibilityIcon />}
                            onClick={() => onView(r)}
                          >
                            View
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<PrintIcon />}
                            onClick={() =>
                              alert(
                                "Print prescription feature coming soon",
                              )
                            }
                          >
                            Print
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => onOpenChart(r)}
                          >
                            Open Chart
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {!loading && (
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={onPageChange}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[rowsPerPage]}
          />
        )}
      </CardContent>
    </Card>
  );
}
