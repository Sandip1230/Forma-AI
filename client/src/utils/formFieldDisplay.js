// Shared by the review screen (DynamicForm.jsx) and the PDF receipt
// generator — both need to turn a form's fields + a raw values object into
// "what a person should actually read", so this logic lives in one place
// rather than drifting between two copies.

// Turns a raw form value into what a person should actually read — an
// option's label instead of its stored value, Yes/No instead of true/false,
// "—" instead of a blank.
export function formatFieldValue(field, value) {
  if (value === undefined || value === null || value === "") return "—";
  if (field.type === "checkbox") return value ? "Yes" : "No";
  if (field.type === "select") {
    const opt = field.options?.find((o) => o.value === value);
    return opt?.label ?? String(value);
  }
  return String(value);
}

export function resolveVisibility(fields, values) {
  const byId = Object.fromEntries(fields.map((f) => [f.id, f]));
  const cache = new Map();

  function isVisible(field, seen = new Set()) {
    if (cache.has(field.id)) return cache.get(field.id);
    if (!field.showIf) {
      cache.set(field.id, true);
      return true;
    }
    if (seen.has(field.id)) return false;

    const parent = byId[field.showIf.field];
    if (!parent) {
      cache.set(field.id, true);
      return true;
    }
    const parentVisible = isVisible(parent, new Set(seen).add(field.id));
    const result = parentVisible && values[field.showIf.field] === field.showIf.equals;
    cache.set(field.id, result);
    return result;
  }

  return Object.fromEntries(fields.map((f) => [f.id, isVisible(f)]));
}
