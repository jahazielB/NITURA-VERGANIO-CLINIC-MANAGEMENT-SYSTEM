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

export default function BillingPage({ patients: patientsProp }) {
  const [todaySummary, setTodaySummary] = useState(null);
  const [tableData, setTableData] = useState(null);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [q, setQ] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [quickDate, setQuickDate] = useState("all"); // all | today | thisWee
  const [openForm, setOpenForm] = useState(false);
  const [openPay, setOpenPay] = useState(false);
  const [openReport, setOpenReport] = useState(false);
  const [selected, setSelected] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const PAGE_SIZE = 7;

  useEffect(() => {
    const fetchData = async () => {
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

    fetchData();
  }, []);

  useEffect(() => {
    const fetch = async () => {
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

    fetch();
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

  // const invoices = tableData?.flatMap((p) =>
  //   (p.visits || [])
  //     .filter((v) => v.billings)
  //     .map(
  //       (v) =>
  //         ({
  //           billingId: v.billings.id,
  //           patientName: `${p.first_name} ${p.last_name}`,
  //           date: v.created_at,
  //           ...v.billings,
  //         }) || [],
  //     ),
  // );

  const upsertInvoice = (payload) => {
    const safe = normalizeInvoice(payload);
    const next = { ...safe, status: computeNextStatus(safe) };

    setInvoices((prev) => {
      if (!next.id) {
        const id = Date.now();
        return [{ ...next, id }, ...prev];
      }
      return prev.map((x) => (x.id === next.id ? next : x));
    });
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
  };

  const voidInvoice = (id) => {
    if (!confirm("Void this invoice?")) return;
    setInvoices((prev) =>
      prev.map((x) => (x.id === id ? { ...x, status: "Voided" } : x)),
    );
  };

  const printInvoice = (inv) => {
    alert(`Print invoice/receipt coming soon (Invoice #${inv.id})`);
  };

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();

    const startWeek = startOfWeekISO();
    const endWeek = endOfWeekISO();

    return tableData
      ?.filter((x) =>
        filterStatus === "All" ? true : x.status === filterStatus,
      )
      .filter((x) => {
        if (quickDate === "all") return true;
        const d = new Date(x.created_at).toLocaleDateString("en-CA");
        if (quickDate === "today") return d === todayISO();
        if (quickDate === "thisWeek") return d >= startWeek && d <= endWeek;
        return true;
      })
      .filter((x) => {
        if (!qq) return true;
        return (
          (x.patientName || "").toLowerCase().includes(qq) ||
          String(x.id).includes(qq) ||
          (x.date || "").includes(qq)
        );
      });
    // .sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }, [tableData, q, filterStatus, quickDate]);

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
      />

      {/* Dialogs */}
      <InvoiceDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSave={(payload) => {
          upsertInvoice(payload);
          setOpenForm(false);
        }}
        patients={patients}
        invoice={selected}
      />

      <PaymentDialog
        open={openPay}
        onClose={() => setOpenPay(false)}
        invoice={selected}
        onSave={(next) => {
          upsertInvoice(next);
          setOpenPay(false);
        }}
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
