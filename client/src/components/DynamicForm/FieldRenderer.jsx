import { rulesForField } from "../../utils/validators";

function FieldBadge({ aiFilled, needsReview }) {
  if (needsReview) return <span className="df-badge df-badge--review" title="AI didn't fill this — please check">⚠ Needs review</span>;
  if (aiFilled) return <span className="df-badge df-badge--ai" title="Filled by AI — please verify">✦ AI</span>;
  return null;
}

function FieldRenderer({ field, register, error, aiFilled, needsReview }) {
  const rules = rulesForField(field);
  const errorEl = error ? <span className="df-field__error">{error.message}</span> : null;
  const wrapClass = needsReview ? "df-field df-field--needs-review" : "df-field";

  if (field.type === "select") {
    return (
      <div className={wrapClass}>
        <label htmlFor={field.id}>{field.label}{field.required && <span className="df-required">*</span>}<FieldBadge aiFilled={aiFilled} needsReview={needsReview} /></label>
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
      <div className={`${wrapClass} df-field--checkbox`}>
        <label htmlFor={field.id}>
          <input id={field.id} type="checkbox" {...register(field.id, rules)} />
          {field.label}{field.required && <span className="df-required">*</span>}<FieldBadge aiFilled={aiFilled} needsReview={needsReview} />
        </label>
        {errorEl}
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div className={wrapClass}>
        <label htmlFor={field.id}>{field.label}{field.required && <span className="df-required">*</span>}<FieldBadge aiFilled={aiFilled} needsReview={needsReview} /></label>
        <textarea id={field.id} rows={4} placeholder={field.placeholder} {...register(field.id, rules)} />
        {errorEl}
      </div>
    );
  }

  return (
    <div className={wrapClass}>
      <label htmlFor={field.id}>{field.label}{field.required && <span className="df-required">*</span>}<FieldBadge aiFilled={aiFilled} needsReview={needsReview} /></label>
      <input id={field.id} type={field.type === "date" || field.type === "number" ? field.type : "text"} placeholder={field.placeholder} {...register(field.id, rules)} />
      {errorEl}
    </div>
  );
}

export default FieldRenderer;