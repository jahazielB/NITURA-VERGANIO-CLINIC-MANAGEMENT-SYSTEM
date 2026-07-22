import {
  Card,
  CardContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  TablePagination,
  Box,
  Button,
  Chip,
  Typography,
  CircularProgress,
} from "@mui/material";

const statusColor = (s) => {
  if (s === "Ready") return "info";
  if (s === "Reviewed") return "success";
  return "default";
};

const formatDateFull = (iso) => {
  if (!iso) return "N/A";
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};
const formatDateTime = (s) => {
  if (!s) return "N/A";
  const [d, t] = s.replace("T", " ").split(" ");
  const [y, m, day] = d.split("-");
  let [h, min] = t.split(":");
  h = +h;
  return `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1]} ${+day}, ${y} ${h % 12 || 12}:${min}${h >= 12 ? "pm" : "am"}`;
};

export default function LabReviewTable({
  rows,
  loading,
  totalCount,
  page,
  rowsPerPage,
  onPageChange,
  onOpenChart,
  onView,
}) {
  return (
    <Card className="rounded-2xl shadow">
      <CardContent>
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table size="small" sx={{ minWidth: 1100 }}>
            <TableHead>
              <TableRow className="bg-slate-100">
                <TableCell>Date Requested</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Test Type</TableCell>
                <TableCell>Released</TableCell>
                <TableCell>Released By</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No lab results found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell>{formatDateFull(r.requestedDate)}</TableCell>
                    <TableCell>{r.patientName || "N/A"}</TableCell>
                    <TableCell>{r.testType || "N/A"}</TableCell>
                    <TableCell>{formatDateTime(r.releasedDate)}</TableCell>
                    <TableCell>{r.releasedBy || "N/A"}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={r.status || "N/A"}
                        color={statusColor(r.status)}
                      />
                    </TableCell>

                    <TableCell align="right">
                      <Box className="flex justify-end gap-1 flex-wrap">
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => onView(r)}
                        >
                          View
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
                ))
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
