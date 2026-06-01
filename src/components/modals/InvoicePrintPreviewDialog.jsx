import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  GlobalStyles,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { supabase } from "../../lib/supabaseClient";
import { money } from "../helpers/billingHelpers";
import NVLogo from "../../assets/NV-logo.png";

const CLINIC_INFO = {
  logoSrc: NVLogo,
  name: "Nitura-Verganio Medical Clinic and Laboratory",
  address: "Damortis, Santo Tomas, La Union",
  contact: "0912-345-6789",
};

const formatInvoiceDate = (dateValue) => {
  if (!dateValue) return "N/A";
  return new Date(dateValue).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const formatPrintedTimestamp = (dateValue) => {
  return new Date(dateValue).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function InvoicePrintPreviewDialog({
  open,
  onClose,
  invoiceId,
}) {
  const [loading, setLoading] = useState(false);
  const [printedAt, setPrintedAt] = useState(new Date());
  const [payload, setPayload] = useState({
    billing: null,
    items: [],
    payments: [],
  });

  useEffect(() => {
    if (!open || !invoiceId) return;

    const loadInvoicePreview = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase.rpc("get_billing_details", {
          p_billing_id: invoiceId,
        });

        if (error) throw error;

        setPayload({
          billing: data?.billing || null,
          items: data?.items || [],
          payments: data?.payments || [],
        });
      } catch (err) {
        console.error("Failed to load invoice print preview:", err);
        setPayload({
          billing: null,
          items: [],
          payments: [],
        });
      } finally {
        setLoading(false);
      }
    };

    loadInvoicePreview();
  }, [open, invoiceId]);

  const totals = useMemo(() => {
    const items = payload.items || [];
    const billing = payload.billing || {};
    const subtotal =
      billing?.subtotal ??
      items.reduce((acc, item) => {
        const amount =
          Number(
            item?.amount ??
              Number(item?.qty || 0) * Number(item?.unit_price || 0),
          ) || 0;
        return amount > 0 ? acc + amount : acc;
      }, 0);

    const discount = Number(billing?.discount_total || 0);
    const total = Number(
      billing?.total ?? Math.max(0, Number(subtotal) - discount),
    );
    const paid =
      Number(billing?.paid_total || 0) ||
      (payload.payments || []).reduce(
        (acc, payment) =>
          acc + Number(payment?.amount || payment?.paid_amount || 0),
        0,
      );
    const balance = Number(billing?.balance ?? Math.max(0, total - paid));

    return { subtotal, discount, total, paid, balance };
  }, [payload]);

  const rowItems = useMemo(() => {
    return (payload.items || []).map((item, index) => {
      const qty = Number(item?.qty || 0);
      const unitPrice = Number(item?.unit_price || 0);
      const computedAmount = qty * unitPrice;
      const amount = Number(item?.amount ?? computedAmount);

      return {
        id: item?.id || `${item?.item_type || "item"}-${index}`,
        itemType: item?.item_type || "Service",
        description: item?.description || "-",
        qty,
        unitPrice,
        amount,
      };
    });
  }, [payload.items]);

  const billing = payload.billing || {};
  const handlePrint = () => {
    setPrintedAt(new Date());
    window.setTimeout(() => {
      window.print();
    }, 0);
  };

  return (
    <>
      <GlobalStyles
        styles={{
          "@page": {
            size: "A4",
            margin: "12mm",
          },
          "@media print": {
            "html, body": {
              background: "#fff !important",
              margin: 0,
              padding: 0,
              color: "#000 !important",
            },
            "body *": {
              visibility: "hidden",
            },
            ".invoice-print-area, .invoice-print-area *": {
              visibility: "visible",
              color: "#000 !important",
            },
            ".invoice-print-area": {
              position: "absolute",
              left: 0,
              top: 0,
              width: "100%",
              maxWidth: "186mm",
              margin: "0 auto",
            },
            ".invoice-print-area .MuiPaper-root": {
              boxShadow: "none !important",
              border: "1px solid #000 !important",
              padding: "8mm !important",
              margin: "0 auto !important",
              backgroundColor: "#fff !important",
            },
            ".invoice-print-area .MuiTypography-root": {
              color: "#000 !important",
            },
            ".invoice-print-area .MuiChip-root": {
              border: "1px solid #000",
            },
            ".invoice-print-area table": {
              pageBreakInside: "auto",
              borderCollapse: "collapse",
            },
            ".invoice-print-area thead": {
              display: "table-header-group",
            },
            ".invoice-print-area tr, .invoice-print-area td, .invoice-print-area th":
              {
                pageBreakInside: "avoid",
                breakInside: "avoid",
                borderColor: "#000 !important",
              },
            ".invoice-print-area .no-print": {
              display: "none !important",
            },
            ".MuiDialog-root, .MuiDialog-container, .MuiBackdrop-root": {
              position: "static !important",
              display: "block !important",
              background: "transparent !important",
            },
            ".MuiDialog-paper": {
              maxWidth: "none !important",
              width: "100% !important",
              margin: "0 !important",
              overflow: "visible !important",
            },
          },
        }}
      />
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          sx: {
            width: "100%",
            maxWidth: {
              xs: "100%",
              md: "1080px",
            },
          },
        }}
      >
        <DialogContent
          dividers
          className="invoice-print-area"
          sx={{
            p: {
              xs: 2,
              md: 3,
            },
            backgroundColor: "#f8fafc",
          }}
        >
          {loading ? (
            <Box
              sx={{
                minHeight: 320,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Stack spacing={2} alignItems="center">
                <CircularProgress />
                <Typography variant="body2" color="text.secondary">
                  Loading invoice preview...
                </Typography>
              </Stack>
            </Box>
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: {
                  xs: 2,
                  md: 4,
                },
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Grid container spacing={2} alignItems="center" mb={3}>
                <Grid item xs={12} sm={8}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      component="img"
                      src={CLINIC_INFO.logoSrc}
                      alt="Clinic logo"
                      sx={{
                        width: {
                          xs: 54,
                          sm: 64,
                        },
                        height: {
                          xs: 54,
                          sm: 64,
                        },
                        objectFit: "contain",
                      }}
                    />
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        {CLINIC_INFO.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {CLINIC_INFO.address}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Contact: {CLINIC_INFO.contact}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Box textAlign={{ xs: "left", sm: "right" }}>
                    <Typography variant="h5" fontWeight={700}>
                      INVOICE
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      className="no-print"
                    >
                      Preview Only
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Grid container spacing={2} mb={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary">
                    Invoice Number
                  </Typography>
                  <Typography fontWeight={600}>
                    {billing?.id ? billing.id.slice(0, 8) : "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary">
                    Invoice Date
                  </Typography>
                  <Typography fontWeight={600}>
                    {formatInvoiceDate(billing?.created_at)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary">
                    Patient Name
                  </Typography>
                  <Typography fontWeight={600}>
                    {billing?.patient_name || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary">
                    Invoice Status
                  </Typography>
                  <Box mt={0.5}>
                    <Chip
                      size="small"
                      label={billing?.status || "Unknown"}
                      color={
                        billing?.status === "Paid"
                          ? "success"
                          : billing?.status === "Partial"
                            ? "info"
                            : billing?.status === "Unpaid"
                              ? "warning"
                              : "default"
                      }
                    />
                  </Box>
                </Grid>
              </Grid>

              <Table
                size="small"
                sx={{ border: "1px solid", borderColor: "divider" }}
              >
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f1f5f9" }}>
                    <TableCell>Item Type</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell align="right">Unit Price</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rowItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          py={2}
                        >
                          No invoice items found.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    rowItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.itemType}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell align="right">{item.qty}</TableCell>
                        <TableCell align="right">
                          {money(item.unitPrice)}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            color:
                              item.amount < 0 ? "error.main" : "text.primary",
                          }}
                        >
                          {money(item.amount)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              <Box
                mt={3}
                display="flex"
                justifyContent="flex-end"
                sx={{
                  width: "100%",
                }}
              >
                <Box sx={{ width: { xs: "100%", sm: 320 } }}>
                  <SummaryRow label="Subtotal" value={totals.subtotal} />
                  <SummaryRow
                    label="Discount"
                    value={totals.discount}
                    color="error.main"
                  />
                  <SummaryRow
                    label="Total"
                    value={totals.total}
                    bold
                    withTopBorder
                  />
                  <SummaryRow label="Paid" value={totals.paid} />
                  <SummaryRow label="Balance" value={totals.balance} bold />
                </Box>
              </Box>

              <Box
                mt={4}
                pt={2}
                sx={{
                  borderTop: "1px dashed",
                  borderColor: "divider",
                }}
              >
                <Typography variant="body2" textAlign="center">
                  Thank you for trusting our clinic.
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  textAlign="center"
                  mt={0.5}
                >
                  Printed: {formatPrintedTimestamp(printedAt)}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  textAlign="center"
                  mt={0.25}
                >
                  Generated by system
                </Typography>
              </Box>
            </Paper>
          )}
        </DialogContent>
        <DialogActions className="no-print" sx={{ px: 3, py: 2 }}>
          <Button variant="outlined" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="contained"
            onClick={handlePrint}
            disabled={loading || !billing?.id}
          >
            Print
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function SummaryRow({
  label,
  value,
  color = "text.primary",
  bold = false,
  withTopBorder = false,
}) {
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      py={0.7}
      sx={{
        borderTop: withTopBorder ? "1px solid" : "none",
        borderColor: withTopBorder ? "divider" : "transparent",
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        fontWeight={bold ? 700 : 500}
      >
        {label}
      </Typography>
      <Typography variant="body2" color={color} fontWeight={bold ? 700 : 500}>
        {money(value)}
      </Typography>
    </Box>
  );
}
