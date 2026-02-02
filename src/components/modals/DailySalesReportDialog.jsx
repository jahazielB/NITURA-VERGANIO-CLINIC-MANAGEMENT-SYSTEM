import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  Box,
  Typography,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PrintIcon from "@mui/icons-material/Print";
import DownloadIcon from "@mui/icons-material/Download";

import { useEffect, useMemo, useState } from "react";
import {
  todayISO,
  money,
  computeInvoiceTotals,
  isBetweenInclusive,
  startOfWeekISO,
  endOfWeekISO,
} from "../helpers/billingHelpers";

export default function DailySalesReportDialog({
  open,
  onClose,
  invoices = [],
}) {
  const [rangeMode, setRangeMode] = useState("today"); // today | thisWeek | custom
  const [start, setStart] = useState(todayISO());
  const [end, setEnd] = useState(todayISO());

  useEffect(() => {
    if (!open) return;

    if (rangeMode === "today") {
      const t = todayISO();
      setStart(t);
      setEnd(t);
    }
    if (rangeMode === "thisWeek") {
      setStart(startOfWeekISO());
      setEnd(endOfWeekISO());
    }
  }, [open, rangeMode]);

  const reportRows = useMemo(() => {
    return invoices
      .filter((inv) => inv.status !== "Voided")
      .filter((inv) => isBetweenInclusive(inv.date, start, end))
      .map((inv) => {
        const t = computeInvoiceTotals(inv);
        return { inv, t };
      })
      .sort((a, b) => String(b.inv.date).localeCompare(String(a.inv.date)));
  }, [invoices, start, end]);

  const summary = useMemo(() => {
    const s = {
      invoiceCount: 0,
      totalCharges: 0,
      totalDiscounts: 0,
      totalNet: 0,
      totalCollected: 0,
      totalOutstanding: 0,
      unpaidCount: 0,
      partialCount: 0,
      paidCount: 0,
    };

    reportRows.forEach(({ inv, t }) => {
      s.invoiceCount += 1;
      s.totalCharges += t.subtotal;
      s.totalDiscounts += t.discount;
      s.totalNet += t.total;
      s.totalCollected += t.paid; // UI-only assumption: paid belongs to invoice date
      s.totalOutstanding += t.balance;

      if (inv.status === "Unpaid") s.unpaidCount += 1;
      if (inv.status === "Partial") s.partialCount += 1;
      if (inv.status === "Paid") s.paidCount += 1;
    });

    return s;
  }, [reportRows]);

  const printReport = () => alert("Print report layout coming soon (UI-only).");
  const exportReport = () => alert("Export CSV/PDF coming soon (UI-only).");

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle className="flex items-center justify-between">
        Daily Sales Report
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Range Controls */}
        <Box className="flex flex-col md:flex-row gap-2 md:items-end md:justify-between">
          <Box className="flex flex-col sm:flex-row gap-2">
            <TextField
              select
              size="small"
              label="Range"
              value={rangeMode}
              onChange={(e) => setRangeMode(e.target.value)}
              sx={{ minWidth: 160 }}
            >
              <option value="today">Today</option>
              <option value="thisWeek">This Week</option>
              <option value="custom">Custom</option>
            </TextField>

            <TextField
              size="small"
              type="date"
              label="Start"
              value={start}
              onChange={(e) => {
                setRangeMode("custom");
                setStart(e.target.value);
              }}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              size="small"
              type="date"
              label="End"
              value={end}
              onChange={(e) => {
                setRangeMode("custom");
                setEnd(e.target.value);
              }}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <Box className="flex gap-2">
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={printReport}
            >
              Print
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={exportReport}
            >
              Export
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Summary */}
        <Box className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Box className="rounded-2xl border border-slate-200 p-3">
            <Typography variant="body2" color="text.secondary">
              Total Collected
            </Typography>
            <Typography variant="h6" fontWeight={900}>
              {money(summary.totalCollected)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {start} → {end}
            </Typography>
          </Box>

          <Box className="rounded-2xl border border-slate-200 p-3">
            <Typography variant="body2" color="text.secondary">
              Outstanding Balance (within range)
            </Typography>
            <Typography variant="h6" fontWeight={900}>
              {money(summary.totalOutstanding)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Net billed: {money(summary.totalNet)}
            </Typography>
          </Box>

          <Box className="rounded-2xl border border-slate-200 p-3">
            <Typography variant="body2" color="text.secondary">
              Invoice Counts
            </Typography>
            <Box className="flex flex-wrap gap-1 mt-1">
              <Chip
                size="small"
                label={`Unpaid: ${summary.unpaidCount}`}
                color="warning"
              />
              <Chip
                size="small"
                label={`Partial: ${summary.partialCount}`}
                color="info"
              />
              <Chip
                size="small"
                label={`Paid: ${summary.paidCount}`}
                color="success"
              />
              <Chip size="small" label={`Total: ${summary.invoiceCount}`} />
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Table */}
        <Typography fontWeight={900} sx={{ mb: 1 }}>
          Invoices in Range
        </Typography>

        <Table size="small">
          <TableHead>
            <TableRow className="bg-slate-100">
              <TableCell>Invoice #</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Patient</TableCell>
              <TableCell align="right">Net</TableCell>
              <TableCell align="right">Paid</TableCell>
              <TableCell align="right">Balance</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {reportRows.map(({ inv, t }) => (
              <TableRow key={inv.id} hover>
                <TableCell className="font-semibold">{inv.id}</TableCell>
                <TableCell>{inv.date}</TableCell>
                <TableCell>{inv.patientName}</TableCell>
                <TableCell align="right">{money(t.total)}</TableCell>
                <TableCell align="right">{money(t.paid)}</TableCell>
                <TableCell align="right">{money(t.balance)}</TableCell>
                <TableCell>{inv.status}</TableCell>
              </TableRow>
            ))}

            {reportRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No invoices found for this range.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </DialogContent>

      <DialogActions className="px-6 py-4">
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
