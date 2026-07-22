import { useEffect } from "react";
import clinicHeaderLogo from "../../assets/HEADER-CLINIC.png";

function formatDate(d) {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(d) {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function capitalizeEach(s) {
  if (!s) return "";
  return s
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function extractPatientName(item, patient) {
  if (patient?.first_name) {
    const full = [patient.first_name, patient.middle_name, patient.last_name]
      .filter(Boolean)
      .join(" ");
    return capitalizeEach(full);
  }
  return item?.patientName || "";
}

function extractPatientAddress(item, patient) {
  if (patient?.address) return capitalizeEach(patient.address);
  return "";
}

function extractPatientAge(item, patient) {
  if (patient?.birth_date) {
    const dob = new Date(patient.birth_date);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
  }
  return "";
}

function extractPatientGender(item, patient) {
  return patient?.gender || "";
}

function extractDoctorName(item) {
  return item?.doctor?.full_name || item?.prescribedByName || "";
}

function extractDoctorLic(item) {
  return item?.doctor?.lic || "";
}

function extractItems(item) {
  return item?.prescription_items || [];
}

function extractDate(item) {
  return item?.prescribed_at || item?.prescribedDate || item?.created_at || "";
}

export default function PrescriptionPrintPreview({ item, patient, onClose }) {
  useEffect(() => {
    if (!item) {
      onClose?.();
      return;
    }

    const printArea = document.createElement("div");
    printArea.innerHTML = renderContent(item, patient);
    printArea.querySelectorAll("img").forEach((img) => {
      if (img.src && !img.src.startsWith("http")) {
        img.src = new URL(img.src, window.location.origin).href;
      }
    });

    const styles = document.querySelectorAll("style, link[rel='stylesheet']");
    let stylesHtml = "";
    styles.forEach((s) => (stylesHtml += s.outerHTML));

    const win = window.open("", "_blank");
    if (!win) {
      onClose?.();
      return;
    }

    win.document.write(`
      <html>
        <head>
          ${stylesHtml}
          <style>
            @page { size: A4 portrait; margin: 15mm; }
            html, body { margin: 0; padding: 0; background: #fff; }
            * { color: #000 !important; box-sizing: border-box; }
            .no-print { display: none !important; }
            img { max-height: 70px !important; object-fit: contain; }
          </style>
        </head>
        <body>${printArea.innerHTML}</body>
      </html>
    `);
    win.document.close();
    win.focus();

    const timer = setTimeout(() => {
      win.print();
      setTimeout(() => {
        win.close();
        onClose?.();
      }, 500);
    }, 400);

    return () => {
      clearTimeout(timer);
      try { win.close(); } catch {}
    };
  }, [item, patient, onClose]);

  return null;
}

function renderContent(item, patient) {
  const patientName = extractPatientName(item, patient);
  const address = extractPatientAddress(item, patient);
  const age = extractPatientAge(item, patient);
  const gender = extractPatientGender(item, patient);
  const doctorName = extractDoctorName(item);
  const doctorLic = extractDoctorLic(item);
  const items = extractItems(item);
  const date = extractDate(item);

  const line = (label, value, flex = 1) => `
    <div style="display:flex;gap:8px;align-items:flex-end;flex:${flex};min-width:0;">
      <span style="font-weight:800;font-size:0.75rem;white-space:nowrap;color:#333;">${label}:</span>
      <div style="flex:1;border-bottom:1px solid black;font-size:0.9rem;padding:0 4px;min-height:20px;font-weight:500;">${value || ""}</div>
    </div>
  `;

  const bodyHtml = `
    <div style="padding:0;">
      <div style="text-align:center;margin-bottom:32px;">
        <img src="${clinicHeaderLogo}" alt="Clinic Header" style="max-width:100%;height:auto;max-height:70px;object-fit:contain;" />
      </div>

      <div style="display:flex;flex-direction:column;gap:16px;margin-bottom:32px;">
        <div style="display:flex;gap:24px;">
          ${line("PATIENT'S NAME", `<span style="font-size:17px;font-weight:600;">${escapeHtml(patientName)}</span>`, 3)}
          ${line("DATE", formatDate(date), 1)}
        </div>
        <div style="display:flex;gap:24px;">
          ${line("ADDRESS", escapeHtml(address), 4)}
          ${line("AGE", age, 0.8)}
          ${line("SEX", gender, 0.8)}
        </div>
      </div>

      <div style="font-family:serif;font-weight:bold;font-size:1.953rem;margin-bottom:16px;">&#8478;</div>

      <div style="min-height:400px;padding:0 8px;margin-top:16px;">
        <div style="display:flex;border-bottom:2px solid #000;padding-bottom:4px;margin-bottom:8px;">
          <div style="flex:2;font-weight:800;font-size:0.85rem;">MEDICATION</div>
          <div style="flex:1;font-weight:800;font-size:0.85rem;">DOSAGE</div>
          <div style="flex:1;font-weight:800;font-size:0.85rem;">FREQUENCY</div>
          <div style="flex:2;font-weight:800;font-size:0.85rem;">INSTRUCTIONS / NOTES</div>
          <div style="flex:1;font-weight:800;font-size:0.85rem;">DURATION</div>
        </div>

        ${
          items.length
            ? items.map((med) => `
          <div style="display:flex;gap:8px;padding:8px 0;border-bottom:1px solid #eee;font-family:'Times New Roman',serif;font-size:1rem;">
            <div style="flex:2;font-weight:600;">${escapeHtml(med.medication || "")}</div>
            <div style="flex:1;">${escapeHtml(med.dosage || "")}</div>
            <div style="flex:1;">${escapeHtml(med.frequency || "")}</div>
            <div style="flex:2;font-style:italic;color:#444;">${escapeHtml(med.instructions || "")}</div>
            <div style="flex:1;">${escapeHtml(med.duration || "")}</div>
          </div>`).join("")
            : `<div style="font-family:'Times New Roman',serif;white-space:pre-wrap;">${escapeHtml(item?.resultDetails?.medications || item?.resultDetails?.remarks || "")}</div>`
        }
      </div>

      <div style="margin-top:48px;display:flex;justify-content:flex-end;">
        <div style="text-align:center;width:280px;">
          <div style="font-weight:800;font-size:16px;margin-bottom:4px;text-transform:uppercase;">DR. ${escapeHtml(doctorName)}</div>
          <div style="border-top:1.5px solid black;width:100%;margin-bottom:8px;"></div>
          <div style="font-size:0.75rem;display:block;font-weight:700;">Lic. No. _____${doctorLic ? doctorLic + "______" : "__________"}</div>
          <div style="font-size:0.75rem;display:block;font-weight:700;">PTR No. ___________</div>
        </div>
      </div>
    </div>
  `;

  return bodyHtml;
}

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
