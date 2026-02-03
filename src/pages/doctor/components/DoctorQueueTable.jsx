import {
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Box,
  Button,
  TablePagination,
} from "@mui/material";

import { useLocation } from "react-router-dom";

const statusColor = (s) => {
  if (s === "Waiting") return "warning";
  if (s === "In Consult") return "info";
  if (s === "Done") return "success";
  return "default";
};

export default function DoctorQueueTable({
  rows,
  onStart,
  onOpenChart,
  onDone,
}) {
  const location = useLocation();
  return (
    <Card className="p-2 h-full rounded-2xl shadow-2xl">
      <CardContent>
        <Box className="flex justify-between items-center mb-2">
          <Typography className="font-extrabold">My Queue Today</Typography>
          <Typography
            className="cursor-pointer underline"
            onClick={() => alert("See all queue (mock)")}
          >
            See all
          </Typography>
        </Box>

        <Table size="small">
          <TableHead>
            <TableRow className="bg-slate-100">
              <TableCell>Patient</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell className="font-semibold">{row.patient}</TableCell>
                <TableCell>{row.time}</TableCell>
                <TableCell>{row.reason}</TableCell>
                <TableCell>
                  <Chip
                    label={row.status}
                    size="small"
                    color={statusColor(row.status)}
                  />
                </TableCell>
                <TableCell align="right">
                  <Box className="flex justify-end gap-1 flex-wrap">
                    {/* <Button
                      size="small"
                      variant="outlined"
                      onClick={() => onOpenChart(row)}
                    >
                      Open Chart
                    </Button> */}

                    <Button
                      size="small"
                      variant="contained"
                      disabled={row.status !== "Waiting"}
                      onClick={() => onStart(row)}
                    >
                      Start
                    </Button>

                    <Button
                      size="small"
                      variant="outlined"
                      disabled={row.status === "Done"}
                      onClick={() => onDone(row)}
                    >
                      Done
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}

            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No patients in queue
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      {location.pathname === "/doctor/queue" && <TablePagination />}
    </Card>
  );
}
