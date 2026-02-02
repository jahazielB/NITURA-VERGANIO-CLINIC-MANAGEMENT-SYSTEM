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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import { useEffect, useMemo, useState } from "react";
import {
  todayISO,
  money,
  computeInvoiceTotals,
  computeNextStatus,
  normalizeInvoice,
} from "../helpers/billingHelpers";

export default function InvoiceDialog({
  open,
  onClose,
  onSave,
  patients,
  invoice,
}) {
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (!open) return;

    if (invoice) {
      setForm(JSON.parse(JSON.stringify(invoice)));
      return;
    }

    const p0 = patients?.[0];
    setForm({
      id: null,
      date: todayISO(),
      patientId: p0?.id || "",
      patientName: p0?.name || "",
      items: [{ id: 1, desc: "Consultation", qty: 1, price: 500 }],
      discount: 0,
      paid: 0,
      status: "Unpaid",
      notes: "",
    });
  }, [open, invoice, patients]);

  const totals = useMemo(() => computeInvoiceTotals(form || {}), [form]);

  if (!form) return null;

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const pickPatient = (patientId) => {
    const p = (patients || []).find((x) => x.id === patientId);
    setForm((prev) => ({
      ...prev,
      patientId,
      patientName: p?.name || "",
    }));
  };

  const addItem = () => {
    setForm((p) => ({
      ...p,
      items: [
        ...(p.items || []),
        { id: Date.now(), desc: "", qty: 1, price: 0 },
      ],
    }));
  };

  const updateItem = (id, key, val) => {
    setForm((p) => ({
      ...p,
      items: (p.items || []).map((it) =>
        it.id === id ? { ...it, [key]: val } : it,
      ),
    }));
  };

  const removeItem = (id) => {
    setForm((p) => ({
      ...p,
      items: (p.items || []).filter((it) => it.id !== id),
    }));
  };

  const submit = () => {
    if (!form.patientId) return alert("Select a patient.");
    if (!(form.items || []).length) return alert("Add at least one item.");

    const normalized = normalizeInvoice(form);
    const next = { ...normalized, status: computeNextStatus(normalized) };
    onSave(next);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle className="flex items-center justify-between">
        {invoice ? `Edit Invoice #${invoice.id}` : "New Invoice"}
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} mt={0.5}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Date"
              type="date"
              size="small"
              fullWidth
              value={form.date}
              onChange={(e) => setField("date", e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={8}>
            <TextField
              select
              label="Patient"
              size="small"
              fullWidth
              value={form.patientId}
              onChange={(e) => pickPatient(e.target.value)}
            >
              {(patients || []).map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
              {(!patients || patients.length === 0) && (
                <MenuItem value="">
                  <em>No patients loaded</em>
                </MenuItem>
              )}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <Typography fontWeight={900} sx={{ mb: 1 }}>
              Line Items
            </Typography>

            <Table
              size="small"
              sx={{ border: "1px solid", borderColor: "divider" }}
            >
              <TableHead>
                <TableRow className="bg-slate-100">
                  <TableCell>Description</TableCell>
                  <TableCell width={100} align="right">
                    Qty
                  </TableCell>
                  <TableCell width={140} align="right">
                    Price
                  </TableCell>
                  <TableCell width={140} align="right">
                    Amount
                  </TableCell>
                  <TableCell width={80} align="right">
                    Remove
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {(form.items || []).map((it) => {
                  const amt = Number(it.qty || 0) * Number(it.price || 0);
                  return (
                    <TableRow key={it.id}>
                      <TableCell>
                        <TextField
                          size="small"
                          fullWidth
                          value={it.desc}
                          onChange={(e) =>
                            updateItem(it.id, "desc", e.target.value)
                          }
                          placeholder="e.g., Consultation, CBC, Medicine..."
                        />
                      </TableCell>

                      <TableCell align="right">
                        <TextField
                          size="small"
                          value={it.qty}
                          onChange={(e) =>
                            updateItem(it.id, "qty", e.target.value)
                          }
                          inputMode="numeric"
                        />
                      </TableCell>

                      <TableCell align="right">
                        <TextField
                          size="small"
                          value={it.price}
                          onChange={(e) =>
                            updateItem(it.id, "price", e.target.value)
                          }
                          inputMode="decimal"
                        />
                      </TableCell>

                      <TableCell align="right">{money(amt)}</TableCell>

                      <TableCell align="right">
                        <IconButton onClick={() => removeItem(it.id)}>
                          <DeleteOutlineIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <Box className="mt-2">
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addItem}
              >
                Add Item
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Discount"
              size="small"
              fullWidth
              value={form.discount}
              onChange={(e) => setField("discount", e.target.value)}
              inputMode="decimal"
            />
          </Grid>

          <Grid item xs={12} sm={8}>
            <TextField
              label="Notes (optional)"
              size="small"
              fullWidth
              value={form.notes}
              onChange={(e) => setField("notes", e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <Box className="flex justify-end gap-4 flex-wrap">
              <Typography>
                Subtotal: <b>{money(totals.subtotal)}</b>
              </Typography>
              <Typography>
                Total: <b>{money(totals.total)}</b>
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions className="px-6 py-4">
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={submit}
          variant="contained"
          disabled={form.status === "Voided"}
        >
          Save Invoice
        </Button>
      </DialogActions>
    </Dialog>
  );
}
