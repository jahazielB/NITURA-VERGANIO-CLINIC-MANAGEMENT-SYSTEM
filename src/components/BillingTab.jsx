import { supabase } from "../lib/supabaseClient";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  Pagination,
  TableBody,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import PaymentsIcon from "@mui/icons-material/Payments";

import AddChargesDialog from "./modals/AddChargesDialog";
import PaymentDialog from "./modals/PaymentDialog";

import { money } from "./helpers/billingHelpers";

import { useSelector, useDispatch } from "react-redux";
import { fetchPatientProfile } from "../store/patientProfileSlice";
import CustomSnackbar from "./modals/CustomSnackBar";
import { useEffect, useState, useMemo } from "react";
import { defaultVisitDateTime } from "./helpers/dateHelper";
import { useParams } from "react-router-dom";
const statusColor = (s) => {
  if (s === "Unpaid") return "warning";
  if (s === "Partial") return "info";
  if (s === "Paid") return "success";
  if (s === "Voided") return "default";
  return "default";
};

const computeTotals = (inv) => {
  const subtotal = (inv?.items || []).reduce(
    (a, it) => a + Number(it.qty || 0) * Number(it.price || 0),
    0,
  );
  const total = Math.max(0, subtotal - Number(inv?.discount || 0));
  const paid = Number(inv?.paid || 0);
  const balance = Math.max(0, total - paid);
  return { subtotal, total, paid, balance };
};

export default function BillingTab({ patient }) {
  const [openCharges, setOpenCharges] = useState(false);
  const [openPayment, setOpenPayment] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState();
  const [page, setPage] = useState(1);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "",
  });

  const { patientInfo } = useSelector((s) => s.patientProfile);
  const visits = patientInfo?.visits;
  const dispatch = useDispatch();

  const { id } = useParams();

  const rowsPerPage = 5;
  const { role, userName, user } = useSelector((s) => s.auth);
  const invoice =
    visits?.flatMap((visit) =>
      (visit.billings ? [visit.billings] : []).map((billing) => ({
        ...billing,
        visit_date: visit.created_at,
        visit_id: visit.id,
      })),
    ) || [];

  useEffect(() => {
    console.log(invoice);
  }, [visits]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(invoice.length / rowsPerPage));

    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [invoice.length]);

  const paginatedInvoices = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return invoice.slice(start, start + rowsPerPage);
  }, [invoice, page]);

  const totals = (invoice || [])
    .filter((x) => x.status !== "Voided")
    .reduce(
      (acc, inv) => {
        acc.total += Number(inv?.total || 0);
        acc.paid += Number(inv?.paid_total || 0);
        acc.balance += Number(inv?.balance || 0);
        return acc;
      },
      { total: 0, paid: 0, balance: 0 },
    );

  const handlePayment = async ({
    billingId = selectedInvoice.id,
    amount,
    method = "Cash",
    receivedBy = user?.id,
  }) => {
    try {
      const { error: insertError } = await supabase.from("payments").insert({
        billing_id: billingId,
        amount: Number(amount),
        method,
        received_by: receivedBy,
        paid_at: defaultVisitDateTime,
        created_at: defaultVisitDateTime,
      });

      if (insertError) throw insertError;

      const { error: recomputeError } = await supabase.rpc(
        "recompute_billing",
        {
          p_billing_id: billingId,
        },
      );

      if (recomputeError) throw recomputeError;
      setSnackbar({
        ...snackbar,
        open: true,
        severity: "success",
        message: "Payment Saved!",
      });
      dispatch(fetchPatientProfile(id));
    } catch (e) {
      setSnackbar({
        ...snackbar,
        open: true,
        severity: "error",
        message: "Error Saving payment",
      });
    }
  };

  return (
    <Box className="space-y-4">
      {/* Summary */}
      <Box className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="rounded-2xl shadow">
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Total Charges
            </Typography>
            <Typography variant="h6" fontWeight={900}>
              {money(totals.total)}
            </Typography>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow">
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Paid
            </Typography>
            <Typography variant="h6" fontWeight={900}>
              {money(totals.paid)}
            </Typography>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow">
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Outstanding Balance
            </Typography>
            <Typography variant="h6" fontWeight={900}>
              {money(totals.balance)}
            </Typography>

            {/* <Typography variant="caption" color="text.secondary">
              Patient:{" "}
              {patient?.firstName
                ? `${patient.firstName} ${patient.lastName}`
                : patient?.name || "—"}
            </Typography> */}
          </CardContent>
        </Card>
      </Box>

      {/* Invoices table */}
      <Card className="rounded-2xl shadow">
        <CardContent>
          <Box className="flex items-center justify-between mb-3">
            <Typography variant="h6" fontWeight={900}>
              Invoices
            </Typography>

            <Button
              variant="contained"
              startIcon={<PaymentsIcon />}
              onClick={() => setOpenCharges(true)}
            >
              Add Charges
            </Button>
          </Box>

          <Table size="small">
            <TableHead>
              <TableRow className="bg-slate-100">
                <TableCell>Invoice #</TableCell>
                <TableCell>Visit Date</TableCell>
                <TableCell>Invoice Date</TableCell>
                <TableCell>Items</TableCell>
                <TableCell align="right">SubTotal</TableCell>
                <TableCell align="right">Discount</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="right">Paid</TableCell>
                <TableCell align="right">Balance</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {invoice?.length > 0 ? (
                paginatedInvoices?.map((inv) => {
                  const t = computeTotals(inv);
                  return (
                    <TableRow key={inv?.id} hover>
                      <TableCell className="font-semibold">
                        {(inv?.id).slice(0, 5) || "—"}
                      </TableCell>
                      <TableCell>
                        {new Date(inv?.visit_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        {new Date(inv?.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>{inv?.billing_items.length || 0}</TableCell>
                      <TableCell align="right">
                        {money(inv?.subtotal)}
                      </TableCell>
                      <TableCell align="right">
                        {money(inv?.discount_total)}
                      </TableCell>
                      <TableCell align="right">{money(inv?.total)}</TableCell>
                      <TableCell align="right">
                        {money(inv?.paid_total)}
                      </TableCell>
                      <TableCell align="right">{money(inv?.balance)}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={inv?.status}
                          color={statusColor(inv?.status)}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box className="flex justify-end gap-1 flex-wrap">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<PrintIcon />}
                            onClick={() =>
                              alert(`Print invoice #${inv?.id} (mock)`)
                            }
                          >
                            Print
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<PaymentsIcon />}
                            disabled={
                              inv?.status === "Paid" || inv?.status === "Voided"
                            }
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setOpenPayment(true);
                              console.log(selectedInvoice, user);
                            }}
                          >
                            Pay
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No invoices yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Pagination
              count={Math.max(1, Math.ceil(invoice.length / rowsPerPage))}
              page={page}
              onChange={(e, value) => setPage(value)}
              size="small"
              color="primary"
            />
          </Box>
        </CardContent>
      </Card>
      <CustomSnackbar
        open={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        severity={snackbar.severity}
      />
      <PaymentDialog
        open={openPayment}
        onClose={() => {
          setOpenPayment(false);
        }}
        invoice={selectedInvoice}
        onSave={handlePayment}
      />
      <AddChargesDialog
        open={openCharges}
        onClose={() => setOpenCharges(false)}
        // billingId={}
        // onSaved={refetch}
        showPatient={false}
        setSnack={setSnackbar}
      />
    </Box>
  );
}
