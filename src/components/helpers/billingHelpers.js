export const todayISO = () => new Date().toISOString().slice(0, 10);

export const STATUS = ["Unpaid", "Partial", "Paid", "Voided"];

export const statusColor = (s) => {
  if (s === "Unpaid") return "warning";
  if (s === "Partial") return "info";
  if (s === "Paid") return "success";
  if (s === "Voided") return "default";
  return "default";
};

export const money = (n) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(
    Number(n || 0),
  );

export const computeInvoiceTotals = (inv) => {
  const subtotal = (inv?.items || []).reduce(
    (a, it) => a + Number(it.qty || 0) * Number(it.price || 0),
    0,
  );
  const discount = Number(inv?.discount || 0);
  const total = Math.max(0, subtotal - discount);
  const paid = Number(inv?.paid || 0);
  const balance = Math.max(0, total - paid);
  return { subtotal, discount, total, paid, balance };
};

export const computeNextStatus = (inv) => {
  if (inv?.status === "Voided") return "Voided";
  const { total } = computeInvoiceTotals(inv);
  const paid = Number(inv?.paid || 0);

  if (total > 0 && paid >= total) return "Paid";
  if (paid > 0) return "Partial";
  return "Unpaid";
};

export const normalizeInvoice = (inv) => ({
  ...inv,
  discount: Number(inv.discount || 0),
  paid: Number(inv.paid || 0),
  items: (inv.items || []).map((it) => ({
    ...it,
    qty: Number(it.qty || 0),
    price: Number(it.price || 0),
  })),
});

// date helpers (iso "YYYY-MM-DD")
export const isBetweenInclusive = (d, start, end) => {
  if (!d) return false;
  return String(d) >= String(start) && String(d) <= String(end);
};

export const startOfWeekISO = (refDate = new Date()) => {
  const d = new Date(refDate);
  const day = d.getDay(); // 0..6 (Sun..Sat)
  const diffToMon = (day + 6) % 7;
  d.setDate(d.getDate() - diffToMon);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
};

export const endOfWeekISO = (refDate = new Date()) => {
  const d = new Date(refDate);
  const day = d.getDay();
  const diffToMon = (day + 6) % 7;
  d.setDate(d.getDate() - diffToMon + 6);
  d.setHours(23, 59, 59, 999);
  return d.toISOString().slice(0, 10);
};
