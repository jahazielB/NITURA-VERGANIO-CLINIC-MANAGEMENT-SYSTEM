export const ROLES = ["Admin", "Doctor", "Med Tech", "Nurse"];
export const STATUSES = ["Active", "Disabled"];

export const roleColor = (role) => {
  if (role === "Admin") return "primary";
  if (role === "Doctor") return "secondary";
  if (role === "Med Tech") return "info";
  if (role === "Nurse") return "success";
  return "default";
};

export const statusColor = (status) => {
  if (status === "Active") return "success";
  if (status === "Disabled") return "default";
  return "default";
};

export const fullName = (u) =>
  String(u?.full_name || "").trim();

export const fmtCreatedAt = (v) => {
  if (!v) return "—";
  const date = new Date(v);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US");
};

export const generateTempPassword = (len = 10) => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
};

export const permissionsByRole = (role) => {
  // UI-only preview (no enforcement yet)
  const base = {
    Patients: false,
    Visits: false,
    SOAP: false,
    Prescriptions: false,
    Laboratory: false,
    Billing: false,
    Accounts: false,
  };

  if (role === "Admin") {
    return {
      ...base,
      Patients: true,
      Visits: true,
      SOAP: true,
      Prescriptions: true,
      Laboratory: true,
      Billing: true,
      Accounts: true,
    };
  }
  if (role === "Doctor") {
    return {
      ...base,
      Patients: true,
      Visits: true,
      SOAP: true,
      Prescriptions: true,
      Laboratory: true,
    };
  }
  if (role === "Med Tech") {
    return { ...base, Patients: true, Laboratory: true };
  }
  if (role === "Nurse") {
    return { ...base, Patients: true, Visits: true };
  }
  return base;
};
