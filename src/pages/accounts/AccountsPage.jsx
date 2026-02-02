import { Box, Button, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useMemo, useState } from "react";

import AccountsSummaryCards from "./AccountSummaryCards";
import AccountsFilters from "./AccountsFilter";
import AccountsTable from "./AccountsTable";
import AccountDialog from "./AccountsDialog";
import ResetPasswordDialog from "./ResetPasswordDialog";

import { fullName } from "./helper/accountHelpers";

export default function AccountsPage() {
  // ✅ UI-only mock data
  const [accounts, setAccounts] = useState([
    {
      id: 1,
      firstName: "Kevin",
      lastName: "Fines",
      role: "Doctor",
      email: "kevin@clinic.com",
      username: "kevin",
      status: "Active",
      lastLogin: "02/01/2026 10:20",
      staffId: "DR-0001",
      avatarUrl: "",
    },
    {
      id: 2,
      firstName: "Maria",
      lastName: "Santos",
      role: "Admin",
      email: "admin1@clinic.com",
      username: "admin1",
      status: "Active",
      lastLogin: "02/01/2026 09:15",
      staffId: "AD-0001",
      avatarUrl: "",
    },
    {
      id: 3,
      firstName: "Pedro",
      lastName: "Reyes",
      role: "Med Tech",
      email: "pedro@clinic.com",
      username: "pedro",
      status: "Active",
      lastLogin: "01/31/2026 16:00",
      staffId: "MT-0001",
      avatarUrl: "",
    },
    {
      id: 4,
      firstName: "Ana",
      lastName: "Lim",
      role: "Nurse",
      email: "ana@clinic.com",
      username: "ana",
      status: "Active",
      lastLogin: "01/31/2026 08:45",
      staffId: "NR-0001",
      avatarUrl: "",
    },
    {
      id: 5,
      firstName: "Carlos",
      lastName: "Gomez",
      role: "Admin",
      email: "admin2@clinic.com",
      username: "admin2",
      status: "Disabled",
      lastLogin: "2 weeks ago",
      staffId: "AD-0002",
      avatarUrl: "",
    },
  ]);

  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [openForm, setOpenForm] = useState(false);
  const [selected, setSelected] = useState(null);

  const [openReset, setOpenReset] = useState(false);
  const [resetTarget, setResetTarget] = useState(null);

  // pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    const out = accounts
      .filter((a) => (roleFilter === "All" ? true : a.role === roleFilter))
      .filter((a) =>
        statusFilter === "All" ? true : a.status === statusFilter,
      )
      .filter((a) => {
        if (!qq) return true;
        return (
          fullName(a).toLowerCase().includes(qq) ||
          (a.email || "").toLowerCase().includes(qq) ||
          (a.username || "").toLowerCase().includes(qq) ||
          String(a.staffId || "")
            .toLowerCase()
            .includes(qq)
        );
      });

    // if filter changes, reset pagination
    return out;
  }, [accounts, q, roleFilter, statusFilter]);

  const summary = useMemo(() => {
    const total = accounts.length;
    const active = accounts.filter((a) => a.status === "Active").length;
    const disabled = accounts.filter((a) => a.status === "Disabled").length;
    return { total, active, disabled };
  }, [accounts]);

  const openNew = () => {
    setSelected(null);
    setOpenForm(true);
  };

  const openEdit = (acc) => {
    setSelected(acc);
    setOpenForm(true);
  };

  const upsertAccount = (payload) => {
    setAccounts((prev) => {
      if (!payload.id) {
        const id = Date.now();
        return [{ ...payload, id }, ...prev];
      }
      return prev.map((x) => (x.id === payload.id ? payload : x));
    });
  };

  const onDelete = (acc) => {
    if (!confirm(`Delete account for ${fullName(acc)}?`)) return;
    setAccounts((prev) => prev.filter((x) => x.id !== acc.id));
  };

  const onToggleStatus = (acc) => {
    const nextStatus = acc.status === "Active" ? "Disabled" : "Active";
    const msg =
      nextStatus === "Disabled"
        ? `Disable ${fullName(acc)}? They won't be able to login.`
        : `Enable ${fullName(acc)}?`;

    if (!confirm(msg)) return;

    setAccounts((prev) =>
      prev.map((x) => (x.id === acc.id ? { ...x, status: nextStatus } : x)),
    );
  };

  const onResetPassword = (acc) => {
    setResetTarget(acc);
    setOpenReset(true);
  };

  const confirmReset = (tempPassword) => {
    // UI-only: store the latest temp password on the account (optional)
    setAccounts((prev) =>
      prev.map((x) => (x.id === resetTarget.id ? { ...x, tempPassword } : x)),
    );
    setOpenReset(false);
    alert(
      `Temporary password generated for ${fullName(resetTarget)} (UI-only).`,
    );
  };

  // keep pagination sane when filters shrink list
  const safePage = Math.min(
    page,
    Math.max(0, Math.ceil(filtered.length / rowsPerPage) - 1),
  );
  if (safePage !== page) setPage(safePage);

  return (
    <Box className="space-y-4 p-5.5">
      {/* Header */}
      <Box className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Box>
          <Typography variant="h6" className="font-bold">
            Accounts
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create staff accounts for Admin, Doctor, Med Tech, and Nurse.
          </Typography>
        </Box>

        <Button variant="contained" startIcon={<AddIcon />} onClick={openNew}>
          New Account
        </Button>
      </Box>

      {/* Summary */}
      <AccountsSummaryCards
        total={summary.total}
        active={summary.active}
        disabled={summary.disabled}
      />

      {/* Filters */}
      <AccountsFilters
        q={q}
        setQ={(v) => {
          setQ(v);
          setPage(0);
        }}
        roleFilter={roleFilter}
        setRoleFilter={(v) => {
          setRoleFilter(v);
          setPage(0);
        }}
        statusFilter={statusFilter}
        setStatusFilter={(v) => {
          setStatusFilter(v);
          setPage(0);
        }}
      />

      {/* Table */}
      <AccountsTable
        rows={filtered}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={(n) => {
          setRowsPerPage(n);
          setPage(0);
        }}
        onEdit={openEdit}
        onResetPassword={onResetPassword}
        onToggleStatus={onToggleStatus}
        onDelete={onDelete}
      />

      {/* Dialogs */}
      <AccountDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        account={selected}
        onSave={(payload) => {
          upsertAccount(payload);
          setOpenForm(false);
        }}
      />

      <ResetPasswordDialog
        open={openReset}
        onClose={() => setOpenReset(false)}
        account={resetTarget}
        onConfirm={confirmReset}
      />
    </Box>
  );
}
