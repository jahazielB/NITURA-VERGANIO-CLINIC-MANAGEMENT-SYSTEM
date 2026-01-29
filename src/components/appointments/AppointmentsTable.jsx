import React from "react";
import {
  Box,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Typography,
  Tooltip,
  IconButton,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DoneIcon from "@mui/icons-material/Done";
import EditIcon from "@mui/icons-material/Edit";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import StatusChip from "./StatusChip";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  APPT_STATUS,
  toHumanDate,
  toHumanTime,
} from "../helpers/appointmentHelpers";

export default function AppointmentsTable({
  rows,
  onStart,
  onDone,
  onEdit,
  onCancel,
  onDelete,
}) {
  return (
    <TableContainer sx={{ overflowX: "auto" }}>
      <Table size="small" sx={{ minWidth: 1050 }}>
        <TableHead>
          <TableRow className="bg-slate-100">
            <TableCell>Time In</TableCell>
            <TableCell>Patient</TableCell>
            <TableCell>Reason</TableCell>
            <TableCell>Doctor</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id} hover>
              <TableCell>
                <Box className="flex flex-col">
                  <span className="font-semibold">
                    {toHumanDate(r.date)} {toHumanTime(r.time)}
                  </span>
                  {r.isWalkIn && (
                    <span className="text-xs text-slate-500">Walk-in</span>
                  )}
                </Box>
              </TableCell>

              <TableCell>
                <Box className="flex flex-col gap-1">
                  <span className="font-semibold">{r.patientName}</span>
                  {r.isWalkIn && (
                    <Chip
                      size="small"
                      label="Walk-in"
                      sx={{ width: "fit-content" }}
                    />
                  )}
                  {r.contact && (
                    <Typography variant="caption" color="text.secondary">
                      {r.contact}
                    </Typography>
                  )}
                </Box>
              </TableCell>

              <TableCell>{r.reason || "—"}</TableCell>
              <TableCell>{r.doctor || "—"}</TableCell>

              <TableCell>
                <StatusChip status={r.status} />
              </TableCell>

              <TableCell align="right">
                <Box className="flex justify-end items-center gap-1 flex-wrap">
                  {r.status === APPT_STATUS.WAITING && (
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<PlayArrowIcon />}
                      onClick={() => onStart(r)}
                    >
                      Start
                    </Button>
                  )}

                  {r.status === APPT_STATUS.IN_CONSULT && (
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<DoneIcon />}
                      onClick={() => onDone(r)}
                    >
                      Done
                    </Button>
                  )}

                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => onEdit(r)}
                  >
                    Edit
                  </Button>

                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={() => onCancel(r)}
                    startIcon={<MoreHorizIcon />}
                  >
                    More
                  </Button>

                  {/* ✅ Delete icon */}
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDelete?.(r)}
                      aria-label="delete appointment"
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}

          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} align="center">
                No records found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
