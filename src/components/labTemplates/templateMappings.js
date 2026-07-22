const normalizeServiceName = (value) => String(value || "").trim().toLowerCase();

const MAPPINGS = {
  "blood chemistry": {
    shape: "nested",
    fields: [
      { itemCode: "BCHEM_FBS", itemName: "FBS", templateKey: "FBS", hasConventional: true, hasSi: true },
      { itemCode: "BCHEM_RBS", itemName: "RBS", templateKey: "RBS", hasConventional: true, hasSi: false },
      { itemCode: "BCHEM_BUN", itemName: "BUN", templateKey: "BUN", hasConventional: true, hasSi: true },
      { itemCode: "BCHEM_CREATININE", itemName: "CREATININE", templateKey: "CREATININE", hasConventional: true, hasSi: true },
      { itemCode: "BCHEM_TOTAL_CHOLESTEROL", itemName: "TOTAL CHOLESTEROL", templateKey: "TOTAL CHOLESTEROL", hasConventional: true, hasSi: true },
      { itemCode: "BCHEM_TRIGLYCERIDES", itemName: "TRIGLYCERIDES", templateKey: "TRIGLYCERIDES", hasConventional: true, hasSi: true },
      { itemCode: "BCHEM_HDL", itemName: "HDL", templateKey: "HDL", hasConventional: true, hasSi: true },
      { itemCode: "BCHEM_LDL", itemName: "LDL", templateKey: "LDL", hasConventional: true, hasSi: true },
      { itemCode: "BCHEM_BLOOD_URIC_ACID", itemName: "BLOOD URIC ACID", templateKey: "BLOOD URIC ACID", hasConventional: true, hasSi: true },
      { itemCode: "BCHEM_SGOT", itemName: "SGOT", templateKey: "SGOT", hasConventional: true, hasSi: true },
      { itemCode: "BCHEM_SGPT", itemName: "SGPT", templateKey: "SGPT", hasConventional: true, hasSi: true },
    ],
  },

  "clinical chemistry": {
    shape: "nested",
    fields: [
      { itemCode: "CLIN_NA", itemName: "Na", templateKey: "Na", hasConventional: true, hasSi: true },
      { itemCode: "CLIN_K", itemName: "K", templateKey: "K", hasConventional: true, hasSi: false },
      { itemCode: "CLIN_CL", itemName: "CL", templateKey: "CL", hasConventional: true, hasSi: true },
      { itemCode: "CLIN_CREATININE", itemName: "CREATININE", templateKey: "CREATININE", hasConventional: true, hasSi: true },
      { itemCode: "CLIN_CA", itemName: "Ca", templateKey: "Ca", hasConventional: true, hasSi: true },
    ],
  },

  hematology: {
    shape: "flat",
    fields: [
      { itemCode: "HEMA_RBC", itemName: "RBC Count", templateKey: "rbcCount", hasConventional: true },
      { itemCode: "HEMA_HGB", itemName: "Hemoglobin", templateKey: "hemoglobin", hasConventional: true },
      { itemCode: "HEMA_HCT", itemName: "Hematocrit", templateKey: "hematocrit", hasConventional: true },
      { itemCode: "HEMA_WBC", itemName: "WBC Count", templateKey: "wbcCount", hasConventional: true },
      { itemCode: "HEMA_PLT", itemName: "Platelet Count", templateKey: "plateletCount", hasConventional: true },
      { itemCode: "HEMA_CT", itemName: "Clotting Time", templateKey: "clottingTime", hasConventional: true },
      { itemCode: "HEMA_BT", itemName: "Bleeding Time", templateKey: "bleedingTime", hasConventional: true },
      { itemCode: "HEMA_SEG", itemName: "Segmenters", templateKey: "segmenters", hasConventional: true },
      { itemCode: "HEMA_LYM", itemName: "Lymphocytes", templateKey: "lymphocytes", hasConventional: true },
      { itemCode: "HEMA_EOS", itemName: "Eosinophils", templateKey: "eosinophils", hasConventional: true },
      { itemCode: "HEMA_MONO", itemName: "Monocytes", templateKey: "monocytes", hasConventional: true },
      { itemCode: "HEMA_BASO", itemName: "Basophils", templateKey: "basophils", hasConventional: true },
      { itemCode: "HEMA_BLOOD_TYPE", itemName: "Blood Type", templateKey: "bloodType", hasConventional: true },
    ],
  },

  cbc: "hematology",

  urinalysis: {
    shape: "flat",
    fields: [
      { itemCode: "UA_COLOR", itemName: "Color", templateKey: "color", hasConventional: true },
      { itemCode: "UA_PROTEIN", itemName: "Protein", templateKey: "protein", hasConventional: true },
      { itemCode: "UA_TRANSPARENCY", itemName: "Transparency", templateKey: "transparency", hasConventional: true },
      { itemCode: "UA_SUGAR", itemName: "Sugar", templateKey: "sugar", hasConventional: true },
      { itemCode: "UA_PH", itemName: "pH", templateKey: "ph", hasConventional: true },
      { itemCode: "UA_BILIRUBIN", itemName: "Bilirubin", templateKey: "bilirubin", hasConventional: true },
      { itemCode: "UA_SPECIFIC_GRAVITY", itemName: "Specific Gravity", templateKey: "specificGravity", hasConventional: true },
      { itemCode: "UA_UROBILINOGEN", itemName: "Urobilinogen", templateKey: "urobilinogen", hasConventional: true },
      { itemCode: "UA_BLOOD", itemName: "Blood", templateKey: "blood", hasConventional: true },
      { itemCode: "UA_LEUCOCYTES", itemName: "Leucocytes", templateKey: "leucocytes", hasConventional: true },
      { itemCode: "UA_PUS_CELLS", itemName: "Pus Cells", templateKey: "pusCells", hasConventional: true },
      { itemCode: "UA_EPITHELIAL_CELLS", itemName: "Epithelial Cells", templateKey: "epithelialCells", hasConventional: true },
      { itemCode: "UA_RBC", itemName: "RBC", templateKey: "rbc", hasConventional: true },
      { itemCode: "UA_MUCUS_THREAD", itemName: "Mucus Thread", templateKey: "mucusThread", hasConventional: true },
      { itemCode: "UA_CAST", itemName: "Cast", templateKey: "cast", hasConventional: true },
      { itemCode: "UA_A_URATES", itemName: "A. Urates", templateKey: "aUrates", hasConventional: true },
      { itemCode: "UA_CRYSTALS", itemName: "Crystals", templateKey: "crystals", hasConventional: true },
      { itemCode: "UA_A_PHOSPHATES", itemName: "A. Phosphates", templateKey: "aPhosphates", hasConventional: true },
      { itemCode: "UA_PREGNANCY_TEST", itemName: "Pregnancy Test", templateKey: "pregnancyTest", hasConventional: true },
      { itemCode: "UA_BACTERIA", itemName: "Bacteria", templateKey: "bacteria", hasConventional: true },
      { itemCode: "UA_OTHERS", itemName: "Others", templateKey: "others", hasConventional: true },
    ],
  },

  serology: {
    shape: "flat",
    fields: [
      { itemCode: "SERO_TYPHI_GG", itemName: "Typhidot IgG", templateKey: "typhidotIgG", hasConventional: true },
      { itemCode: "SERO_TYPHI_M", itemName: "Typhidot IgM", templateKey: "typhidotIgM", hasConventional: true },
      { itemCode: "SERO_DENGUE_GG", itemName: "Dengue IgG", templateKey: "dengueIgG", hasConventional: true },
      { itemCode: "SERO_DENGUE_M", itemName: "Dengue IgM", templateKey: "dengueIgM", hasConventional: true },
      { itemCode: "SERO_DENGUE_NS1", itemName: "Dengue NS1 Ag", templateKey: "dengueNS1", hasConventional: true },
      { itemCode: "SERO_HBSAG", itemName: "HBsAg", templateKey: "hbsag", hasConventional: true },
      { itemCode: "SERO_VDRL", itemName: "VDRL (Syphilis)", templateKey: "vdrl", hasConventional: true },
      { itemCode: "SERO_TROPONIN_I", itemName: "Troponin I", templateKey: "troponinI", hasConventional: true },
    ],
  },

  "pregnancy test": {
    shape: "flat",
    fields: [
      { itemCode: "PT_RESULT", itemName: "Result", templateKey: "result", hasConventional: true },
      { itemCode: "PT_METHOD", itemName: "Method", templateKey: "method", hasConventional: true },
      { itemCode: "PT_REMARKS", itemName: "Remarks", templateKey: "remarks", hasConventional: true },
    ],
  },

  "glycated hemoglobin (hba1c)": {
    shape: "flat",
    fields: [
      { itemCode: "HBA1C_RESULT", itemName: "HbA1c Result", templateKey: "resultPercent", hasConventional: true },
    ],
  },
  "glycated hemoglobin(hba1c)": "glycated hemoglobin (hba1c)",
  "hemoglobin (hba1c)": "glycated hemoglobin (hba1c)",

  "blood typing": {
    shape: "flat",
    fields: [
      { itemCode: "BT_BLOOD_TYPE", itemName: "Blood Type", templateKey: "bloodType", hasConventional: true },
      { itemCode: "BT_RH_TYPE", itemName: "RH Type", templateKey: "rhType", hasConventional: true },
    ],
  },

  fecalysis: {
    shape: "flat",
    fields: [
      { itemCode: "FEC_COLOR", itemName: "Color", templateKey: "color", hasConventional: true },
      { itemCode: "FEC_CONSISTENCY", itemName: "Consistency", templateKey: "consistency", hasConventional: true },
      { itemCode: "FEC_WBC", itemName: "WBC", templateKey: "wbc", hasConventional: true },
      { itemCode: "FEC_RBC", itemName: "RBC", templateKey: "rbc", hasConventional: true },
      { itemCode: "FEC_FAT_GLOBULES", itemName: "Fat Globules", templateKey: "fatGlobules", hasConventional: true },
      { itemCode: "FEC_REMARKS", itemName: "Remarks", templateKey: "remarks", hasConventional: true },
      { itemCode: "FEC_ASCARIS", itemName: "Ascaris lumbricoides", templateKey: "ascaris", hasConventional: true },
      { itemCode: "FEC_TRICHURIS", itemName: "Trichuris trichuria", templateKey: "trichuris", hasConventional: true },
      { itemCode: "FEC_ENTAMOEBA_COLI", itemName: "Entamoeba coli", templateKey: "entamoebaColi", hasConventional: true },
      { itemCode: "FEC_ENTAMOEBA_HISTOLYTICA", itemName: "Entamoeba histolytica", templateKey: "entamoebaHistolytica", hasConventional: true },
      { itemCode: "FEC_OTHERS", itemName: "Others", templateKey: "others", hasConventional: true },
    ],
  },

  koh: {
    shape: "flat",
    fields: [
      { itemCode: "KOH_RESULT", itemName: "Result", templateKey: "result", hasConventional: true },
    ],
  },
};

export function getMapping(serviceName) {
  let entry = MAPPINGS[normalizeServiceName(serviceName)];
  while (typeof entry === "string") {
    entry = MAPPINGS[entry];
  }
  return entry || null;
}

export default MAPPINGS;
