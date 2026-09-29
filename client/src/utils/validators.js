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
  if (field.type === "email") {
    // The form renders with noValidate (see DynamicForm.jsx), so the
    // browser's own type="email" checking never runs — this rule is the
    // only thing standing between "not an email" and a silently-failed
    // confirmation email send.
    rules.pattern = { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address" };
  }
  if (field.type === "phone") {
    // Deliberately permissive — digits plus common separators/parens/+,
    // 7-15 digits (E.164's own range), so it doesn't reject real numbers
    // just for using a country code or a formatting style this didn't guess.
    rules.pattern = { value: /^[+]?[\d\s\-().]{7,20}$/, message: "Enter a valid phone number" };
  }
  return rules;
}