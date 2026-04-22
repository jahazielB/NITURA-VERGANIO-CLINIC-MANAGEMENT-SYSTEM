import {
  Dialog,
  DialogTitle,
  IconButton,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Button,
  Box,
  InputAdornment,
  Divider,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PaymentsIcon from "@mui/icons-material/Payments";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

import { defaultVisitDateTime } from "../helpers/dateHelper";
import CustomSnackbar from "./CustomSnackBar";

import { useEffect, useMemo, useState } from "react";
import {
  computeInvoiceTotals,
  computeNextStatus,
  money,
} from "../helpers/billingHelpers";

export default function PaymentDialog({ open, onClose, invoice, onSave }) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Cash");
  const [ref, setRef] = useState("");
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "",
  });
  const isPaid = invoice?.total <= 0;

  useEffect(() => {
    if (open) {
      setAmount(invoice?.balance > 0 ? String(invoice?.balance) : "");
      setMethod("Cash");
      setRef("");
    }
  }, [open, invoice?.total]);

  if (!invoice) return null;

  const handleSave = async () => {
    setSaving(true);
    const pay = Number(amount);
    if (!pay || pay <= 0) {
      setSnackbar({
        ...snackbar,
        open: true,
        severity: "error",
        message: "Invalid amount",
      });
      return setSaving(false);
    }
    if (pay > invoice?.balance) {
      setSnackbar({
        ...snackbar,
        open: true,
        severity: "warning",
        message: "Payment exceeds balance",
      });
      return setSaving(false);
    }

    const payload = { amount: amount, method: method };

    await onSave(payload);
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          gap: 1,
          bgcolor: "#f8f9fa",
        }}
      >
        <PaymentsIcon color="primary" />
        <Box sx={{ flex: 1, fontWeight: 800, fontSize: "1.25rem" }}>
          Checkout
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2 }}>
        {/* COMPACT SUMMARY CARD */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 1.5,
            mb: 2,
            borderRadius: 2,
            bgcolor: isPaid ? "#e8f5e9" : "#fff3e0",
            border: "1px solid",
            borderColor: isPaid ? "success.light" : "warning.light",
          }}
        >
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={700}
              sx={{ display: "block" }}
            >
              REMAINING BALANCE
            </Typography>
            <Typography
              variant="h5"
              fontWeight={900}
              color={isPaid ? "success.main" : "error.main"}
            >
              {money(invoice?.balance)}
            </Typography>
          </Box>
          <Box textAlign="right">
            <Typography variant="caption" color="text.secondary">
              Inv #{invoice.id.slice(0, 5)}
            </Typography>
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{ display: "block" }}
            >
              {invoice.status}
            </Typography>
          </Box>
        </Box>

        {/* INPUT GRID */}
        <Box sx={{ display: "grid", gap: 2 }}>
          <TextField
            fullWidth
            autoFocus
            label="Payment Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isPaid}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">$</InputAdornment>
              ),
              sx: { fontSize: "1.2rem", fontWeight: 700 },
            }}
          />

          <Box sx={{ display: "flex", gap: 1 }}>
            {["Cash", "GCash", "Card"].map((m) => (
              <Button
                key={m}
                variant={method === m ? "contained" : "outlined"}
                onClick={() => setMethod(m)}
                sx={{ flex: 1, py: 1, fontWeight: 700 }}
                disabled={isPaid}
              >
                {m}
              </Button>
            ))}
          </Box>

          {/* QUICK CHIPS */}
          {!isPaid && (
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="text"
                size="small"
                onClick={() => setAmount(invoice.balance)}
              >
                Exact Amount
              </Button>
              <Button
                variant="text"
                size="small"
                onClick={() => setAmount((invoice.balance / 2).toFixed(2))}
              >
                Half
              </Button>
            </Box>
          )}
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2, bgcolor: "#f8f9fa" }}>
        <Button onClick={onClose} sx={{ color: "text.secondary" }}>
          Dismiss
        </Button>
        <Button
          fullWidth
          onClick={handleSave}
          variant="contained"
          size="large"
          disabled={isPaid || saving}
          sx={{ py: 1.5, fontWeight: 800, borderRadius: 2, boxShadow: 3 }}
          startIcon={
            saving ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <AccountBalanceWalletIcon />
            )
          }
        >
          {saving ? "Saving payment" : `Confirm ${method} Payment`}
        </Button>
      </DialogActions>
      <CustomSnackbar
        open={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Dialog>
  );
}
