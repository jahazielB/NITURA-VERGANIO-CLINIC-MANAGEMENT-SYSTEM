/**
 * DEPRECATED — This mapper serialized template values into
 * { field_name, field_value, sort_order } columns that no longer
 * exist in the database. Use labResultNormalizer.js instead.
 */

const DEFAULT_ROW_KEY_FIELDS = [
  "field_name",
  "fieldName",
  "result_key",
  "resultKey",
  "item_key",
  "itemKey",
  "key",
  "name",
  "label",
];

const DEFAULT_ROW_VALUE_FIELDS = [
  "field_value",
  "fieldValue",
  "result_value",
  "resultValue",
  "value",
  "text_value",
  "textValue",
  "json_value",
  "jsonValue",
];

const DEFAULT_META_FIELDS = new Set([
  "id",
  "lab_request_id",
  "labRequestId",
  "created_at",
  "createdAt",
  "updated_at",
  "updatedAt",
  "deleted_at",
  "deletedAt",
  "sort_order",
  "sortOrder",
  "order_index",
  "orderIndex",
  "field_name",
  "fieldName",
  "result_key",
  "resultKey",
  "item_key",
  "itemKey",
  "key",
  "name",
  "label",
  "field_value",
  "fieldValue",
  "result_value",
  "resultValue",
  "value",
  "text_value",
  "textValue",
  "json_value",
  "jsonValue",
]);

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === "[object Object]";
}

function isEmptyObject(value) {
  return isPlainObject(value) && Object.keys(value).length === 0;
}

function parseMaybeJson(value) {
  if (typeof value !== "string") return value;

  const trimmed = value.trim();
  if (!trimmed) return value;
  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return value;
    }
  }

  return value;
}

function deepClone(value) {
  if (Array.isArray(value)) {
    return value.map((item) => deepClone(item));
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, deepClone(item)]),
    );
  }

  return value;
}

function setPath(target, path, value) {
  const parts = String(path).split(".").filter(Boolean);
  if (!parts.length) return target;

  let cursor = target;
  for (let i = 0; i < parts.length; i += 1) {
    const part = parts[i];
    const isLast = i === parts.length - 1;

    if (isLast) {
      cursor[part] = deepClone(value);
      return target;
    }

    if (!isPlainObject(cursor[part])) {
      cursor[part] = {};
    }

    cursor = cursor[part];
  }

  return target;
}

function pickFirstDefined(source, fields) {
  for (const field of fields) {
    if (source?.[field] !== undefined) return source[field];
  }
  return undefined;
}

function normalizeRowValue(value) {
  const parsed = parseMaybeJson(value);

  if (parsed === null || parsed === undefined) return "";
  return parsed;
}

function serializeValue(value) {
  if (value === undefined) return null;
  if (value === null) return null;
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value) || isPlainObject(value)) {
    return JSON.stringify(value);
  }

  return value;
}

function flattenTemplateValues(value, path = [], output = []) {
  if (value === undefined) return output;

  if (value === null) {
    output.push({ path, value: null });
    return output;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      output.push({ path, value: [] });
      return output;
    }

    value.forEach((item, index) => {
      flattenTemplateValues(item, [...path, String(index)], output);
    });
    return output;
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value);
    if (!entries.length) {
      output.push({ path, value: {} });
      return output;
    }

    entries.forEach(([key, item]) => {
      flattenTemplateValues(item, [...path, key], output);
    });
    return output;
  }

  output.push({ path, value });
  return output;
}

function rowsToStructuredObject(rows, options = {}) {
  const keyFields = options.keyFields || DEFAULT_ROW_KEY_FIELDS;
  const valueFields = options.valueFields || DEFAULT_ROW_VALUE_FIELDS;
  const metaFields = new Set([
    ...DEFAULT_META_FIELDS,
    ...(options.metaFields || []),
  ]);

  const out = {};
  const list = Array.isArray(rows) ? rows : rows ? [rows] : [];

  for (const row of list) {
    if (!row) continue;

    const directResult =
      row.result_details ??
      row.resultDetails ??
      row.template_values ??
      row.templateValues ??
      row.payload ??
      row.data;

    if (isPlainObject(directResult)) {
      Object.assign(out, deepClone(directResult));
      continue;
    }

    const key = pickFirstDefined(row, keyFields);
    const value = pickFirstDefined(row, valueFields);

    if (key !== undefined) {
      setPath(out, key, normalizeRowValue(value));
      continue;
    }

    const fallback = {};
    for (const [field, fieldValue] of Object.entries(row)) {
      if (!metaFields.has(field)) {
        fallback[field] = deepClone(fieldValue);
      }
    }

    if (!isEmptyObject(fallback)) {
      Object.assign(out, fallback);
    }
  }

  return out;
}

function structuredObjectToRows(value, options = {}) {
  const keyField = options.keyField || "field_name";
  const valueField = options.valueField || "field_value";
  const orderField = options.orderField || "sort_order";
  const extraFields = options.extraFields || {};

  const flattened = flattenTemplateValues(value);

  return flattened.map((entry, index) => ({
    [keyField]: entry.path.join("."),
    [valueField]: serializeValue(entry.value),
    [orderField]: index,
    ...extraFields,
  }));
}

export function labResultItemsRowsToTemplateValues(rows, options = {}) {
  return rowsToStructuredObject(rows, options);
}

export function templateValuesToLabResultItemsPayloads(values, options = {}) {
  return structuredObjectToRows(values, options);
}

export default {
  labResultItemsRowsToTemplateValues,
  templateValuesToLabResultItemsPayloads,
};
