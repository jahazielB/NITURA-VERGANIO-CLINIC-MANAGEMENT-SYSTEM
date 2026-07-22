import { Alert, Box, Button, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useCallback, useEffect, useMemo, useState } from "react";

import { supabase } from "../../lib/supabaseClient";
import AccountsSummaryCards from "./AccountSummaryCards";
import AccountsFilters from "./AccountsFilter";
import AccountsTable from "./AccountsTable";
import AccountDialog from "./AccountsDialog";
import AccountDetailsDialog from "./AccountDetailsDialog";
import ResetPasswordDialog from "./ResetPasswordDialog";
import TemporaryPasswordDialog from "./TemporaryPasswordDialog";
import CustomSnackbar from "../../components/modals/CustomSnackBar";

import { fullName } from "./helper/accountHelpers";

const readEdgeFunctionErrorMessage = async (error) => {
  const fallback =
    "Unable to update account status. Please contact the administrator.";

  try {
    const text = await error?.context?.text?.();
    const body = text ? JSON.parse(text) : null;
    return body?.error || fallback;
  } catch (parseError) {
    console.error("Failed to parse Edge Function error response:", parseError);
    return fallback;
  }
};

const normalizeRole = (role) => {
  if (role === "MedTech") return "Med Tech";
  return role || "";
};

const normalizeAccount = (row) => {
  const rawStatus = row?.is_active;
  const status =
    rawStatus === true || rawStatus === "Active"
      ? "Active"
      : rawStatus === false || rawStatus === "Disabled"
        ? "Disabled"
        : String(rawStatus || "Active");

  return {
    id: row?.id,
    full_name: row?.full_name ?? "",
    role: normalizeRole(row?.role),
    email: row?.email ?? "",
    status,
    createdAt: row?.created_at ?? "",
    prcLicenseNumber: row?.lic ?? "",
  };
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [openForm, setOpenForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [savingAccount, setSavingAccount] = useState(false);

  const [openDetails, setOpenDetails] = useState(false);
  const [detailsTarget, setDetailsTarget] = useState(null);

  const [tempPasswordAccount, setTempPasswordAccount] = useState(null);

  const [openReset, setOpenReset] = useState(false);
  const [resetTarget, setResetTarget] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("user_profiles")
      .select("*");

    if (fetchError) {
      console.error("Failed to load accounts:", fetchError);
      setAccounts([]);
      setError(fetchError.message || "Failed to load accounts.");
      setLoading(false);
      return;
    }

    const normalized = (data || [])
      .map(normalizeAccount)
      .sort((a, b) => fullName(a).localeCompare(fullName(b)));

    setAccounts(normalized);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

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
          String(a.role || "")
            .toLowerCase()
            .includes(qq)
        );
      });

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

  const openDetailsDialog = (acc) => {
    setDetailsTarget(acc);
    setOpenDetails(true);
  };

  const onToggleStatus = (acc) => {
    const nextStatus = acc.status === "Active" ? "Disabled" : "Active";
    const nextIsActive = nextStatus === "Active";

    return supabase.functions
      .invoke("toggle-user-status", {
        body: {
          userId: acc.id,
          isActive: nextIsActive,
        },
      })
      .then(async ({ data, error }) => {
        if (error) {
          throw new Error(await readEdgeFunctionErrorMessage(error));
        }

        if (!data?.success) {
          throw new Error(
            data?.error ||
              "Unable to update account status. Please contact the administrator.",
          );
        }

        await loadAccounts();
        showSnackbar(
          data?.isActive
            ? "Account enabled successfully."
            : "Account disabled successfully.",
          "success",
        );
      })
      .catch((err) => {
        showSnackbar(
          err instanceof Error
            ? err.message
            : "Unable to update account status. Please contact the administrator.",
          "error",
        );
      });
  };

  const onResetPassword = (acc) => {
    setResetTarget(acc);
    setOpenReset(true);
  };

  const confirmReset = async () => {
    const acc = resetTarget;
    if (!acc) return;

    try {
      const { data, error } = await supabase.functions.invoke(
        "reset-password",
        {
          body: { userId: acc.id },
        },
      );

      if (error) {
        throw new Error(await readEdgeFunctionErrorMessage(error));
      }
      if (!data?.success) {
        throw new Error(
          data?.error ||
            "Unable to reset password. Please contact the administrator.",
        );
      }

      setOpenReset(false);
      setTempPasswordAccount({
        fullName: fullName(acc),
        email: acc.email,
        password: data.tempPassword || "",
      });
      showSnackbar("Password reset successfully.", "success");
    } catch (err) {
      console.error("Reset Password Error", err);
      showSnackbar(
        err instanceof Error
          ? err.message
          : "Unable to reset password. Please contact the administrator.",
        "error",
      );
    }
  };

  const handleSaveAccount = async (payload) => {
    if (selected) {
      try {
        setSavingAccount(true);

        const { data, error } = await supabase.functions.invoke(
          "update-user",
          {
            body: {
              userId: payload.id,
              full_name: payload.full_name,
              email: payload.email,
              role: payload.role,
              lic: payload.prcLicenseNumber || null,
            },
          },
        );

        if (error) {
          throw new Error(await readEdgeFunctionErrorMessage(error));
        }
        if (!data?.success) {
          throw new Error(
            data?.error ||
              "Unable to update account. Please contact the administrator.",
          );
        }

        await loadAccounts();
        setOpenForm(false);
        showSnackbar("Account updated successfully.", "success");
      } catch (err) {
        console.error("Update User Error", err);
        showSnackbar(
          err instanceof Error
            ? err.message
            : "Unable to update account. Please contact the administrator.",
          "error",
        );
      } finally {
        setSavingAccount(false);
      }

      return;
    }

    try {
      setSavingAccount(true);

      const body = {
        full_name: payload.full_name,
        email: payload.email,
        role: payload.role,
        lic: payload.prcLicenseNumber || null,
      };

      const { data, error } = await supabase.functions.invoke("create-user", {
        body,
      });

      if (error) {
        let message =
          "Unable to create account. Please contact the administrator.";

        try {
          const text = await error.context.text();
          const body = JSON.parse(text);

          if (body?.error) {
            message = body.error;
          }
        } catch (parseError) {
          console.error(
            "Failed to parse Edge Function error response:",
            parseError,
          );
        }

        throw new Error(message);
      }
      if (!data?.success) {
        throw new Error(data?.error || "Unable to create the account.");
      }

      await loadAccounts();
      setTempPasswordAccount({
        fullName: payload.full_name,
        email: payload.email,
        password: data.tempPassword || "",
      });
      setOpenForm(false);
      showSnackbar(
        `Account for ${payload.full_name} was created successfully.`,
        "success",
      );
    } catch (err) {
      showSnackbar(
        err instanceof Error ? err.message : "Unable to create the account.",
        "error",
      );
    } finally {
      setSavingAccount(false);
    }
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

      {error ? <Alert severity="error">{error}</Alert> : null}

      {/* Table */}
      <AccountsTable
        rows={filtered}
        page={page}
        rowsPerPage={rowsPerPage}
        loading={loading}
        error={error}
        onPageChange={setPage}
        onRowsPerPageChange={(n) => {
          setRowsPerPage(n);
          setPage(0);
        }}
        onView={openDetailsDialog}
        onEdit={openEdit}
        onResetPassword={onResetPassword}
        onToggleStatus={onToggleStatus}
      />

      {/* Dialogs */}
      <AccountDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        account={selected}
        onSave={handleSaveAccount}
        saving={savingAccount}
      />

      <AccountDetailsDialog
        open={openDetails}
        onClose={() => setOpenDetails(false)}
        account={detailsTarget}
      />

      <TemporaryPasswordDialog
        open={Boolean(tempPasswordAccount)}
        onClose={() => setTempPasswordAccount(null)}
        fullName={tempPasswordAccount?.fullName}
        email={tempPasswordAccount?.email}
        password={tempPasswordAccount?.password}
      />

      <ResetPasswordDialog
        open={openReset}
        onClose={() => setOpenReset(false)}
        account={resetTarget}
        onConfirm={confirmReset}
      />

      <CustomSnackbar
        open={snackbar.open}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Box>
  );
}
