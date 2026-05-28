import { supabase } from "../lib/supabaseClient";
import { Box, Button, Typography, Pagination } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useMemo, useState, useEffect } from "react";

import BillingSummaryCards from "../components/BillingSummaryCards";
import BillingFilters from "../components/BillingFilters";
import InvoicesTable from "../components/BillingInvoicesTable";
import InvoiceDialog from "../components/modals/InvoiceDialog";
import PaymentDialog from "../components/modals/PaymentDialog";
import DailySalesReportDialog from "../components/modals/DailySalesReportDialog";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  computeInvoiceTotals,
  computeNextStatus,
  normalizeInvoice,
  todayISO,
  startOfWeekISO,
  endOfWeekISO,
} from "../components/helpers/billingHelpers";
import { defaultVisitDateTime } from "../components/helpers/dateHelper";
import CustomSnackbar from "../components/modals/CustomSnackBar";

import { useSelector, useDispatch } from "react-redux";
import { fetchPatientProfile } from "../store/patientProfileSlice";

export default function BillingPage({ patients: patientsProp }) {
  const [todaySummary, setTodaySummary] = useState(null);
  const [tableData, setTableData] = useState(null);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [filterStatus, setFilterStatus] = useState("All");
  const [quickDate, setQuickDate] = useState("all"); // all | today | thisWee
  const [openForm, setOpenForm] = useState(false);
  const [openPay, setOpenPay] = useState(false);
  const [openReport, setOpenReport] = useState(false);
  const [selected, setSelected] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [voidingInvoiceId, setVoidingInvoiceId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "",
  });

  const PAGE_SIZE = 7;
  const { role, userName, user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();

  const fetchSummary = async () => {
    const { data, error } = await supabase.rpc("get_billing_summary", {
      p_start: todayISO(),
      p_end: todayISO(),
    });
    if (error) {
      console.error(error);
    }
    // console.log(data, todayISO());
    setTodaySummary(data);
    console.log(data);
  };
  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchData = async () => {
    const { data, error } = await supabase.rpc("get_billings_dashboard_v2", {
      p_search: debouncedSearch || null,
      p_status: filterStatus === "All" ? null : filterStatus,
      p_start:
        quickDate === "today"
          ? todayISO()
          : quickDate === "thisWeek"
            ? startOfWeekISO()
            : null,
      p_end:
        quickDate === "today"
          ? todayISO()
          : quickDate === "thisWeek"
            ? endOfWeekISO()
            : null,
      p_limit: PAGE_SIZE,
      p_offset: page * PAGE_SIZE,
    });

    if (error) {
      console.error(error);
      return;
    }

    setTableData(data.rows);
    setTotalCount(data.total_count);
    console.log(data);
  };

  useEffect(() => {
    fetchData();
  }, [debouncedSearch, filterStatus, quickDate, page]);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 500);
    setPage(0);
    return () => clearTimeout(t);
  }, [searchInput]);
  // mock patients if none passed
  const patients = useMemo(
    () =>
      patientsProp?.length
        ? patientsProp
        : [
            { id: 1, name: "DELA CRUZ, JUAN" },
            { id: 2, name: "SANTOS, MARIA" },
            { id: 3, name: "REYES, PEDRO" },
          ],
    [patientsProp],
  );

  const handlePayment = async ({
    billingId = selected?.id,
    amount,
    method = "Cash",
    receivedBy = user?.id,
  }) => {
    try {
      console.log(selected);
      const { error: insertError } = await supabase.from("payments").insert({
        billing_id: billingId,
        amount: Number(amount),
        method,
        received_by: receivedBy,
        paid_at: defaultVisitDateTime(),
        created_at: defaultVisitDateTime(),
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
        open: true,
        severity: "success",
        message: "Payment Saved!",
      });
      await fetchSummary();
      await fetchData();
    } catch (e) {
      setSnackbar({
        open: true,
        severity: "error",
        message: "Error Saving payment",
      });
    }
  };

  const openNew = () => {
    setSelected(null);
    setOpenForm(true);
  };

  const openEdit = (inv) => {
    setSelected(inv);
    setOpenForm(true);
  };

  const openPayment = (inv) => {
    setSelected(inv);
    setOpenPay(true);
    console.log(inv);
  };

  const voidInvoice = async (id) => {
    const invoice = tableData?.find((x) => x.id === id);

    if (!invoice) {
      setSnackbar({
        open: true,
        severity: "error",
        message: "Invoice not found.",
      });
      return;
    }

    if (invoice.status !== "Unpaid") {
      setSnackbar({
        open: true,
        severity: "warning",
        message: "Only unpaid invoices can be voided.",
      });
      return;
    }

    if (!confirm("Void this invoice?")) return;

    try {
      setVoidingInvoiceId(id);
      const { error: updateError } = await supabase
        .from("billings")
        .update({ status: "Voided" })
        .eq("id", id);

      if (updateError) throw updateError;
      console.log(updateError);

      setSnackbar({
        open: true,
        severity: "success",
        message: "Invoice voided successfully.",
      });

      await fetchSummary();
      await fetchData();
    } catch (e) {
      setSnackbar({
        open: true,
        severity: "error",
        message: "Failed to void invoice.",
      });
    } finally {
      setVoidingInvoiceId(null);
    }
  };

  const printInvoice = (inv) => {
    alert(`Print invoice/receipt coming soon (Invoice #${inv.id})`);
  };

  const sampleFetch = async () => {
    const { data, error } = await supabase.rpc("get_billings_dashboard_v2", {
      p_search: debouncedSearch || null,
      p_status: filterStatus === "All" ? null : filterStatus,
      // p_start: startDate || null,
      // p_end: endDate || null,
      p_limit: PAGE_SIZE,
      p_offset: page * PAGE_SIZE,
    });
    console.log(data);
  };

  return (
    <Box className="space-y-4 p-5">
      {/* Header */}
      <Box className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Box>
          <Typography variant="h6" className="font-bold">
            Billing
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create invoices, accept payments, and print receipts.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => sampleFetch()}
        >
          New Invoice
        </Button>
      </Box>

      {/* Summary + Report button */}
      <BillingSummaryCards
        todaySummary={todaySummary?.[0]}
        onOpenReport={() => setOpenReport(true)}
      />

      {/* Filters */}
      <BillingFilters
        search={searchInput}
        setSearch={setSearchInput}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        quickDate={quickDate}
        setQuickDate={setQuickDate}
      />

      {/* Table */}
      <InvoicesTable
        rows={tableData}
        onEdit={openEdit}
        onPay={openPayment}
        onPrint={printInvoice}
        onVoid={voidInvoice}
        voidingInvoiceId={voidingInvoiceId}
      />

      {/* Dialogs */}
      <InvoiceDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSave={(payload) => {
          // upsertInvoice(payload);
          setOpenForm(false);
        }}
        patients={patients}
        invoice={selected}
        setSnack={setSnackbar}
        refetchSummary={fetchSummary}
        refetchData={fetchData}
      />

      <PaymentDialog
        open={openPay}
        onClose={() => setOpenPay(false)}
        invoice={selected}
        onSave={handlePayment}
      />
      <CustomSnackbar
        open={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        severity={snackbar.severity}
      />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DailySalesReportDialog
          open={openReport}
          onClose={() => setOpenReport(false)}
          invoices={[]}
        />
      </LocalizationProvider>
      <Box className="flex justify-center mt-3">
        <Pagination
          count={Math.ceil(totalCount / PAGE_SIZE)}
          page={page + 1}
          onChange={(e, value) => setPage(value - 1)}
          color="primary"
          size="small"
        />
      </Box>
    </Box>
  );
}
