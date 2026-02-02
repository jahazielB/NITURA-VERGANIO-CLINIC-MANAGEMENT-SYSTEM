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

export default function AccountDialog({ open, onClose, onSave, account }) {
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (!open) return;

    if (account) {
      setForm(JSON.parse(JSON.stringify(account)));
      return;
    }

    setForm({
      id: null,
      firstName: "",
      lastName: "",
      role: "Doctor",
      email: "",
      username: "",
      status: "Active",
      staffId: "",
      tempPassword: generateTempPassword(),
      requireChangePassword: true,
      avatarUrl: "",
      lastLogin: "",
    });
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

  const submit = () => {
    if (!form.firstName.trim() || !form.lastName.trim())
      return alert("Enter first and last name.");
    if (!form.email.trim() && !form.username.trim())
      return alert("Enter email or username.");

    onSave({
      ...form,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      username: form.username.trim(),
      role: form.role,
      status: form.status,
      staffId: form.staffId.trim(),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle className="flex items-center justify-between">
        {account ? "Edit Account" : "New Account"}
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="First Name"
              size="small"
              fullWidth
              value={form.firstName}
              onChange={(e) => setField("firstName", e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Last Name"
              size="small"
              fullWidth
              value={form.lastName}
              onChange={(e) => setField("lastName", e.target.value)}
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

          <Grid item xs={12} sm={4}>
            <TextField
              label="Username"
              size="small"
              fullWidth
              value={form.username}
              onChange={(e) => setField("username", e.target.value)}
              placeholder="optional"
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Staff ID (optional)"
              size="small"
              fullWidth
              value={form.staffId}
              onChange={(e) => setField("staffId", e.target.value)}
              placeholder="e.g., DR-0001"
            />
          </Grid>

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

          {/* Permissions preview */}
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" fontWeight={900} sx={{ mb: 1 }}>
              Permissions Preview (Role-based)
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
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
              sx={{ display: "block", mt: 1 }}
            >
              *This is UI-only preview for now. Actual access control can be
              implemented later.
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions className="px-6 py-4">
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={submit} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
