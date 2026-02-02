import {
  Card,
  CardContent,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Box,
  Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import PrintIcon from "@mui/icons-material/Print";
import PaymentsIcon from "@mui/icons-material/Payments";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import {
  computeInvoiceTotals,
  money,
  statusColor,
} from "./helpers/billingHelpers";

export default function InvoicesTable({
  rows,
  onEdit,
  onPay,
  onPrint,
  onVoid,
}) {
  return (
    <Card className="rounded-2xl shadow">
      <CardContent>
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table size="small" sx={{ minWidth: 1050 }}>
            <TableHead>
              <TableRow className="bg-slate-100">
                <TableCell>Invoice #</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="right">Paid</TableCell>
                <TableCell align="right">Balance</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.map((inv) => {
                const c = computeInvoiceTotals(inv);
                return (
                  <TableRow key={inv.id} hover>
                    <TableCell className="font-semibold">{inv.id}</TableCell>
                    <TableCell>{inv.date}</TableCell>
                    <TableCell>{inv.patientName}</TableCell>
                    <TableCell align="right">{money(c.total)}</TableCell>
                    <TableCell align="right">{money(c.paid)}</TableCell>
                    <TableCell align="right">{money(c.balance)}</TableCell>
                    <TableCell>
                      <Chip
                        label={inv.status}
                        size="small"
                        color={statusColor(inv.status)}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box className="flex justify-end gap-1 flex-wrap">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<EditIcon />}
                          onClick={() => onEdit(inv)}
                          disabled={inv.status === "Voided"}
                        >
                          Edit
                        </Button>

                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<PaymentsIcon />}
                          onClick={() => onPay(inv)}
                          disabled={
                            inv.status === "Paid" || inv.status === "Voided"
                          }
                        >
                          Payment
                        </Button>

                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<PrintIcon />}
                          onClick={() => onPrint(inv)}
                        >
                          Print
                        </Button>

                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteOutlineIcon />}
                          onClick={() => onVoid(inv.id)}
                          disabled={inv.status === "Voided"}
                        >
                          Void
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}

              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No invoices found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
