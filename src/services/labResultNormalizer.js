import { supabase } from "../lib/supabaseClient";
import { getMapping } from "../components/labTemplates/templateMappings";

function normalizeLookupValue(value) {
  return String(value ?? "").trim().toLowerCase();
}

function buildServiceItemIndexes(serviceItems = [], serviceName = "") {
  const byCode = new Map();
  const duplicates = new Set();

  for (const si of serviceItems) {
    const code = normalizeLookupValue(si.code);
    if (!code) continue;

    if (byCode.has(code)) {
      duplicates.add(code);
      continue;
    }

    byCode.set(code, si);
  }

  if (duplicates.size > 0) {
    console.warn(
      `[saveLabResults] duplicate serviceItem.code values detected for serviceName="${serviceName}": ${[...duplicates].join(", ")}`,
    );
  }

  return { byCode };
}

function findServiceItemForField(
  serviceItems = [],
  field = {},
  serviceName = "",
  { warn = false, indexes = null } = {},
) {
  const fieldCode = normalizeLookupValue(field.itemCode);
  const fieldName = normalizeLookupValue(field.itemName);
  const { byCode } = indexes || buildServiceItemIndexes(serviceItems, serviceName);
  const hasAnyServiceItemCode = byCode.size > 0;

  if (fieldCode) {
    const byCodeMatch = byCode.get(fieldCode);

    if (byCodeMatch) {
      return byCodeMatch;
    }

    if (warn) {
      console.warn(
        `[saveLabResults] serviceItems lookup failed: field.itemCode="${field.itemCode}" does not match any lab_service_items.code for serviceName="${serviceName}"`,
      );
    }

    if (hasAnyServiceItemCode) return null;
  } else if (warn) {
    console.warn(
      `[saveLabResults] mapping itemCode missing for serviceName="${serviceName}", field.itemName="${field.itemName ?? ""}"`,
    );
  }

  if (fieldName) {
    const byName = serviceItems.find(
      (si) => normalizeLookupValue(si.name) === fieldName,
    );

    if (byName && (!hasAnyServiceItemCode || !fieldCode)) {
      if (warn) {
        if (!normalizeLookupValue(byName.code)) {
          console.warn(
            `[saveLabResults] serviceItem.code missing for serviceName="${serviceName}", field.itemName="${field.itemName}"`,
          );
        }
        console.warn(
          `[saveLabResults] Falling back to legacy itemName match for field.itemName="${field.itemName}" because serviceItem.code is unavailable on existing data`,
        );
      }
      return byName;
    }
  }

  return null;
}

export async function fetchLabServiceItemsWithResults(labRequestId, labServiceId) {
  if (!labServiceId) {
    return { normalizedItems: [], serviceItems: [] };
  }

  const [serviceRes, resultRes] = await Promise.all([
    supabase
      .from("lab_service_items")
      .select("*")
      .eq("lab_service_id", labServiceId)
      .eq("is_active", true)
      .order("sort_order", { ascending: true, nullsFirst: false }),
    supabase
      .from("lab_result_items")
      .select("*")
      .eq("lab_request_id", labRequestId),
  ]);

  if (serviceRes.error) throw serviceRes.error;
  if (resultRes.error) throw resultRes.error;

  let serviceItems = serviceRes.data || [];
  if (serviceItems.length === 0) {
    const fallbackRes = await supabase
      .from("lab_service_items")
      .select("*")
      .eq("lab_service_id", labServiceId)
      .order("sort_order", { ascending: true, nullsFirst: false });

    if (fallbackRes.error) throw fallbackRes.error;

    serviceItems = fallbackRes.data || [];
    if (serviceItems.length > 0) {
      console.warn(
        `[labResultNormalizer] No active lab_service_items found for labServiceId=${labServiceId}; falling back to all rows (${serviceItems.length})`,
      );
    }
  }

  const resultByItemId = {};
  for (const row of resultRes.data || []) {
    resultByItemId[row.lab_service_item_id] = row;
  }

  const normalizedItems = serviceItems.map((si) => ({
    itemId: si.id,
    code: si.code ?? "",
    name: si.name,
    section: si.section,
    valueKind: si.value_kind,
    resultConventional: resultByItemId[si.id]?.result_conventional ?? "",
    resultSi: resultByItemId[si.id]?.result_si ?? "",
    remarks: resultByItemId[si.id]?.remarks ?? "",
    unitConventional: si.unit_conventional ?? "",
    unitSi: si.unit_si ?? "",
    referenceConventional: si.reference_conventional ?? "",
    referenceSi: si.reference_si ?? "",
    resultId: resultByItemId[si.id]?.id ?? null,
  }));

  return { normalizedItems, serviceItems };
}

export function normalizedToTemplateValues(normalizedItems, serviceName) {
  const mapping = getMapping(serviceName);
  if (!mapping) return {};
  const indexes = buildServiceItemIndexes(normalizedItems, serviceName);

  if (mapping.shape === "nested") {
    const out = {};
    for (const field of mapping.fields) {
      const item = findServiceItemForField(normalizedItems, field, serviceName, {
        indexes,
      });
      out[field.templateKey] = {
        conventional: item?.resultConventional ?? "",
        si: item?.resultSi ?? "",
      };
    }
    return out;
  }

  const out = {};
  for (const field of mapping.fields) {
    const item = findServiceItemForField(normalizedItems, field, serviceName, {
      indexes,
    });
    out[field.templateKey] = item?.resultConventional ?? "";
  }
  return out;
}

export function templateValuesToUpsertPayloads(
  templateValues,
  serviceName,
  labRequestId,
  serviceItems,
) {
  const mapping = getMapping(serviceName);
  if (!mapping) {
    console.warn(
      `[saveLabResults] No template mapping found for service: "${serviceName}"`,
    );
    return [];
  }

  const payloads = [];
  const indexes = buildServiceItemIndexes(serviceItems, serviceName);

  if (mapping.shape === "nested") {
    for (const field of mapping.fields) {
      const serviceItem = findServiceItemForField(
        serviceItems,
        field,
        serviceName,
        { warn: true, indexes },
      );
      if (!serviceItem) {
        continue;
      }

      const vals = templateValues[field.templateKey];
      if (!vals) continue;

      payloads.push({
        lab_request_id: labRequestId,
        lab_service_item_id: serviceItem.id,
        result_conventional: vals.conventional || null,
        result_si: vals.si || null,
        remarks: null,
      });
    }
  } else {
    for (const field of mapping.fields) {
      const serviceItem = findServiceItemForField(
        serviceItems,
        field,
        serviceName,
        { warn: true, indexes },
      );
      if (!serviceItem) {
        continue;
      }

      const val = templateValues[field.templateKey];
      if (val === undefined || val === null) continue;

      payloads.push({
        lab_request_id: labRequestId,
        lab_service_item_id: serviceItem.id,
        result_conventional: val || null,
        result_si: null,
        remarks: null,
      });
    }
  }

  if (payloads.length === 0) {
    const serviceItemCodes = serviceItems
      .map((si) => si?.code)
      .filter(Boolean)
      .slice(0, 20);
    console.warn(
      `[saveLabResults] payloads array is empty before upsert for labRequestId=${labRequestId}, serviceName="${serviceName}", serviceItems=${serviceItems.length}, codes=${serviceItemCodes.join(", ")}`,
    );
    throw new Error(
      `No lab result payloads could be generated for "${serviceName}". Check lab_service_items.code values and templateMappings.itemCode.`,
    );
  }

  return payloads;
}
