import { rulesForField } from "../../utils/validators";

const FIELD_ICONS = {
  text: <path d="M4 7V5h16v2M12 5v14M9 19h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />,
  textarea: <path d="M4 6h16M4 10h16M4 14h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />,
  select: <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />,
  checkbox: <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />,
  date: <path d="M7 3v4M17 3v4M4 9h16M5 6h14a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />,
  number: <path d="M6 5v14M12 5v14M9 8h6M9 16h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />,
};

function TypeIcon({ type }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="df-field__icon">
      {FIELD_ICONS[type] || FIELD_ICONS.text}
    </svg>
  );
}

function FieldBadge({ aiFilled, needsReview }) {
  if (needsReview) return <span className="df-badge df-badge--review" title="AI didn't fill this — please check">⚠ Needs review</span>;
  if (aiFilled) return <span className="df-badge df-badge--ai" title="Filled by AI — please verify">✦ AI</span>;
  return null;
}

function FieldRenderer({ field, register, error, aiFilled, needsReview }) {
  const rules = rulesForField(field);
  const errorEl = error ? <span className="df-field__error">{error.message}</span> : null;
  const wrapClass = needsReview ? "df-field df-field--needs-review" : "df-field";

  const labelEl = (
    <label htmlFor={field.id}>
      <TypeIcon type={field.type} />
      {field.label}
      {field.required && <span className="df-required">*</span>}
      <FieldBadge aiFilled={aiFilled} needsReview={needsReview} />
    </label>
  );

  if (field.type === "select") {
    return (
      <div className={wrapClass}>
        {labelEl}
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
          <input id={field.id} type="checkbox" className="df-checkbox" {...register(field.id, rules)} />
          <span className="df-checkbox__box">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
          <span>{field.label}{field.required && <span className="df-required">*</span>}</span>
          <FieldBadge aiFilled={aiFilled} needsReview={needsReview} />
        </label>
        {errorEl}
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div className={wrapClass}>
        {labelEl}
        <textarea id={field.id} rows={4} placeholder={field.placeholder} {...register(field.id, rules)} />
        {errorEl}
      </div>
    );
  }

  return (
    <div className={wrapClass}>
      {labelEl}
      <input id={field.id} type={field.type === "date" || field.type === "number" ? field.type : "text"} placeholder={field.placeholder} {...register(field.id, rules)} />
      {errorEl}
    </div>
  );
}

export default FieldRenderer;