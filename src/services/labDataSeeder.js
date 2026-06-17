import { supabase } from "../lib/supabaseClient";

const SERVICES = [
  {
    code: "BLOOD_CHEM",
    name: "Blood Chemistry",
    category: "Chemistry",
    specimen: "Serum",
    price: 0,
    items: [
      { code: "BCHEM_FBS", name: "FBS", section: "Blood Chemistry", valueKind: "number", hasConventional: true, hasSi: true, unitConventional: "mg/dL", unitSi: "mmol/L", referenceConventional: "74-106", referenceSi: "4.1-5.90", sortOrder: 1 },
      { code: "BCHEM_RBS", name: "RBS", section: "Blood Chemistry", valueKind: "number", hasConventional: true, hasSi: false, unitConventional: "mg/dL", referenceConventional: "70-130", sortOrder: 2 },
      { code: "BCHEM_BUN", name: "BUN", section: "Blood Chemistry", valueKind: "number", hasConventional: true, hasSi: true, unitConventional: "mg/dL", unitSi: "mmol/L", referenceConventional: "7-21", referenceSi: "2.4-7.4", sortOrder: 3 },
      { code: "BCHEM_CREATININE", name: "CREATININE", section: "Blood Chemistry", valueKind: "number", hasConventional: true, hasSi: true, unitConventional: "mg/dL", unitSi: "umol/L", referenceConventional: "0.5-1.70", referenceSi: "53-115", sortOrder: 4 },
      { code: "BCHEM_TOTAL_CHOLESTEROL", name: "TOTAL CHOLESTEROL", section: "Blood Chemistry", valueKind: "number", hasConventional: true, hasSi: true, unitConventional: "mg/dL", unitSi: "mmol/L", referenceConventional: "<200", referenceSi: "<5.17", sortOrder: 5 },
      { code: "BCHEM_TRIGLYCERIDES", name: "TRIGLYCERIDES", section: "Blood Chemistry", valueKind: "number", hasConventional: true, hasSi: true, unitConventional: "mg/dL", unitSi: "mmol/L", referenceConventional: "44-148", referenceSi: "<1.69", sortOrder: 6 },
      { code: "BCHEM_HDL", name: "HDL", section: "Blood Chemistry", valueKind: "number", hasConventional: true, hasSi: true, unitConventional: "mg/dL", unitSi: "mmol/L", referenceConventional: "30-75", referenceSi: "0.78-1.9", sortOrder: 7 },
      { code: "BCHEM_LDL", name: "LDL", section: "Blood Chemistry", valueKind: "number", hasConventional: true, hasSi: true, unitConventional: "mg/dL", unitSi: "mmol/L", referenceConventional: "66-178", referenceSi: "1.72-4.6", sortOrder: 8 },
      { code: "BCHEM_BLOOD_URIC_ACID", name: "BLOOD URIC ACID", section: "Blood Chemistry", valueKind: "number", hasConventional: true, hasSi: true, unitConventional: "mg/dL", unitSi: "umol/L", referenceConventional: "2.5-7.7", referenceSi: "155-428", sortOrder: 9 },
      { code: "BCHEM_SGOT", name: "SGOT", section: "Blood Chemistry", valueKind: "number", hasConventional: true, hasSi: true, unitConventional: "U/L", unitSi: "U/L", referenceConventional: "0-40", referenceSi: "0-40", sortOrder: 10 },
      { code: "BCHEM_SGPT", name: "SGPT", section: "Blood Chemistry", valueKind: "number", hasConventional: true, hasSi: true, unitConventional: "U/L", unitSi: "U/L", referenceConventional: "0-38", referenceSi: "0-38", sortOrder: 11 },
    ],
  },
  {
    code: "CLIN_CHEM",
    name: "Clinical Chemistry",
    category: "Chemistry",
    specimen: "Serum",
    price: 0,
    items: [
      { code: "CLIN_NA", name: "Na", section: "Clinical Chemistry", valueKind: "number", hasConventional: true, hasSi: true, unitConventional: "mg/dL", unitSi: "mmol/L", referenceConventional: "74-106", referenceSi: "4.1-5.90", sortOrder: 1 },
      { code: "CLIN_K", name: "K", section: "Clinical Chemistry", valueKind: "number", hasConventional: true, hasSi: false, unitConventional: "mg/dL", referenceConventional: "70-130", sortOrder: 2 },
      { code: "CLIN_CL", name: "CL", section: "Clinical Chemistry", valueKind: "number", hasConventional: true, hasSi: true, unitConventional: "mg/dL", unitSi: "mmol/L", referenceConventional: "7-21", referenceSi: "2.4-7.4", sortOrder: 3 },
      { code: "CLIN_CA", name: "Ca", section: "Clinical Chemistry", valueKind: "number", hasConventional: true, hasSi: true, unitConventional: "mg/dL", unitSi: "mmol/L", referenceConventional: "<200", referenceSi: "<5.17", sortOrder: 5 },
    ],
  },
  {
    code: "HEMA",
    name: "Hematology",
    category: "Hematology",
    specimen: "Whole Blood",
    price: 0,
    items: [
      { code: "HEMA_RBC", name: "RBC Count", section: "Hematology", valueKind: "number", hasConventional: true, hasSi: false, unitConventional: "x10^12/L", referenceConventional: "4.5-5.5", sortOrder: 1 },
      { code: "HEMA_HGB", name: "Hemoglobin", section: "Hematology", valueKind: "number", hasConventional: true, hasSi: false, unitConventional: "g/L", referenceConventional: "M (140-180) / F (120-160)", sortOrder: 2 },
      { code: "HEMA_HCT", name: "Hematocrit", section: "Hematology", valueKind: "number", hasConventional: true, hasSi: false, unitConventional: "", referenceConventional: "M (0.40-0.54) / F (0.31-0.47)", sortOrder: 3 },
      { code: "HEMA_WBC", name: "WBC Count", section: "Hematology", valueKind: "number", hasConventional: true, hasSi: false, unitConventional: "x10^9/L", referenceConventional: "5-11", sortOrder: 4 },
      { code: "HEMA_PLT", name: "Platelet Count", section: "Hematology", valueKind: "number", hasConventional: true, hasSi: false, unitConventional: "x10^9/L", referenceConventional: "150-450", sortOrder: 5 },
      { code: "HEMA_CT", name: "Clotting Time", section: "Hematology", valueKind: "number", hasConventional: true, hasSi: false, unitConventional: "min", referenceConventional: "2-6", sortOrder: 6 },
      { code: "HEMA_BT", name: "Bleeding Time", section: "Hematology", valueKind: "number", hasConventional: true, hasSi: false, unitConventional: "min", referenceConventional: "1-7", sortOrder: 7 },
      { code: "HEMA_SEG", name: "Segmenters", section: "Hematology", valueKind: "number", hasConventional: true, hasSi: false, unitConventional: "", referenceConventional: "0.60-0.70", sortOrder: 8 },
      { code: "HEMA_LYM", name: "Lymphocytes", section: "Hematology", valueKind: "number", hasConventional: true, hasSi: false, unitConventional: "", referenceConventional: "0.20-0.30", sortOrder: 9 },
      { code: "HEMA_EOS", name: "Eosinophils", section: "Hematology", valueKind: "number", hasConventional: true, hasSi: false, unitConventional: "", referenceConventional: "0-0.05", sortOrder: 10 },
      { code: "HEMA_MONO", name: "Monocytes", section: "Hematology", valueKind: "number", hasConventional: true, hasSi: false, unitConventional: "", referenceConventional: "0.03-0.08", sortOrder: 11 },
      { code: "HEMA_BASO", name: "Basophils", section: "Hematology", valueKind: "number", hasConventional: true, hasSi: false, unitConventional: "", referenceConventional: "", sortOrder: 12 },
      { code: "HEMA_BLOOD_TYPE", name: "Blood Type", section: "Hematology", valueKind: "choice", hasConventional: true, hasSi: false, unitConventional: "", referenceConventional: "A/B/AB/O", sortOrder: 13 },
    ],
  },
  {
    code: "UA",
    name: "Urinalysis",
    category: "Urinalysis",
    specimen: "Urine",
    price: 0,
    items: [
      { code: "UA_COLOR", name: "Color", section: "Urinalysis", valueKind: "text", hasConventional: true, hasSi: false, unitConventional: "", referenceConventional: "", sortOrder: 1 },
      { code: "UA_PROTEIN", name: "Protein", section: "Urinalysis", valueKind: "text", hasConventional: true, hasSi: false, unitConventional: "", referenceConventional: "", sortOrder: 2 },
      { code: "UA_TRANSPARENCY", name: "Transparency", section: "Urinalysis", valueKind: "text", hasConventional: true, hasSi: false, unitConventional: "", referenceConventional: "", sortOrder: 3 },
      { code: "UA_SUGAR", name: "Sugar", section: "Urinalysis", valueKind: "text", hasConventional: true, hasSi: false, unitConventional: "", referenceConventional: "", sortOrder: 4 },
      { code: "UA_PH", name: "pH", section: "Urinalysis", valueKind: "number", hasConventional: true, hasSi: false, unitConventional: "", referenceConventional: "", sortOrder: 5 },
      { code: "UA_BILIRUBIN", name: "Bilirubin", section: "Urinalysis", valueKind: "text", hasConventional: true, hasSi: false, unitConventional: "", referenceConventional: "", sortOrder: 6 },
      { code: "UA_SPECIFIC_GRAVITY", name: "Specific Gravity", section: "Urinalysis", valueKind: "number", hasConventional: true, hasSi: false, unitConventional: "", referenceConventional: "", sortOrder: 7 },
      { code: "UA_UROBILINOGEN", name: "Urobilinogen", section: "Urinalysis", valueKind: "text", hasConventional: true, hasSi: false, unitConventional: "", referenceConventional: "", sortOrder: 8 },
      { code: "UA_BLOOD", name: "Blood", section: "Urinalysis", valueKind: "text", hasConventional: true, hasSi: false, unitConventional: "", referenceConventional: "", sortOrder: 9 },
      { code: "UA_LEUCOCYTES", name: "Leucocytes", section: "Urinalysis", valueKind: "text", hasConventional: true, hasSi: false, unitConventional: "", referenceConventional: "", sortOrder: 10 },
      { code: "UA_PUS_CELLS", name: "Pus Cells", section: "Urinalysis", valueKind: "text", hasConventional: true, hasSi: false, unitConventional: "/HPF", referenceConventional: "", sortOrder: 11 },
      { code: "UA_EPITHELIAL_CELLS", name: "Epithelial Cells", section: "Urinalysis", valueKind: "text", hasConventional: true, hasSi: false, unitConventional: "/HPF", referenceConventional: "", sortOrder: 12 },
      { code: "UA_RBC", name: "RBC", section: "Urinalysis", valueKind: "text", hasConventional: true, hasSi: false, unitConventional: "/HPF", referenceConventional: "", sortOrder: 13 },
      { code: "UA_MUCUS_THREAD", name: "Mucus Thread", section: "Urinalysis", valueKind: "text", hasConventional: true, hasSi: false, unitConventional: "", referenceConventional: "", sortOrder: 14 },
      { code: "UA_CAST", name: "Cast", section: "Urinalysis", valueKind: "text", hasConventional: true, hasSi: false, unitConventional: "/HPF", referenceConventional: "", sortOrder: 15 },
      { code: "UA_A_URATES", name: "A. Urates", section: "Urinalysis", valueKind: "text", hasConventional: true, hasSi: false, unitConventional: "", referenceConventional: "", sortOrder: 16 },
      { code: "UA_CRYSTALS", name: "Crystals", section: "Urinalysis", valueKind: "text", hasConventional: true, hasSi: false, unitConventional: "", referenceConventional: "", sortOrder: 17 },
      { code: "UA_A_PHOSPHATES", name: "A. Phosphates", section: "Urinalysis", valueKind: "text", hasConventional: true, hasSi: false, unitConventional: "", referenceConventional: "", sortOrder: 18 },
      { code: "UA_PREGNANCY_TEST", name: "Pregnancy Test", section: "Urinalysis", valueKind: "text", hasConventional: true, hasSi: false, unitConventional: "", referenceConventional: "", sortOrder: 19 },
      { code: "UA_BACTERIA", name: "Bacteria", section: "Urinalysis", valueKind: "text", hasConventional: true, hasSi: false, unitConventional: "", referenceConventional: "", sortOrder: 20 },
      { code: "UA_OTHERS", name: "Others", section: "Urinalysis", valueKind: "text", hasConventional: true, hasSi: false, unitConventional: "", referenceConventional: "", sortOrder: 21 },
    ],
  },
  {
    code: "SERO",
    name: "Serology",
    category: "Serology",
    specimen: "Serum",
    price: 0,
    items: [
      { code: "SERO_TYPHI_GG", name: "Typhidot IgG", section: "Serology", valueKind: "text", hasConventional: true, hasSi: false, unitConventional: "", referenceConventional: "", sortOrder: 1 },
      { code: "SERO_TYPHI_M", name: "Typhidot IgM", section: "Serology", valueKind: "text", hasConventional: true, hasSi: false, unitConventional: "", referenceConventional: "", sortOrder: 2 },
      { code: "SERO_DENGUE_GG", name: "Dengue IgG", section: "Serology", valueKind: "text", hasConventional: true, hasSi: false, unitConventional: "", referenceConventional: "", sortOrder: 3 },
      { code: "SERO_DENGUE_M", name: "Dengue IgM", section: "Serology", valueKind: "text", hasConventional: true, hasSi: false, unitConventional: "", referenceConventional: "", sortOrder: 4 },
      { code: "SERO_DENGUE_NS1", name: "Dengue NS1 Ag", section: "Serology", valueKind: "text", hasConventional: true, hasSi: false, unitConventional: "", referenceConventional: "", sortOrder: 5 },
      { code: "SERO_HBSAG", name: "HBsAg", section: "Serology", valueKind: "text", hasConventional: true, hasSi: false, unitConventional: "", referenceConventional: "", sortOrder: 6 },
      { code: "SERO_VDRL", name: "VDRL (Syphilis)", section: "Serology", valueKind: "text", hasConventional: true, hasSi: false, unitConventional: "", referenceConventional: "", sortOrder: 7 },
      { code: "SERO_TROPONIN_I", name: "Troponin I", section: "Serology", valueKind: "text", hasConventional: true, hasSi: false, unitConventional: "", referenceConventional: "", sortOrder: 8 },
    ],
  },
  {
    code: "PREGNANCY",
    name: "Pregnancy Test",
    category: "Immunology",
    specimen: "Urine",
    price: 0,
    items: [
      { code: "PT_RESULT", name: "Result", section: "Pregnancy Test", valueKind: "choice", hasConventional: true, hasSi: false, unitConventional: "", referenceConventional: "NEGATIVE/POSITIVE", sortOrder: 1 },
      { code: "PT_METHOD", name: "Method", section: "Pregnancy Test", valueKind: "text", hasConventional: true, hasSi: false, unitConventional: "", referenceConventional: "", sortOrder: 2 },
      { code: "PT_REMARKS", name: "Remarks", section: "Pregnancy Test", valueKind: "text", hasConventional: true, hasSi: false, unitConventional: "", referenceConventional: "", sortOrder: 3 },
    ],
  },
  {
    code: "HBA1C",
    name: "Glycated Hemoglobin (HbA1c)",
    category: "Chemistry",
    specimen: "Whole Blood",
    price: 0,
    items: [
      { code: "HBA1C_RESULT", name: "HbA1c Result", section: "HbA1c", valueKind: "number", hasConventional: true, hasSi: false, unitConventional: "%", referenceConventional: "", sortOrder: 1 },
    ],
  },
  {
    code: "BT",
    name: "Blood Typing",
    category: "Immunohematology",
    specimen: "Whole Blood",
    price: 0,
    items: [
      { code: "BT_BLOOD_TYPE", name: "Blood Type", section: "Blood Typing", valueKind: "choice", hasConventional: true, hasSi: false, unitConventional: "", referenceConventional: "A/B/AB/O", sortOrder: 1 },
      { code: "BT_RH_TYPE", name: "RH Type", section: "Blood Typing", valueKind: "choice", hasConventional: true, hasSi: false, unitConventional: "", referenceConventional: "POSITIVE/NEGATIVE", sortOrder: 2 },
    ],
  },
  {
    code: "FECALYSIS",
    name: "Fecalysis",
    category: "Microscopy",
    specimen: "Stool",
    price: 0,
    items: [
      { code: "FEC_COLOR", name: "Color", section: "Fecalysis", valueKind: "text", hasConventional: true, hasSi: false, unitConventional: "", referenceConventional: "", sortOrder: 1 },
      { code: "FEC_CONSISTENCY", name: "Consistency", section: "Fecalysis", valueKind: "text", hasConventional: true, hasSi: false, unitConventional: "", referenceConventional: "", sortOrder: 2 },
      { code: "FEC_WBC", name: "WBC", section: "Fecalysis", valueKind: "text", hasConventional: true, hasSi: false, unitConventional: "/HPF", referenceConventional: "", sortOrder: 3 },
      { code: "FEC_RBC", name: "RBC", section: "Fecalysis", valueKind: "text", hasConventional: true, hasSi: false, unitConventional: "/HPF", referenceConventional: "", sortOrder: 4 },
      { code: "FEC_FAT_GLOBULES", name: "Fat Globules", section: "Fecalysis", valueKind: "text", hasConventional: true, hasSi: false, unitConventional: "", referenceConventional: "", sortOrder: 5 },
      { code: "FEC_REMARKS", name: "Remarks", section: "Fecalysis", valueKind: "text", hasConventional: true, hasSi: false, unitConventional: "", referenceConventional: "", sortOrder: 6 },
      { code: "FEC_ASCARIS", name: "Ascaris lumbricoides", section: "Fecalysis", valueKind: "text", hasConventional: true, hasSi: false, unitConventional: "", referenceConventional: "", sortOrder: 7 },
      { code: "FEC_TRICHURIS", name: "Trichuris trichuria", section: "Fecalysis", valueKind: "text", hasConventional: true, hasSi: false, unitConventional: "", referenceConventional: "", sortOrder: 8 },
      { code: "FEC_ENTAMOEBA_COLI", name: "Entamoeba coli", section: "Fecalysis", valueKind: "text", hasConventional: true, hasSi: false, unitConventional: "", referenceConventional: "", sortOrder: 9 },
      { code: "FEC_ENTAMOEBA_HISTOLYTICA", name: "Entamoeba histolytica", section: "Fecalysis", valueKind: "text", hasConventional: true, hasSi: false, unitConventional: "", referenceConventional: "", sortOrder: 10 },
      { code: "FEC_OTHERS", name: "Others", section: "Fecalysis", valueKind: "text", hasConventional: true, hasSi: false, unitConventional: "", referenceConventional: "", sortOrder: 11 },
    ],
  },
  {
    code: "KOH",
    name: "KOH",
    category: "Microscopy",
    specimen: "Skin Scraping",
    price: 0,
    items: [
      { code: "KOH_RESULT", name: "Result", section: "KOH", valueKind: "choice", hasConventional: true, hasSi: false, unitConventional: "", referenceConventional: "NEGATIVE/POSITIVE FOR FUNGAL ELEMENTS", sortOrder: 1 },
    ],
  },
];

export async function seedLabData() {
  const created = [];

  for (const svc of SERVICES) {
    const { data: serviceData, error: serviceErr } = await supabase
      .from("lab_services")
      .upsert(
        {
          code: svc.code,
          name: svc.name,
          category: svc.category,
          specimen: svc.specimen,
          price: svc.price,
        },
        { onConflict: "code", ignoreDuplicates: false },
      )
      .select("id, name")
      .single();

    if (serviceErr) {
      console.error(`Failed to upsert lab_service "${svc.name}":`, serviceErr);
      continue;
    }

    const itemsPayload = svc.items.map((item) => ({
      code: item.code,
      lab_service_id: serviceData.id,
      name: item.name,
      section: item.section,
      value_kind: item.valueKind,
      has_conventional: item.hasConventional,
      has_si: item.hasSi || false,
      unit_conventional: item.unitConventional || null,
      unit_si: item.unitSi || null,
      reference_conventional: item.referenceConventional || null,
      reference_si: item.referenceSi || null,
      sort_order: item.sortOrder,
    }));

    if (itemsPayload.length > 0) {
      const { error: itemsErr } = await supabase
        .from("lab_service_items")
        .upsert(itemsPayload, {
          onConflict: "code",
          ignoreDuplicates: false,
        });

      if (itemsErr) {
        console.error(`Failed to upsert items for "${svc.name}":`, itemsErr);
      }
    }

    created.push({
      service: serviceData.name,
      id: serviceData.id,
      itemsAdded: itemsPayload.length,
    });
  }

  return created;
}

export default seedLabData;
