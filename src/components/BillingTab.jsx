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
  TableBody,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import PaymentsIcon from "@mui/icons-material/Payments";
import { money } from "./helpers/billingHelpers";

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
  // ✅ UI mock invoices for this patient profile
  const invoices = [
    {
      id: 1001,
      date: "2026-01-22",
      status: "Partial",
      discount: 0,
      paid: 300,
      items: [
        { id: 1, desc: "Consultation", qty: 1, price: 500 },
        { id: 2, desc: "CBC", qty: 1, price: 250 },
      ],
      notes: "Walk-in",
    },
    {
      id: 1002,
      date: "2026-01-10",
      status: "Paid",
      discount: 0,
      paid: 500,
      items: [{ id: 1, desc: "Consultation", qty: 1, price: 500 }],
      notes: "Follow-up",
    },
  ];

  const totals = invoices
    .filter((x) => x.status !== "Voided")
    .reduce(
      (acc, inv) => {
        const t = computeTotals(inv);
        acc.total += t.total;
        acc.paid += t.paid;
        acc.balance += t.balance;
        return acc;
      },
      { total: 0, paid: 0, balance: 0 },
    );

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

            <Typography variant="caption" color="text.secondary">
              Patient:{" "}
              {patient?.firstName
                ? `${patient.firstName} ${patient.lastName}`
                : patient?.name || "—"}
            </Typography>
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
              onClick={() => alert("New Invoice UI coming soon")}
            >
              New Invoice
            </Button>
          </Box>

          <Table size="small">
            <TableHead>
              <TableRow className="bg-slate-100">
                <TableCell>Invoice #</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Items</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="right">Paid</TableCell>
                <TableCell align="right">Balance</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {invoices.map((inv) => {
                const t = computeTotals(inv);
                return (
                  <TableRow key={inv.id} hover>
                    <TableCell className="font-semibold">{inv.id}</TableCell>
                    <TableCell>{inv.date}</TableCell>
                    <TableCell>{(inv.items || []).length}</TableCell>
                    <TableCell align="right">{money(t.total)}</TableCell>
                    <TableCell align="right">{money(t.paid)}</TableCell>
                    <TableCell align="right">{money(t.balance)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={inv.status}
                        color={statusColor(inv.status)}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box className="flex justify-end gap-1 flex-wrap">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<PrintIcon />}
                          onClick={() =>
                            alert(`Print invoice #${inv.id} (mock)`)
                          }
                        >
                          Print
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<PaymentsIcon />}
                          disabled={
                            inv.status === "Paid" || inv.status === "Voided"
                          }
                          onClick={() =>
                            alert(`Record payment for #${inv.id} (mock)`)
                          }
                        >
                          Pay
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}

              {invoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No invoices yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
}
