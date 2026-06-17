alter table if exists public.lab_service_items
add column if not exists code text;

with mappings(service_code, item_name, item_code) as (
  values
    ('BLOOD_CHEM', 'FBS', 'BCHEM_FBS'),
    ('BLOOD_CHEM', 'RBS', 'BCHEM_RBS'),
    ('BLOOD_CHEM', 'BUN', 'BCHEM_BUN'),
    ('BLOOD_CHEM', 'CREATININE', 'BCHEM_CREATININE'),
    ('BLOOD_CHEM', 'TOTAL CHOLESTEROL', 'BCHEM_TOTAL_CHOLESTEROL'),
    ('BLOOD_CHEM', 'TRIGLYCERIDES', 'BCHEM_TRIGLYCERIDES'),
    ('BLOOD_CHEM', 'HDL', 'BCHEM_HDL'),
    ('BLOOD_CHEM', 'LDL', 'BCHEM_LDL'),
    ('BLOOD_CHEM', 'BLOOD URIC ACID', 'BCHEM_BLOOD_URIC_ACID'),
    ('BLOOD_CHEM', 'SGOT', 'BCHEM_SGOT'),
    ('BLOOD_CHEM', 'SGPT', 'BCHEM_SGPT'),

    ('CLIN_CHEM', 'Na', 'CLIN_NA'),
    ('CLIN_CHEM', 'K', 'CLIN_K'),
    ('CLIN_CHEM', 'CL', 'CLIN_CL'),
    ('CLIN_CHEM', 'Ca', 'CLIN_CA'),

    ('HEMA', 'RBC Count', 'HEMA_RBC'),
    ('HEMA', 'Hemoglobin', 'HEMA_HGB'),
    ('HEMA', 'Hematocrit', 'HEMA_HCT'),
    ('HEMA', 'WBC Count', 'HEMA_WBC'),
    ('HEMA', 'Platelet Count', 'HEMA_PLT'),
    ('HEMA', 'Clotting Time', 'HEMA_CT'),
    ('HEMA', 'Bleeding Time', 'HEMA_BT'),
    ('HEMA', 'Segmenters', 'HEMA_SEG'),
    ('HEMA', 'Lymphocytes', 'HEMA_LYM'),
    ('HEMA', 'Eosinophils', 'HEMA_EOS'),
    ('HEMA', 'Monocytes', 'HEMA_MONO'),
    ('HEMA', 'Basophils', 'HEMA_BASO'),
    ('HEMA', 'Blood Type', 'HEMA_BLOOD_TYPE'),

    ('UA', 'Color', 'UA_COLOR'),
    ('UA', 'Protein', 'UA_PROTEIN'),
    ('UA', 'Transparency', 'UA_TRANSPARENCY'),
    ('UA', 'Sugar', 'UA_SUGAR'),
    ('UA', 'pH', 'UA_PH'),
    ('UA', 'Bilirubin', 'UA_BILIRUBIN'),
    ('UA', 'Specific Gravity', 'UA_SPECIFIC_GRAVITY'),
    ('UA', 'Urobilinogen', 'UA_UROBILINOGEN'),
    ('UA', 'Blood', 'UA_BLOOD'),
    ('UA', 'Leucocytes', 'UA_LEUCOCYTES'),
    ('UA', 'Pus Cells', 'UA_PUS_CELLS'),
    ('UA', 'Epithelial Cells', 'UA_EPITHELIAL_CELLS'),
    ('UA', 'RBC', 'UA_RBC'),
    ('UA', 'Mucus Thread', 'UA_MUCUS_THREAD'),
    ('UA', 'Cast', 'UA_CAST'),
    ('UA', 'A. Urates', 'UA_A_URATES'),
    ('UA', 'Crystals', 'UA_CRYSTALS'),
    ('UA', 'A. Phosphates', 'UA_A_PHOSPHATES'),
    ('UA', 'Pregnancy Test', 'UA_PREGNANCY_TEST'),
    ('UA', 'Bacteria', 'UA_BACTERIA'),
    ('UA', 'Others', 'UA_OTHERS'),

    ('SERO', 'Typhidot IgG', 'SERO_TYPHI_GG'),
    ('SERO', 'Typhidot IgM', 'SERO_TYPHI_M'),
    ('SERO', 'Dengue IgG', 'SERO_DENGUE_GG'),
    ('SERO', 'Dengue IgM', 'SERO_DENGUE_M'),
    ('SERO', 'Dengue NS1 Ag', 'SERO_DENGUE_NS1'),
    ('SERO', 'HBsAg', 'SERO_HBSAG'),
    ('SERO', 'VDRL (Syphilis)', 'SERO_VDRL'),
    ('SERO', 'Troponin I', 'SERO_TROPONIN_I'),

    ('PREGNANCY', 'Result', 'PT_RESULT'),
    ('PREGNANCY', 'Method', 'PT_METHOD'),
    ('PREGNANCY', 'Remarks', 'PT_REMARKS'),

    ('HBA1C', 'HbA1c Result', 'HBA1C_RESULT'),

    ('BT', 'Blood Type', 'BT_BLOOD_TYPE'),
    ('BT', 'RH Type', 'BT_RH_TYPE'),

    ('FECALYSIS', 'Color', 'FEC_COLOR'),
    ('FECALYSIS', 'Consistency', 'FEC_CONSISTENCY'),
    ('FECALYSIS', 'WBC', 'FEC_WBC'),
    ('FECALYSIS', 'RBC', 'FEC_RBC'),
    ('FECALYSIS', 'Fat Globules', 'FEC_FAT_GLOBULES'),
    ('FECALYSIS', 'Remarks', 'FEC_REMARKS'),
    ('FECALYSIS', 'Ascaris lumbricoides', 'FEC_ASCARIS'),
    ('FECALYSIS', 'Trichuris trichuria', 'FEC_TRICHURIS'),
    ('FECALYSIS', 'Entamoeba coli', 'FEC_ENTAMOEBA_COLI'),
    ('FECALYSIS', 'Entamoeba histolytica', 'FEC_ENTAMOEBA_HISTOLYTICA'),
    ('FECALYSIS', 'Others', 'FEC_OTHERS'),

    ('KOH', 'Result', 'KOH_RESULT')
)
update public.lab_service_items lsi
set code = mappings.item_code
from public.lab_services ls
join mappings
  on mappings.service_code = ls.code
where lsi.lab_service_id = ls.id
  and lsi.name = mappings.item_name
  and nullif(trim(lsi.code), '') is null;

create unique index if not exists lab_service_items_code_key
  on public.lab_service_items(code);
