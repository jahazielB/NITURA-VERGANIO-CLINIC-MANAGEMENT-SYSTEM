import {
  Dialog,
  DialogTitle,
  IconButton,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { fullName, fmtCreatedAt } from "./helper/accountHelpers";

const asTrimmedString = (value) =>
  typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : "";

export default function AccountDetailsDialog({ open, onClose, account }) {
  if (!account) return null;

  const prcLicenseNumber = asTrimmedString(account.prcLicenseNumber);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle className="flex items-center justify-between">
        Account Details
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Full Name"
              size="small"
              fullWidth
              value={fullName(account)}
              InputProps={{ readOnly: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Role"
              size="small"
              fullWidth
              value={account.role || "—"}
              InputProps={{ readOnly: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Email"
              size="small"
              fullWidth
              value={account.email || "—"}
              InputProps={{ readOnly: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Status"
              size="small"
              fullWidth
              value={account.status || "—"}
              InputProps={{ readOnly: true }}
            />
          </Grid>

          {prcLicenseNumber ? (
            <Grid item xs={12} sm={6}>
              <TextField
                label="PRC License Number"
                size="small"
                fullWidth
                value={prcLicenseNumber}
                InputProps={{ readOnly: true }}
              />
            </Grid>
          ) : null}

          <Grid item xs={12} sm={6}>
            <TextField
              label="Created at"
              size="small"
              fullWidth
              value={fmtCreatedAt(account.createdAt)}
              InputProps={{ readOnly: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <Box className="text-xs text-slate-500">
              Read-only account details. Use Edit to update the profile.
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions className="px-6 py-4">
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
