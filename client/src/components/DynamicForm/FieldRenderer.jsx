import { rulesForField } from "../../utils/validators";

function AiBadge() {
  return <span className="df-ai-badge" title="Filled by AI — please verify">✦ AI</span>;
}

function FieldRenderer({ field, register, error, aiFilled }) {
  const rules = rulesForField(field);
  const errorEl = error ? <span className="df-field__error">{error.message}</span> : null;

  if (field.type === "select") {
    return (
      <div className="df-field">
        <label htmlFor={field.id}>{field.label}{field.required && <span className="df-required">*</span>}{aiFilled && <AiBadge />}</label>
        <select id={field.id} {...register(field.id, rules)}>
          <option value="">Select…</option>
          {field.options?.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
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
          {field.label}{field.required && <span className="df-required">*</span>}{aiFilled && <AiBadge />}
        </label>
        {errorEl}
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div className="df-field">
        <label htmlFor={field.id}>{field.label}{field.required && <span className="df-required">*</span>}{aiFilled && <AiBadge />}</label>
        <textarea id={field.id} rows={4} placeholder={field.placeholder} {...register(field.id, rules)} />
        {errorEl}
      </div>
    );
  }

  return (
    <div className="df-field">
      <label htmlFor={field.id}>{field.label}{field.required && <span className="df-required">*</span>}{aiFilled && <AiBadge />}</label>
      <input id={field.id} type={field.type === "date" || field.type === "number" ? field.type : "text"} placeholder={field.placeholder} {...register(field.id, rules)} />
      {errorEl}
    </div>
  );
}

export default FieldRenderer;