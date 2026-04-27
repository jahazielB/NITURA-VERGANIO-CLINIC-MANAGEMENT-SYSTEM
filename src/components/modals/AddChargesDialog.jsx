import { supabase } from "../../lib/supabaseClient";
import {
  Dialog,
  DialogTitle,
  IconButton,
  DialogContent,
  Grid,
  TextField,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  Button,
  DialogActions,
  MenuItem,
  InputAdornment,
  Divider,
  Autocomplete,
  CircularProgress,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CustomSnackbar from "./CustomSnackBar";

import { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { money } from "../helpers/billingHelpers";
import useDebounce from "../../hooks/useDebounce";
import { useParams } from "react-router-dom";

import { addCharge } from "../helpers/billingHelpers";
import { fetchPatientProfile } from "../../store/patientProfileSlice";

export default function AddChargesDialog({
  open,
  onClose,
  onSave,
  // patients,
  showPatient = false,
}) {
  const [items, setItems] = useState([]);
  const [allPatients, setAllPatients] = useState();
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    patientInfo: null,
    visitId: "",
    patientId: "",
  });
  const [visitData, setVisitData] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "",
  });

  const dispatch = useDispatch();
  const { patientInfo } = useSelector((s) => s.patientProfile);
  const visitsPerPatient = patientInfo?.visits || [];
  const patients = useSelector((s) => s.patients.rows);
  const { id } = useParams();
  const debouncedSearch = useDebounce(search, 500);
  const ITEM_TYPES = [
    "Consultation",
    "Lab",
    "Medication",
    "Service",
    "Other",
    "Discount",
  ];

  useEffect(() => {
    const fetchVisit = async () => {
      if (!form.patientId) {
        setVisitData([]);
        return;
      }
      const { data, error } = await supabase
        .from("visits")
        .select("*")
        .eq("patient_id", form.patientId);

      if (error) throw error;
      setVisitData(data || []);
    };
    fetchVisit();
    console.log(visitData);
  }, [form.patientId]);

  useEffect(() => {
    if (!open) return;
    if (!showPatient) {
      setForm({ patientId: id });
    } else {
      setForm({ patientId: "", date: "" });
    }
    setItems([
      { id: Date.now(), desc: "", item_type: "", qty: 1, price: 0, amount: 0 },
    ]);
  }, [open, showPatient]);

  const addItem = () => {
    setItems((p) => [
      ...p,
      {
        id: Date.now(),
        desc: "",
        item_type: "",
        qty: 1,
        price: 0,
        amount: 0,
      },
    ]);
  };

  const updateItem = (id, key, val) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;

        const updated = { ...it, [key]: val };

        const qty = Number(updated.qty || 0);
        const price = Number(updated.price || 0);

        let amount = qty * price;

        // 👇 make discount negative
        if (updated.item_type === "Discount") {
          amount = -Math.abs(amount);
        }

        updated.amount = amount;

        return updated;
      }),
    );
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems((p) => p.filter((it) => it.id !== id));
    }
  };

  const subtotal = useMemo(() => {
    return items
      .filter((it) => it.item_type !== "Discount")
      .reduce((a, it) => a + Number(it.amount || 0), 0);
  }, [items]);

  const discountTotal = useMemo(() => {
    return items
      .filter((it) => it.item_type === "Discount")
      .reduce((a, it) => a + Math.abs(Number(it.amount || 0)), 0);
  }, [items]);
  const total = useMemo(() => {
    return Math.max(0, subtotal - discountTotal);
  }, [subtotal, discountTotal]);

  const validateItems = () => {
    const newErrors = {};

    for (let i = 0; i < items.length; i++) {
      const it = items[i];

      if (!it.item_type) {
        newErrors[it.id] = { item_type: "Select type" };
      }

      if (!it.desc?.trim()) {
        newErrors[it.id] = {
          ...newErrors[it.id],
          desc: "Enter description",
        };
      }

      if (!+it.qty) {
        newErrors[it.id] = {
          ...newErrors[it.id],
          qty: "Invalid qty",
        };
      }

      if (it.item_type !== "Discount" && !+it.price) {
        newErrors[it.id] = {
          ...newErrors[it.id],
          price: "Invalid price",
        };
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async () => {
    try {
      setSaving(true);
      if (!form.visitId) {
        setSnackbar({
          ...snackbar,
          open: true,
          severity: "error",
          message: "Select Visit Date First",
        });
        return;
      }
      if (!validateItems()) return;

      // 1. get or create billing
      const { data: billingId, error: billingError } = await supabase.rpc(
        "get_or_create_billing",
        {
          p_visit_id: form.visitId,
        },
      );

      if (billingError) throw billingError;

      // 2. prepare payload
      const payload = items.map((it) => ({
        billing_id: billingId,
        item_type: it.item_type,
        description: it.desc,
        qty: Number(it.qty),
        unit_price: Number(it.price),
        amount: Number(it.amount),
      }));

      // 3. insert items
      const { error: insertError } = await supabase
        .from("billing_items")
        .insert(payload);

      if (insertError) throw insertError;

      // 4. recompute billing
      const { error: recomputeError } = await supabase.rpc(
        "recompute_billing",
        {
          p_billing_id: billingId,
        },
      );

      if (recomputeError) throw recomputeError;
      dispatch(fetchPatientProfile(form.patientId));
      setSnackbar({
        ...snackbar,
        open: true,
        severity: "success",
        message: "Charges Saved!",
      });
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err) {
      console.error(err);
      setSnackbar({
        ...snackbar,
        open: true,
        severity: "error",
        message: "Failed to saved charges",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSearch = async (value) => {
    const { data, error } = await supabase
      .from("patients")
      .select(`*`)
      .or(
        `first_name.ilike.*${value}*,last_name.ilike.*${value}*,address.ilike.*${value}*`,
      )
      .limit(10);
    if (error) throw error;
    setAllPatients(data);
  };
  useEffect(() => {
    if (!debouncedSearch) return;
    handleSearch(debouncedSearch);
  }, [debouncedSearch]);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ReceiptIcon color="primary" fontSize="small" />
          <Typography variant="subtitle1" fontWeight={700}>
            Add Charges
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* TOP SELECTION BAR - COMPACT VERSION */}
        <Box
          sx={{
            bgcolor: "#f1f5f9",
            px: 3,
            py: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Grid container spacing={2}>
            {showPatient && (
              <Grid item xs={12} md={8} sx={{ width: "20%" }}>
                <Autocomplete
                  options={allPatients || []}
                  getOptionLabel={(option) =>
                    `${option.first_name} ${option.middle_name?.charAt(0) || ""}. ${option.last_name}`
                  }
                  value={form?.patientInfo || null}
                  popupIcon={null}
                  onChange={(e, newValue) => {
                    setForm((prev) => ({
                      ...prev,
                      patientInfo: newValue || "",
                      patientId: newValue?.id || "",
                    }));
                  }}
                  onInputChange={(e, value, reason) => {
                    if (reason === "input") {
                      setSearch(value);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Patient Name"
                      size="small"
                      fullWidth
                    />
                  )}
                />
              </Grid>
            )}
            <Grid item xs={12} md={showPatient ? 6 : 12}>
              <TextField
                disabled={!form?.patientId}
                select
                // label="Select Visit Date"
                fullWidth
                size="small"
                value={form.visitId || ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, visitId: e.target.value }))
                }
                sx={{
                  bgcolor: "white",
                  "& .MuiInputLabel-root": {
                    fontSize: "0.85rem",
                  },
                }}
                SelectProps={{ displayEmpty: true }}
              >
                <MenuItem value="" disabled>
                  Select Visit Date
                </MenuItem>

                {(!showPatient ? visitsPerPatient : visitData).map((v) => (
                  <MenuItem key={v.id} value={v.id}>
                    Visit on {new Date(v?.created_at).toLocaleDateString()}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Box>

        {/* LINE ITEMS SECTION */}
        <Box sx={{ p: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow
                sx={{
                  "& .MuiTableCell-head": {
                    fontWeight: 700,
                    py: 1,
                    color: "text.secondary",
                  },
                }}
              >
                <TableCell>Description</TableCell>
                <TableCell align="right" width={80}>
                  Qty
                </TableCell>
                <TableCell align="right" width={120}>
                  Price
                </TableCell>
                <TableCell align="right" width={120}>
                  Amount
                </TableCell>
                <TableCell width={40}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((it) => (
                <TableRow key={it.id}>
                  <TableCell sx={{ py: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        width: "100%",
                      }}
                    >
                      {/* TYPE DROPDOWN */}
                      <TextField
                        select
                        size="small"
                        // label="Select type"
                        variant="standard"
                        error={!!errors[it.id]?.item_type}
                        helperText={errors[it.id]?.item_type}
                        value={it.item_type}
                        disabled={it.item_type === "Discount"}
                        onChange={(e) =>
                          updateItem(it.id, "item_type", e.target.value)
                        }
                        sx={{
                          minWidth: 130,
                          flexShrink: 0,
                        }}
                        InputProps={{ disableUnderline: true }}
                        SelectProps={{ displayEmpty: true }}
                      >
                        <MenuItem value="" disabled>
                          Select Type
                        </MenuItem>

                        {ITEM_TYPES.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </TextField>

                      {/* DESCRIPTION */}
                      <TextField
                        fullWidth
                        size="small"
                        variant="standard"
                        error={!!errors[it.id]?.desc}
                        helperText={errors[it.id]?.desc}
                        placeholder="Description..."
                        value={it.desc}
                        onChange={(e) =>
                          updateItem(it.id, "desc", e.target.value)
                        }
                        InputProps={{ disableUnderline: true }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      type="number"
                      size="small"
                      variant="standard"
                      error={!!errors[it.id]?.qty}
                      helperText={errors[it.id]?.qty}
                      value={it.qty}
                      onChange={(e) => updateItem(it.id, "qty", e.target.value)}
                      InputProps={{ disableUnderline: true }}
                      inputProps={{ style: { textAlign: "right" } }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      type="number"
                      size="small"
                      variant="standard"
                      value={it.price}
                      error={!!errors[it.id]?.price}
                      helperText={errors[it.id]?.price}
                      onChange={(e) =>
                        updateItem(it.id, "price", e.target.value)
                      }
                      InputProps={{
                        disableUnderline: true,
                        startAdornment: (
                          <InputAdornment
                            position="start"
                            sx={{ fontSize: "0.8rem" }}
                          ></InputAdornment>
                        ),
                      }}
                      inputProps={{ style: { textAlign: "right" } }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    {money(it.amount)}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => removeItem(it.id)}
                      disabled={items.length === 1}
                    >
                      <DeleteOutlineIcon
                        fontSize="small"
                        sx={{ opacity: 0.6 }}
                      />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Button
            startIcon={<AddIcon />}
            onClick={addItem}
            sx={{ mt: 1, fontSize: "0.8rem" }}
            variant="text"
            size="small"
          >
            Add Item
          </Button>
          <Button
            startIcon={<AddIcon />}
            onClick={() =>
              setItems((p) => [
                ...p,
                {
                  id: Date.now(),
                  desc: "Discount",
                  item_type: "Discount",
                  qty: 1,
                  price: 0,
                  amount: 0,
                },
              ])
            }
            sx={{ mt: 1, fontSize: "0.8rem" }}
            variant="text"
            size="small"
          >
            Add Discount
          </Button>
        </Box>

        {/* SUMMARY SECTION */}
        <Box sx={{ p: 3, pt: 0, display: "flex", justifyContent: "flex-end" }}>
          <Box sx={{ width: 260 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="caption" color="text.secondary">
                Subtotal
              </Typography>

              <Typography variant="caption" fontWeight={600}>
                {money(subtotal)}
              </Typography>
            </Box>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="caption" color="text.secondary">
                Discount
              </Typography>
              <Typography variant="caption" fontWeight={600}>
                -{money(discountTotal)}
              </Typography>
            </Box>

            <Divider sx={{ mb: 1.5 }} />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="subtitle1" fontWeight={800}>
                Total
              </Typography>
              <Typography
                variant="subtitle1"
                fontWeight={800}
                color="primary.main"
              >
                {money(total)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{ px: 3, py: 2, borderTop: "1px solid", borderColor: "divider" }}
      >
        <Button onClick={onClose} size="small" sx={{ color: "text.secondary" }}>
          Cancel
        </Button>
        <Button
          disabled={saving}
          startIcon={
            saving ? <CircularProgress size={20} color="inherit" /> : null
          }
          onClick={() => {
            submit();
          }}
          variant="contained"
          disableElevation
          size="small"
          sx={{ px: 3, fontWeight: 700 }}
        >
          {saving ? "Saving..." : "Save Charges"}
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
