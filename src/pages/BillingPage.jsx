import { supabase } from "../lib/supabaseClient";
import { Box, Button, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useMemo, useState, useEffect } from "react";

import BillingSummaryCards from "../components/BillingSummaryCards";
import BillingFilters from "../components/BillingFilters";
import InvoicesTable from "../components/BillingInvoicesTable";
import InvoiceDialog from "../components/modals/InvoiceDialog";
import PaymentDialog from "../components/modals/PaymentDialog";
import DailySalesReportDialog from "../components/modals/DailySalesReportDialog";

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

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.rpc("get_billing_summary", {
        p_start: todayISO,
        p_end: todayISO,
      });
      if (error) {
        console.error(error);
      }
      setTodaySummary(data);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from("patients")
        .select(
          `
    id,
    first_name,
    middle_name,
    last_name,
    visits (
      id,
      created_at,
      billings (
        *,
        billing_items (*),
        payments (*)
      )
    )
  `,
        )
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) console.error(error);
      setTableData(data);
      console.log(data);
    };
    fetch();
  }, []);
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

  const [q, setQ] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [quickDate, setQuickDate] = useState("all"); // all | today | thisWeek

  const [openForm, setOpenForm] = useState(false);
  const [openPay, setOpenPay] = useState(false);
  const [openReport, setOpenReport] = useState(false);
  const [selected, setSelected] = useState(null);

  const invoices = tableData?.flatMap((p) =>
    (p.visits || [])
      .filter((v) => v.billings)
      .map(
        (v) =>
          ({
            billingId: v.billings.id,
            patientName: `${p.first_name} ${p.last_name}`,
            date: v.created_at,
            ...v.billings,
          }) || [],
      ),
  );

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

  // const filtered = useMemo(() => {
  //   const qq = q.trim().toLowerCase();

  //   const startWeek = startOfWeekISO();
  //   const endWeek = endOfWeekISO();

  //   return invoices
  //     .filter((x) =>
  //       filterStatus === "All" ? true : x.status === filterStatus,
  //     )
  //     .filter((x) => {
  //       if (quickDate === "all") return true;
  //       if (quickDate === "today") return x.date === todayISO();
  //       if (quickDate === "thisWeek")
  //         return x.date >= startWeek && x.date <= endWeek;
  //       return true;
  //     })
  //     .filter((x) => {
  //       if (!qq) return true;
  //       return (
  //         (x.patientName || "").toLowerCase().includes(qq) ||
  //         String(x.id).includes(qq) ||
  //         (x.date || "").includes(qq)
  //       );
  //     })
  //     .sort((a, b) => String(b.date).localeCompare(String(a.date)));
  // }, [invoices, q, filterStatus, quickDate]);

  // const summary = useMemo(() => {
  //   const today = todayISO();

  //   let todayRevenue = 0;
  //   let outstandingBalance = 0;
  //   let unpaidCount = 0;

  //   filtered.forEach((inv) => {
  //     if (inv.status === "Voided") return;
  //     const t = computeInvoiceTotals(inv);

  //     outstandingBalance += t.balance;
  //     if (inv.status === "Unpaid" || inv.status === "Partial") unpaidCount += 1;

  //     // UI-only assumption: paid belongs to invoice date
  //     if (inv.date === today) todayRevenue += t.paid;
  //   });

  //   return { todayRevenue, outstandingBalance, unpaidCount };
  // }, [filtered]);

  const sampleFetch = async () => {
    const invoices = tableData.flatMap((p) =>
      (p.visits || [])
        .filter((v) => v.billings)
        .map((v) => ({
          billingId: v.billings.id,
          patientName: `${p.first_name} ${p.last_name}`,
          date: v.created_at,
          ...v.billings,
        })),
    );
    console.log(invoices);
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
        q={q}
        setQ={setQ}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        quickDate={quickDate}
        setQuickDate={setQuickDate}
      />

      {/* Table */}
      <InvoicesTable
        rows={invoices}
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

      <DailySalesReportDialog
        open={openReport}
        onClose={() => setOpenReport(false)}
        invoices={invoices}
      />
    </Box>
  );
}
