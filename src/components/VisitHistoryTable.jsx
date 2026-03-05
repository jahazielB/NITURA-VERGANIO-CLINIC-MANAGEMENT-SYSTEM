import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import { useState } from "react";
import VisitDetailsModal from "./modals/VisitDetailsModal";

export default function VisitHistoryTable({ rows }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="rounded-2xl shadow-2xl">
      <CardContent>
        <Typography className="font-semibold mb-3">Visit History</Typography>

        {/* ✅ TableContainer prevents layout breaking on small screens */}
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table size="small" sx={{ minWidth: 720 }}>
            <TableHead>
              <TableRow className="bg-slate-100">
                <TableCell>Date</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows?.map((r) => {
                const doctor = r.doctor;
                return (
                  <TableRow key={r.id} hover>
                    <TableCell>
                      {new Date(r.created_at).toLocaleDateString("en-US")}
                    </TableCell>
                    <TableCell>{doctor?.full_name}</TableCell>
                    <TableCell>{r.chief_complaint}</TableCell>
                    <TableCell align="right">
                      <Box className="flex justify-end gap-1">
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<VisibilityIcon />}
                          onClick={() => setOpen(true)}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<EditIcon />}
                          onClick={() => setOpen(true)}
                        >
                          Edit
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}

              {rows?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No visits found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <VisitDetailsModal open={open} onClose={() => setOpen(false)} />
      </CardContent>
    </Card>
  );
}
