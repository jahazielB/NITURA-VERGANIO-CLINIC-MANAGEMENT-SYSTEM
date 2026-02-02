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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PaymentsIcon from "@mui/icons-material/Payments";
import { useEffect, useMemo, useState } from "react";
import {
  computeInvoiceTotals,
  computeNextStatus,
  money,
} from "../helpers/billingHelpers";

export default function PaymentDialog({ open, onClose, invoice, onSave }) {
  const [amount, setAmount] = useState("");

  const c = useMemo(() => computeInvoiceTotals(invoice || {}), [invoice]);

  useEffect(() => {
    if (!open) return;
    setAmount(c.balance ? String(c.balance) : "");
  }, [open, c.balance]);

  if (!invoice) return null;

  const submit = () => {
    const add = Number(amount || 0);
    if (add <= 0) return alert("Enter payment amount.");
    if (invoice.status === "Voided")
      return alert("Cannot pay a voided invoice.");

    const nextPaid = Number(invoice.paid || 0) + add;
    const next = { ...invoice, paid: nextPaid };
    next.status = computeNextStatus(next);

    onSave(next);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle className="flex items-center justify-between">
        Record Payment (Invoice #{invoice.id})
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box className="space-y-2">
          <Typography>
            Total: <b>{money(c.total)}</b>
          </Typography>
          <Typography>
            Paid so far: <b>{money(c.paid)}</b>
          </Typography>
          <Typography>
            Balance: <b>{money(c.balance)}</b>
          </Typography>

          <TextField
            label="Payment Amount"
            fullWidth
            size="small"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
            sx={{ mt: 2 }}
          />
        </Box>
      </DialogContent>

      <DialogActions className="px-6 py-4">
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={submit}
          variant="contained"
          startIcon={<PaymentsIcon />}
        >
          Save Payment
        </Button>
      </DialogActions>
    </Dialog>
  );
}
