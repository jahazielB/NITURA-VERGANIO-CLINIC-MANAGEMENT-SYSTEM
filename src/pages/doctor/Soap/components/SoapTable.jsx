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

export default function SoapTable({ rows, onContinue, onView, onPrint }) {
  return (
    <Card className="rounded-2xl shadow">
      <CardContent>
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table size="small" sx={{ minWidth: 1050 }}>
              <TableHead>
                <TableRow className="bg-slate-100">
                  <TableCell>Patient</TableCell>
                  <TableCell>Date/Time</TableCell>
                  <TableCell>Chief Complaint</TableCell>
                  <TableCell>Last Updated</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell className="font-semibold">
                      {r.patientName}
                    </TableCell>
                    <TableCell>{r.dateTime}</TableCell>
                    <TableCell>{r.chiefComplaint}</TableCell>
                    <TableCell>{r.lastUpdated}</TableCell>
                    <TableCell align="right">
                      <Box className="flex justify-end gap-1 flex-wrap">
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => onContinue(r)}
                        >
                          Open
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
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No SOAP notes found
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
