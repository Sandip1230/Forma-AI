// Translates one field definition from the schema into react-hook-form's
// validation-rule object, so validation logic lives in the schema (as the
// project plan specifies) rather than being hardcoded per form.
export function rulesForField(field) {
  const rules = {};
  if (field.required) {
    rules.required = `${field.label} is required`;
  }
  if (field.type === "text" && field.pattern) {
    rules.pattern = { value: new RegExp(field.pattern), message: field.patternMessage || "Invalid format" };
  }
  return rules;
}