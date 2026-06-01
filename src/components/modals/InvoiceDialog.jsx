import {
  Dialog,
  DialogTitle,
  IconButton,
  DialogContent,
  Grid,
  TextField,
  MenuItem,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  Button,
  DialogActions,
  Chip,
  CircularProgress,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import { useEffect, useMemo, useState } from "react";

import { supabase } from "../../lib/supabaseClient";

import { money } from "../helpers/billingHelpers";
import { defaultVisitDateTime } from "../helpers/dateHelper";

export default function InvoiceDialog({
  open,
  onClose,
  invoice,
  onSaved,
  setSnack,
  refetchSummary,
  refetchData,
}) {
  const [form, setForm] = useState(null);

  const [loading, setLoading] = useState(false);

  const [loadingInvoice, setLoadingInvoice] = useState(false);

  const isEdit = !!invoice;

  const ITEM_TYPES = [
    "Consultation",
    "Lab",
    "Medication",
    "Service",
    "Other",
    "Discount",
  ];

  const isPartial = form?.status === "Partial";

  const isPaid = form?.status === "Paid";

  const isLocked = isPaid || form?.status === "Voided";

  // =========================================
  // LOAD INVOICE
  // =========================================

  useEffect(() => {
    if (!open) return;

    const loadInvoice = async () => {
      try {
        setLoadingInvoice(true);

        if (!invoice?.id) return;

        const { data, error } = await supabase.rpc("get_billing_details", {
          p_billing_id: invoice.id,
        });

        if (error) throw error;

        const billing = data?.billing;

        setForm({
          id: billing?.id,

          visit_id: billing?.visit_id,

          patientId: billing?.patient_id,

          patientName: billing?.patient_name,

          date: billing?.created_at?.slice(0, 10),

          status: billing?.status,

          subtotal: billing?.subtotal || 0,

          discount_total: billing?.discount_total || 0,

          total: billing?.total || 0,

          notes: billing?.notes || "",

          items: (data?.items || []).map((x) => ({
            id: x.id,

            item_type: x.item_type || "Service",

            description: x.description,

            qty: x.qty,

            price: x.unit_price,
          })),
        });
      } catch (err) {
        console.error(err);

        alert(err.message);
      } finally {
        setLoadingInvoice(false);
      }
    };

    loadInvoice();
  }, [open, invoice]);

  // =========================================
  // COMPUTED TOTALS
  // =========================================

  const totals = useMemo(() => {
    const subtotal = (form?.items || [])
      .filter((x) => x.item_type !== "Discount")
      .reduce((acc, item) => {
        return acc + Number(item.qty || 0) * Number(item.price || 0);
      }, 0);

    const discount = (form?.items || [])
      .filter((x) => x.item_type === "Discount")
      .reduce((acc, item) => {
        return acc + Math.abs(Number(item.qty || 0) * Number(item.price || 0));
      }, 0);

    return {
      subtotal,

      discount,

      total: Math.max(0, subtotal - discount),
    };
  }, [form]);

  // =========================================
  // LOADING
  // =========================================

  if (!form || loadingInvoice) {
    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <Box className="h-[250px] flex items-center justify-center">
          <CircularProgress />
        </Box>
      </Dialog>
    );
  }

  // =========================================
  // HELPERS
  // =========================================

  const setField = (key, value) => {
    setForm((prev) => ({
      ...prev,

      [key]: value,
    }));
  };

  const addItem = () => {
    setForm((prev) => ({
      ...prev,

      items: [
        ...prev.items,

        {
          id: Date.now(),

          item_type: "Consultation",

          description: "",

          qty: 1,

          price: 0,
        },
      ],
    }));
  };

  const addDiscount = () => {
    setForm((prev) => ({
      ...prev,

      items: [
        ...prev.items,

        {
          id: Date.now(),

          item_type: "Discount",

          description: "Discount",

          qty: 1,

          price: 0,
        },
      ],
    }));
  };

  const updateItem = (id, key, value) => {
    setForm((prev) => ({
      ...prev,

      items: prev.items.map((x) =>
        x.id === id
          ? {
              ...x,

              [key]: value,
            }
          : x,
      ),
    }));
  };

  const removeItem = (id) => {
    setForm((prev) => ({
      ...prev,

      items: prev.items.filter((x) => x.id !== id),
    }));
  };

  // =========================================
  // SAVE
  // =========================================
  const isExistingItem = (item) => typeof item.id === "string";
  const handleSave = async () => {
    try {
      setLoading(true);

      if (!form.items?.length) {
        alert("Add at least one item");

        return;
      }

      const billingId = form.id;

      // ============================
      // PREPARE ITEMS
      // ============================

      const preparedItems = form.items.map((item) => {
        const qty = Number(item.qty || 0);

        const price = Math.abs(Number(item.price || 0));

        let amount = qty * price;

        if (item.item_type === "Discount") {
          amount = -amount;
        }

        return {
          billing_id: billingId,

          item_type: item.item_type,

          description: item.description,

          qty,

          unit_price: price,

          amount,

          updated_at: defaultVisitDateTime(),
        };
      });

      // ============================
      // COMPUTE TOTALS
      // ============================

      const subtotal = preparedItems
        .filter((x) => x.item_type !== "Discount")
        .reduce((a, b) => a + Number(b.amount || 0), 0);

      const discountTotal = preparedItems
        .filter((x) => x.item_type === "Discount")
        .reduce((a, b) => a + Math.abs(Number(b.amount || 0)), 0);

      const total = Math.max(0, subtotal - discountTotal);

      // ============================
      // UPDATE BILLING
      // ============================

      const { error: billingError } = await supabase
        .from("billings")
        .update({
          subtotal,

          discount_total: discountTotal,

          total,

          notes: form.notes,

          updated_at: defaultVisitDateTime(),
        })
        .eq("id", billingId);

      if (billingError) throw billingError;

      // ============================
      // DELETE OLD ITEMS
      // ============================

      const { error: deleteError } = await supabase
        .from("billing_items")
        .delete()
        .eq("billing_id", billingId);

      if (deleteError) throw deleteError;

      // ============================
      // INSERT NEW ITEMS
      // ============================

      const { error: insertItemsError } = await supabase
        .from("billing_items")
        .insert(preparedItems);

      if (insertItemsError) throw insertItemsError;

      // ============================
      // RECOMPUTE BILLING
      // ============================

      const { error: recomputeError } = await supabase.rpc(
        "recompute_billing",
        {
          p_billing_id: billingId,
        },
      );

      if (recomputeError) throw recomputeError;

      await onSaved?.();

      setSnack?.({
        open: true,

        severity: "success",

        message: "Invoice updated successfully",
      });

      onClose();
    } catch (err) {
      console.error(err);

      setSnack?.({
        open: true,

        severity: "error",

        message: err.message || "Failed to update invoice",
      });
    } finally {
      setLoading(false);
      refetchData();
      refetchSummary();
    }
  };

  // =========================================
  // UI
  // =========================================

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle className="flex items-center justify-between">
        <Box>
          <Typography variant="h6" fontWeight={700}>
            {isEdit ? "Edit Invoice" : "Create Invoice"}
          </Typography>

          {isEdit && (
            <Typography variant="caption" color="text.secondary">
              Invoice #{form?.id?.slice(0, 5)}
            </Typography>
          )}
        </Box>

        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* TOP */}
        <Grid container spacing={2} mb={2}>
          <Grid item xs={12} md={4}>
            <TextField
              label="Invoice Date"
              size="small"
              fullWidth
              value={
                form.date
                  ? new Date(form.date).toLocaleDateString("en-PH", {
                      month: "long",

                      day: "numeric",

                      year: "numeric",
                    })
                  : ""
              }
              disabled
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

          <Grid item xs={12} md={5}>
            <TextField
              label="Patient"
              size="small"
              fullWidth
              value={form.patientName || ""}
              disabled
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <Box className="h-full flex items-center">
              <Chip
                label={form.status}
                color={
                  form.status === "Paid"
                    ? "success"
                    : form.status === "Partial"
                      ? "warning"
                      : form.status === "Voided"
                        ? "error"
                        : "default"
                }
              />
            </Box>
          </Grid>
        </Grid>

        {/* ITEMS */}
        <Typography fontWeight={700} mb={1}>
          Invoice Items
        </Typography>

        <Table
          size="small"
          sx={{
            border: "1px solid",

            borderColor: "divider",
          }}
        >
          <TableHead>
            <TableRow className="bg-slate-100">
              <TableCell>Item</TableCell>

              <TableCell align="right" width={120}>
                Qty
              </TableCell>

              <TableCell align="right" width={160}>
                Unit Price
              </TableCell>

              <TableCell align="right" width={160}>
                Amount
              </TableCell>

              <TableCell align="right" width={80}>
                Remove
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {form.items.map((item) => {
              let amount = Number(item.qty || 0) * Number(item.price || 0);

              if (item.item_type === "Discount") {
                amount = -Math.abs(amount);
              }

              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <Box className="flex gap-2">
                      <TextField
                        select
                        size="small"
                        sx={{
                          minWidth: 150,
                        }}
                        disabled={
                          (isPartial && isExistingItem(item)) || isLocked
                        }
                        value={item.item_type || "Consultation"}
                        onChange={(e) =>
                          updateItem(
                            item.id,

                            "item_type",

                            e.target.value,
                          )
                        }
                      >
                        {ITEM_TYPES.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </TextField>

                      <TextField
                        fullWidth
                        size="small"
                        disabled={
                          (isPartial && isExistingItem(item)) || isLocked
                        }
                        value={item.description}
                        onChange={(e) =>
                          updateItem(
                            item.id,

                            "description",

                            e.target.value,
                          )
                        }
                        placeholder="Description"
                      />
                    </Box>
                  </TableCell>

                  <TableCell align="right">
                    <TextField
                      size="small"
                      disabled={(isPartial && isExistingItem(item)) || isLocked}
                      value={item.qty}
                      inputMode="numeric"
                      onChange={(e) =>
                        updateItem(
                          item.id,

                          "qty",

                          e.target.value,
                        )
                      }
                    />
                  </TableCell>

                  <TableCell align="right">
                    <TextField
                      size="small"
                      disabled={(isPartial && isExistingItem(item)) || isLocked}
                      value={item.price}
                      inputMode="decimal"
                      onChange={(e) =>
                        updateItem(
                          item.id,

                          "price",

                          e.target.value,
                        )
                      }
                    />
                  </TableCell>

                  <TableCell align="right">
                    <Typography
                      color={
                        item.item_type === "Discount" ? "error.main" : "inherit"
                      }
                    >
                      {money(amount)}
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    <IconButton
                      disabled={(isPartial && isExistingItem(item)) || isLocked}
                      onClick={() => removeItem(item.id)}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <Box mt={2} className="flex gap-2">
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            disabled={isLocked}
            onClick={addItem}
          >
            Add Item
          </Button>

          <Button
            variant="outlined"
            color="error"
            startIcon={<AddIcon />}
            disabled={isPartial || isLocked}
            onClick={addDiscount}
          >
            Add Discount
          </Button>
        </Box>

        {/* TOTALS */}
        <Box className="flex justify-end mt-5">
          <Box className="min-w-[280px] space-y-2">
            <Box className="flex justify-between">
              <Typography color="text.secondary">Subtotal</Typography>

              <Typography>{money(totals.subtotal)}</Typography>
            </Box>

            <Box className="flex justify-between">
              <Typography color="text.secondary">Discount</Typography>

              <Typography color="error.main">
                -{money(totals.discount)}
              </Typography>
            </Box>

            <Box className="flex justify-between border-t pt-2">
              <Typography fontWeight={700}>Grand Total</Typography>

              <Typography fontWeight={700}>{money(totals.total)}</Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions className="px-6 py-4">
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading || isLocked}
        >
          {loading ? "Saving..." : isEdit ? "Update Invoice" : "Save Invoice"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
