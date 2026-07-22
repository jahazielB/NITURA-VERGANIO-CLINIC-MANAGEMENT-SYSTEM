import {
  Card,
  CardContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Box,
  Button,
  IconButton,
  Avatar,
  TableContainer,
  TablePagination,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditIcon from "@mui/icons-material/Edit";
import KeyIcon from "@mui/icons-material/Key";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { useState } from "react";
import {
  fullName,
  fmtCreatedAt,
  roleColor,
  statusColor,
} from "./helper/accountHelpers";

export default function AccountsTable({
  rows,
  page,
  rowsPerPage,
  loading,
  error,
  onPageChange,
  onRowsPerPageChange,
  onView,
  onEdit,
  onResetPassword,
  onToggleStatus,
}) {
  const [toggleTarget, setToggleTarget] = useState(null);
  const [toggling, setToggling] = useState(false);

  const pageRows = rows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const handleToggleClick = (u) => {
    setToggleTarget(u);
  };

  const handleToggleConfirm = async () => {
    if (!toggleTarget) return;
    setToggling(true);
    try {
      await onToggleStatus(toggleTarget);
    } finally {
      setToggling(false);
      setToggleTarget(null);
    }
  };

  return (
    <Card className="rounded-2xl shadow">
      <CardContent>
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table size="small" sx={{ minWidth: 1000 }}>
            <TableHead>
              <TableRow className="bg-slate-100">
                <TableCell>Name</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created at</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {pageRows.map((u) => (
                <TableRow key={u.id} hover>
                  <TableCell>
                    <Box className="flex items-center gap-2">
                      <Avatar
                        sx={{ width: 28, height: 28 }}
                        src={u.avatarUrl || ""}
                      >
                        {fullName(u)?.[0] || "U"}
                      </Avatar>
                      <Box>
                        <Box className="font-semibold">{fullName(u)}</Box>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Chip
                      size="small"
                      label={u.role}
                      color={roleColor(u.role)}
                    />
                  </TableCell>

                  <TableCell>{u.email || "—"}</TableCell>

                  <TableCell>
                    <Chip
                      size="small"
                      label={u.status}
                      color={statusColor(u.status)}
                    />
                  </TableCell>

                  <TableCell>{fmtCreatedAt(u.createdAt)}</TableCell>

                  <TableCell align="right">
                    <Box className="flex justify-end gap-1 flex-wrap">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityOutlinedIcon />}
                        onClick={() => onView(u)}
                      >
                        View
                      </Button>

                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => onEdit(u)}
                      >
                        Edit
                      </Button>

                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<KeyIcon />}
                        onClick={() => onResetPassword(u)}
                      >
                        Reset
                      </Button>

                      <Tooltip
                        title={
                          u.status === "Active"
                            ? "Disable account"
                            : "Enable account"
                        }
                      >
                        <IconButton onClick={() => handleToggleClick(u)}>
                          {u.status === "Active" ? (
                            <BlockIcon />
                          ) : (
                            <CheckCircleIcon />
                          )}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}

              {loading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Loading accounts...
                  </TableCell>
                </TableRow>
              )}

              {!loading && error && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Failed to load accounts
                  </TableCell>
                </TableRow>
              )}

              {!loading && !error && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No accounts found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={rows.length}
          page={page}
          onPageChange={(_, p) => onPageChange(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) =>
            onRowsPerPageChange(Number(e.target.value))
          }
          rowsPerPageOptions={[5, 10, 25]}
        />
      </CardContent>

      <Dialog
        open={Boolean(toggleTarget)}
        onClose={() => !toggling && setToggleTarget(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          {toggleTarget?.status === "Active"
            ? "Disable Account"
            : "Enable Account"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {toggleTarget?.status === "Active"
              ? `Are you sure you want to disable "${fullName(toggleTarget)}"? They will not be able to log in.`
              : `Are you sure you want to enable "${fullName(toggleTarget)}"? They will regain access.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setToggleTarget(null)}
            variant="outlined"
            disabled={toggling}
          >
            Cancel
          </Button>
          <Button
            onClick={handleToggleConfirm}
            variant="contained"
            color="error"
            disabled={toggling}
            startIcon={toggling ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {toggling
              ? toggleTarget?.status === "Active"
                ? "Disabling..."
                : "Enabling..."
              : toggleTarget?.status === "Active"
                ? "Disable"
                : "Enable"}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
