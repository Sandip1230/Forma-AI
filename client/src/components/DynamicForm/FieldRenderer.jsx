import { rulesForField } from "../../utils/validators";

function FieldRenderer({ field, register, error }) {
  const rules = rulesForField(field);

  const errorEl = error ? <span className="df-field__error">{error.message}</span> : null;

  if (field.type === "select") {
    return (
      <div className="df-field">
        <label htmlFor={field.id}>{field.label}{field.required && <span className="df-required">*</span>}</label>
        <select id={field.id} {...register(field.id, rules)}>
          <option value="">Select…</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {errorEl}
      </div>
    );
  }

  if (field.type === "checkbox") {
    return (
      <div className="df-field df-field--checkbox">
        <label htmlFor={field.id}>
          <input id={field.id} type="checkbox" {...register(field.id, rules)} />
          {field.label}{field.required && <span className="df-required">*</span>}
        </label>
        {errorEl}
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div className="df-field">
        <label htmlFor={field.id}>{field.label}{field.required && <span className="df-required">*</span>}</label>
        <textarea id={field.id} rows={4} placeholder={field.placeholder} {...register(field.id, rules)} />
        {errorEl}
      </div>
    );
  }

  // text, date, number, and anything else default to a plain <input>
  return (
    <div className="df-field">
      <label htmlFor={field.id}>{field.label}{field.required && <span className="df-required">*</span>}</label>
      <input id={field.id} type={field.type === "date" || field.type === "number" ? field.type : "text"} placeholder={field.placeholder} {...register(field.id, rules)} />
      {errorEl}
    </div>
  );
}

export default FieldRenderer;