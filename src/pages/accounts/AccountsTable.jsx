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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import KeyIcon from "@mui/icons-material/Key";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import {
  fullName,
  fmtLastLogin,
  roleColor,
  statusColor,
} from "./helper/accountHelpers";

export default function AccountsTable({
  rows,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onResetPassword,
  onToggleStatus,
  onDelete,
}) {
  const pageRows = rows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <Card className="rounded-2xl shadow">
      <CardContent>
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table size="small" sx={{ minWidth: 1000 }}>
            <TableHead>
              <TableRow className="bg-slate-100">
                <TableCell>Name</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Email / Username</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Login</TableCell>
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
                        {u.firstName?.[0] || "U"}
                      </Avatar>
                      <Box>
                        <Box className="font-semibold">{fullName(u)}</Box>
                        <Box className="text-xs text-slate-500">
                          {u.staffId || "—"}
                        </Box>
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

                  <TableCell>{u.email || u.username || "—"}</TableCell>

                  <TableCell>
                    <Chip
                      size="small"
                      label={u.status}
                      color={statusColor(u.status)}
                    />
                  </TableCell>

                  <TableCell>{fmtLastLogin(u.lastLogin)}</TableCell>

                  <TableCell align="right">
                    <Box className="flex justify-end gap-1 flex-wrap">
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
                        <IconButton onClick={() => onToggleStatus(u)}>
                          {u.status === "Active" ? (
                            <BlockIcon />
                          ) : (
                            <CheckCircleIcon />
                          )}
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete account">
                        <IconButton color="error" onClick={() => onDelete(u)}>
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}

              {rows.length === 0 && (
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
    </Card>
  );
}
