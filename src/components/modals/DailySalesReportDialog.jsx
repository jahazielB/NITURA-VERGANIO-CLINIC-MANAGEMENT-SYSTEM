import { supabase } from "../../lib/supabaseClient";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { useEffect, useState, useRef, useCallback } from "react";
import dayjs from "dayjs";

import { money, statusColor } from "../helpers/billingHelpers";
import { DatePicker } from "@mui/x-date-pickers";

export default function DailySalesReportDialog({ open, onClose }) {
  // =========================
  // MODE (NEW)
  // =========================
  const [mode, setMode] = useState("single"); // single | range

  const [singleDate, setSingleDate] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);

  const [summary, setSummary] = useState(null);
  const [invoice, setInvoice] = useState([]);

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const observerRef = useRef(null);
  const PAGE_SIZE = 10;

  // =========================
  // RESET ON FILTER CHANGE
  // =========================
  useEffect(() => {
    if (!open) return;

    setInvoice([]);
    setPage(0);
    setHasMore(true);
    setSummary(null);
  }, [singleDate, dateRange, mode, open]);

  // reset when switching mode
  useEffect(() => {
    setSingleDate(null);
    setDateRange([null, null]);
  }, [mode]);

  // =========================
  // STYLES
  // =========================
  const datePickerSx = {
    width: 180,
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      backgroundColor: "#fff",
      fontSize: 13,
    },
    "& .MuiOutlinedInput-root:hover": {
      backgroundColor: "#f9fafb",
    },
    "& .MuiOutlinedInput-root.Mui-focused": {
      boxShadow: "0 0 0 3px rgba(59,130,246,0.15)",
    },
  };

  const calendarSlots = {
    paper: {
      sx: {
        borderRadius: 3,
        boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
        border: "1px solid #e5e7eb",
        "& .MuiPickersDay-root": {
          borderRadius: 2,
        },
        "& .Mui-selected": {
          backgroundColor: "#2563eb !important",
        },
      },
    },
  };

  // =========================
  // FETCH (INFINITE SCROLL SAFE)
  // =========================
  const fetchData = useCallback(async () => {
    if (!open || loading || !hasMore) return;

    setLoading(true);

    let start = null;
    let end = null;

    if (mode === "single" && singleDate) {
      start = singleDate.format("YYYY-MM-DD");
      end = start;
    }

    if (mode === "range" && dateRange[0] && dateRange[1]) {
      start = dayjs(dateRange[0]).format("YYYY-MM-DD");
      end = dayjs(dateRange[1]).format("YYYY-MM-DD");
    }

    const { data, error } = await supabase.rpc("get_billings_dashboard_v2", {
      p_start: start,
      p_end: end,
      p_limit: PAGE_SIZE,
      p_offset: page * PAGE_SIZE,
    });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    if (page === 0) setSummary(data?.summary);

    const rows = data?.rows || [];

    setInvoice((prev) => (page === 0 ? rows : [...prev, ...rows]));

    if (rows.length < PAGE_SIZE) setHasMore(false);

    setLoading(false);
  }, [page, mode, singleDate, dateRange, open, loading, hasMore]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // =========================
  // INFINITE SCROLL
  // =========================
  useEffect(() => {
    const el = observerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading) {
          setPage((p) => p + 1);
        }
      },
      { threshold: 1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  const dateLabel =
    mode === "single"
      ? singleDate?.format("MMM DD, YYYY") || "Select date"
      : dateRange[0] && dateRange[1]
        ? `${dateRange[0].format("MMM DD")} → ${dateRange[1].format(
            "MMM DD, YYYY",
          )}`
        : "Select range";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      {/* HEADER */}
      <DialogTitle className="flex justify-between items-center">
        <Box>
          <Typography fontWeight={700}>Sales Report</Typography>
          <Chip
            label={dateLabel}
            size="small"
            sx={{ mt: 1, fontWeight: 600 }}
          />
        </Box>

        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            mb: 3,
            p: 1.5,
            border: "1px solid #e5e7eb",
            borderRadius: 2,
            backgroundColor: "#fafafa",
            flexWrap: "wrap",
          }}
        >
          {/* LEFT SIDE: TOGGLE + DATE */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            {/* TOGGLE */}
            <Box
              sx={{
                display: "flex",
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <Button
                size="small"
                onClick={() => setMode("single")}
                variant={mode === "single" ? "contained" : "text"}
                sx={{
                  textTransform: "none",
                  fontSize: 12,
                  borderRadius: 0,
                  px: 2,
                }}
              >
                Single
              </Button>

              <Button
                size="small"
                onClick={() => setMode("range")}
                variant={mode === "range" ? "contained" : "text"}
                sx={{
                  textTransform: "none",
                  fontSize: 12,
                  borderRadius: 0,
                  px: 2,
                }}
              >
                Range
              </Button>
            </Box>

            {/* DATE PICKERS */}
            {mode === "single" && (
              <DatePicker
                value={singleDate}
                onChange={(val) => setSingleDate(val)}
                slotProps={{
                  textField: {
                    size: "small",
                    sx: {
                      width: 180,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                        backgroundColor: "#fff",
                        fontSize: 13,
                      },
                    },
                  },
                }}
              />
            )}

            {mode === "range" && (
              <>
                <DatePicker
                  value={dateRange[0]}
                  onChange={(val) => setDateRange([val, dateRange[1]])}
                  slotProps={{
                    textField: {
                      size: "small",
                      sx: {
                        width: 150,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "10px",
                          backgroundColor: "#fff",
                          fontSize: 13,
                        },
                      },
                    },
                  }}
                />

                <Typography sx={{ color: "#9ca3af" }}>→</Typography>

                <DatePicker
                  value={dateRange[1]}
                  onChange={(val) => setDateRange([dateRange[0], val])}
                  slotProps={{
                    textField: {
                      size: "small",
                      sx: {
                        width: 150,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "10px",
                          backgroundColor: "#fff",
                          fontSize: 13,
                        },
                      },
                    },
                  }}
                />
              </>
            )}
          </Box>

          {/* RIGHT SIDE: ACTIONS */}
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button size="small" variant="contained">
              Print
            </Button>

            <Button size="small" variant="outlined">
              Export
            </Button>
          </Box>
        </Box>

        {/* =========================
    SUMMARY CARDS (RESTORED)
   ========================= */}
        <Box className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          {/* SUBTOTAL */}
          <Box className="border rounded-xl p-3">
            <Typography variant="caption" color="text.secondary">
              Subtotal
            </Typography>
            <Typography fontWeight={700}>
              {money(summary?.total_subtotal) || 0}
            </Typography>
          </Box>

          {/* DISCOUNT */}
          <Box className="border rounded-xl p-3">
            <Typography variant="caption" color="text.secondary">
              Discount
            </Typography>
            <Typography fontWeight={700}>
              {money(summary?.total_discount) || 0}
            </Typography>
          </Box>

          {/* TOTAL (NET) */}
          <Box className="border rounded-xl p-3 bg-slate-50">
            <Typography variant="caption" color="text.secondary">
              Total (Net)
            </Typography>
            <Typography fontWeight={800} className="text-slate-900">
              {money(summary?.total_total) || 0}
            </Typography>
          </Box>

          {/* OUTSTANDING */}
          <Box className="border rounded-xl p-3">
            <Typography variant="caption" color="text.secondary">
              Outstanding
            </Typography>
            <Typography fontWeight={700}>
              {money(summary?.total_balance) || 0}
            </Typography>
          </Box>
        </Box>

        {/* TABLE */}
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Patient</TableCell>
              <TableCell align="right">Subtotal</TableCell>
              <TableCell align="right">Discount</TableCell>
              <TableCell align="right">Paid</TableCell>
              <TableCell align="right">Balance</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {invoice.map((inv) => (
              <TableRow key={inv.id} hover>
                <TableCell>{inv.id?.slice(0, 5)}</TableCell>
                <TableCell>
                  {new Date(inv.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>{inv.patient_name}</TableCell>
                <TableCell align="right">{money(inv.subtotal)}</TableCell>
                <TableCell align="right">{money(inv.discount_total)}</TableCell>
                <TableCell align="right">{money(inv.paid_total)}</TableCell>
                <TableCell align="right">{money(inv.balance)}</TableCell>
                <TableCell>
                  <Chip size="small" label={inv.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* OBSERVER */}
        <Box ref={observerRef} sx={{ height: 40 }} />

        {loading && (
          <Typography align="center" fontSize={12}>
            Loading...
          </Typography>
        )}

        {!hasMore && (
          <Typography align="center" fontSize={12}>
            No more data
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
