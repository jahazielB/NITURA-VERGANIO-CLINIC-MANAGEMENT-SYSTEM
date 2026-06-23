import {
  Dialog,
  DialogTitle,
  IconButton,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  MenuItem,
  Box,
  Typography,
  Divider,
  Chip,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";

import { useEffect, useMemo, useState } from "react";
import {
  ROLES,
  permissionsByRole,
  generateTempPassword,
} from "./helper/accountHelpers";

const normalizeRole = (role) => {
  if (role === "MedTech") return "Med Tech";
  return ROLES.includes(role) ? role : "Doctor";
};

const asTrimmedString = (value) =>
  typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : "";

export default function AccountDialog({
  open,
  onClose,
  onSave,
  account,
  saving = false,
}) {
  const [form, setForm] = useState(null);
  const showPrcLicenseNumber =
    form?.role === "Doctor" || form?.role === "Med Tech";

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;

      if (!open) {
        setForm(null);
        return;
      }

      if (account) {
        setForm({
          id: null,
          status: "Active",
          tempPassword: generateTempPassword(),
          requireChangePassword: true,
          createdAt: "",
          ...JSON.parse(JSON.stringify(account)),
          role: normalizeRole(account?.role),
          full_name: asTrimmedString(account?.full_name),
          prcLicenseNumber: asTrimmedString(account?.prcLicenseNumber),
        });
        return;
      }

      setForm({
        id: null,
        full_name: "",
        role: "Doctor",
        email: "",
        status: "Active",
        prcLicenseNumber: "",
        tempPassword: generateTempPassword(),
        requireChangePassword: true,
        createdAt: "",
      });
    });

    return () => {
      cancelled = true;
    };
  }, [open, account]);

  const perms = useMemo(() => permissionsByRole(form?.role), [form?.role]);

  if (!form) return null;

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied!");
    } catch {
      alert("Copy not supported in this browser.");
    }
  };

  const submit = async () => {
    if (!form.full_name.trim()) return alert("Enter full name.");
    if (!form.email.trim()) return alert("Enter email.");

    await onSave({
      ...form,
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      role: form.role,
      prcLicenseNumber: asTrimmedString(form.prcLicenseNumber),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ px: 2, py: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6">{account ? "Edit Account" : "New Account"}</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ px: 2, py: 1.5 }}>
        <Grid container spacing={1}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Full Name"
              size="small"
              fullWidth
              value={form.full_name}
              onChange={(e) => setField("full_name", e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              select
              label="Role"
              size="small"
              fullWidth
              value={form.role}
              onChange={(e) => setField("role", e.target.value)}
            >
              {ROLES.map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Email"
              size="small"
              fullWidth
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="name@clinic.com"
            />
          </Grid>

          {showPrcLicenseNumber && (
            <Grid item xs={12} sm={4}>
              <TextField
                label="PRC License Number"
                size="small"
                fullWidth
                value={form.prcLicenseNumber}
                onChange={(e) => setField("prcLicenseNumber", e.target.value)}
                placeholder="e.g., 1234567"
              />
            </Grid>
          )}

          <Grid item xs={12} sm={4}>
            <TextField
              select
              label="Status"
              size="small"
              fullWidth
              value={form.status}
              onChange={(e) => setField("status", e.target.value)}
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Disabled">Disabled</MenuItem>
            </TextField>
          </Grid>

          {account ? (
            <Grid item xs={12} sm={4}>
              <TextField
                label="Temp Password"
                size="small"
                fullWidth
                value={form.tempPassword}
                onChange={(e) => setField("tempPassword", e.target.value)}
                InputProps={{
                  endAdornment: (
                    <Box className="flex items-center gap-1">
                      <IconButton
                        size="small"
                        onClick={() =>
                          setField("tempPassword", generateTempPassword())
                        }
                        title="Generate"
                      >
                        <AutoFixHighIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => copy(form.tempPassword)}
                        title="Copy"
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ),
                }}
              />
            </Grid>
          ) : null}

          <Grid item xs={12}>
            <Divider sx={{ my: 0.5 }} />
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
              Permissions Preview (Role-based)
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {Object.entries(perms).map(([k, v]) => (
                <Chip
                  key={k}
                  size="small"
                  label={k}
                  color={v ? "success" : "default"}
                />
              ))}
            </Box>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 0.5 }}
            >
              *UI-only preview. Actual access control to be implemented later.
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 2, py: 1 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={submit} variant="contained" disabled={saving}>
          {saving ? (
            <>
              <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
              Saving...
            </>
          ) : (
            "Save"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
