import {
  Card,
  CardContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Box,
  Button,
  Typography,
} from "@mui/material";

export default function RxTable({ rows, onOpenChart, onView, onPrint }) {
  return (
    <Card className="rounded-2xl shadow">
      <CardContent>
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table size="small" sx={{ minWidth: 1050 }}>
            <TableHead>
              <TableRow className="bg-slate-100">
                <TableCell>Rx ID</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Date/Time</TableCell>
                <TableCell>Visit ID</TableCell>
                <TableCell>Diagnosis</TableCell>
                <TableCell>Medicines</TableCell>
                <TableCell>Last Updated</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell className="font-semibold">{r.id}</TableCell>
                  <TableCell>{r.patientName}</TableCell>
                  <TableCell>{r.dateTime}</TableCell>
                  <TableCell>{r.visitId}</TableCell>
                  <TableCell>{r.diagnosis}</TableCell>
                  <TableCell>{r.medsSummary}</TableCell>
                  <TableCell>{r.lastUpdated}</TableCell>

                  <TableCell align="right">
                    <Box className="flex justify-end gap-1 flex-wrap">
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => onOpenChart(r)}
                      >
                        Open Chart
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => onView(r)}
                      >
                        View
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => onPrint(r)}
                      >
                        Print
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}

              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No prescriptions found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
