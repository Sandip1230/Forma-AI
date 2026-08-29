import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createSchema } from "../services/api";
import Logo from "../components/Logo";
import "./FormBuilder.css";
import "./CreateForm.css";

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "textarea", label: "Long text" },
  { value: "select", label: "Dropdown" },
  { value: "checkbox", label: "Checkbox" },
  { value: "date", label: "Date" },
  { value: "number", label: "Number" },
];

// Turns a label like "What happened?" into a usable field id ("whatHappened")
// so most fields never need their id typed by hand.
function slugify(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+(.)/g, (_, c) => c.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, "");
}

let keySeq = 0;
function newFieldKey() {
  keySeq += 1;
  return `f${keySeq}-${Date.now()}`;
}

function blankField() {
  return {
    _key: newFieldKey(),
    id: "",
    idTouched: false,
    label: "",
    type: "text",
    required: false,
    placeholder: "",
    options: [{ value: "", label: "" }],
    showIfEnabled: false,
    showIfField: "",
    showIfEquals: "",
  };
}

function coerceEquals(value, parentType) {
  if (parentType === "checkbox") return value === "true";
  if (parentType === "number") return Number(value);
  return value;
}

function OptionsEditor({ options, onChange }) {
  const update = (i, patch) => onChange(options.map((o, idx) => (idx === i ? { ...o, ...patch } : o)));
  const remove = (i) => onChange(options.filter((_, idx) => idx !== i));
  const add = () => onChange([...options, { value: "", label: "" }]);

  return (
    <div className="cf-options">
      <label className="cf-options__label">Options</label>
      {options.map((opt, i) => (
        <div className="cf-options__row" key={i}>
          <input placeholder="value (stored)" value={opt.value} onChange={(e) => update(i, { value: e.target.value })} />
          <input placeholder="label (shown)" value={opt.label} onChange={(e) => update(i, { label: e.target.value })} />
          <button
            type="button"
            className="cf-icon-btn"
            onClick={() => remove(i)}
            disabled={options.length <= 1}
            title="Remove option"
          >
            ✕
          </button>
        </div>
      ))}
      <button type="button" className="cf-add-btn" onClick={add}>
        + Add option
      </button>
    </div>
  );
}

function FieldEditor({ field, index, total, priorFields, onChange, onRemove, onMove, canRemove }) {
  const set = (patch) => onChange(field._key, patch);
  const parent = priorFields.find((f) => f.id === field.showIfField);

  return (
    <div className="cf-field-card">
      <div className="cf-field-card__head">
        <span className="cf-field-card__index">Field {index + 1}</span>
        <div className="cf-field-card__actions">
          <button type="button" className="cf-icon-btn" onClick={() => onMove(field._key, -1)} disabled={index === 0} title="Move up">
            ↑
          </button>
          <button type="button" className="cf-icon-btn" onClick={() => onMove(field._key, 1)} disabled={index === total - 1} title="Move down">
            ↓
          </button>
          <button
            type="button"
            className="cf-icon-btn cf-icon-btn--danger"
            onClick={() => onRemove(field._key)}
            disabled={!canRemove}
            title="Remove field"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="cf-field-card__grid">
        <div className="df-field">
          <label>Label</label>
          <input
            value={field.label}
            onChange={(e) => {
              const label = e.target.value;
              set(field.idTouched ? { label } : { label, id: slugify(label) });
            }}
            placeholder="e.g. What happened?"
          />
        </div>

        <div className="df-field">
          <label>Field ID</label>
          <input value={field.id} onChange={(e) => set({ id: e.target.value, idTouched: true })} placeholder="e.g. whatHappened" />
        </div>

        <div className="df-field">
          <label>Type</label>
          <select value={field.type} onChange={(e) => set({ type: e.target.value })}>
            {FIELD_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {field.type !== "checkbox" && (
          <div className="df-field">
            <label>Placeholder (optional)</label>
            <input value={field.placeholder} onChange={(e) => set({ placeholder: e.target.value })} />
          </div>
        )}

        <label className="cf-required-toggle">
          <input type="checkbox" checked={field.required} onChange={(e) => set({ required: e.target.checked })} />
          Required
        </label>
      </div>

      {field.type === "select" && <OptionsEditor options={field.options} onChange={(options) => set({ options })} />}

      <div className="cf-showif">
        <label className="cf-showif__toggle">
          <input
            type="checkbox"
            checked={field.showIfEnabled}
            onChange={(e) => set({ showIfEnabled: e.target.checked, showIfField: "", showIfEquals: "" })}
            disabled={priorFields.length === 0}
          />
          Only show this field conditionally
          {priorFields.length === 0 && <span className="cf-showif__hint"> (add an earlier field first)</span>}
        </label>

        {field.showIfEnabled && (
          <div className="cf-showif__grid">
            <select value={field.showIfField} onChange={(e) => set({ showIfField: e.target.value, showIfEquals: "" })}>
              <option value="">Choose a field…</option>
              {priorFields.map((f) => (
                <option key={f._key} value={f.id}>
                  {f.label || f.id}
                </option>
              ))}
            </select>
            <span className="cf-showif__equals">equals</span>
            {parent?.type === "select" ? (
              <select value={field.showIfEquals} onChange={(e) => set({ showIfEquals: e.target.value })}>
                <option value="">Choose a value…</option>
                {parent.options
                  .filter((o) => o.value.trim())
                  .map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label || o.value}
                    </option>
                  ))}
              </select>
            ) : parent?.type === "checkbox" ? (
              <select value={field.showIfEquals} onChange={(e) => set({ showIfEquals: e.target.value })}>
                <option value="">Choose…</option>
                <option value="true">Checked</option>
                <option value="false">Unchecked</option>
              </select>
            ) : (
              <input value={field.showIfEquals} onChange={(e) => set({ showIfEquals: e.target.value })} placeholder="value" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CreateForm() {
  const navigate = useNavigate();
  const [formId, setFormId] = useState("");
  const [title, setTitle] = useState("");
  const [fields, setFields] = useState([blankField()]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const updateField = (key, patch) => setFields((fs) => fs.map((f) => (f._key === key ? { ...f, ...patch } : f)));
  const removeField = (key) => setFields((fs) => fs.filter((f) => f._key !== key));
  const addField = () => setFields((fs) => [...fs, blankField()]);
  const moveField = (key, dir) => {
    setFields((fs) => {
      const i = fs.findIndex((f) => f._key === key);
      const j = i + dir;
      if (j < 0 || j >= fs.length) return fs;
      const copy = [...fs];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  };

  const validate = () => {
    if (!formId.trim()) return "A form ID is required.";
    if (!/^[a-zA-Z0-9-]+$/.test(formId.trim())) return "Form ID can only contain letters, numbers and hyphens.";
    if (!title.trim()) return "A title is required.";
    if (fields.length === 0) return "Add at least one field.";

    const ids = new Set();
    for (const [i, f] of fields.entries()) {
      if (!f.label.trim()) return `Field ${i + 1}: label is required.`;
      if (!f.id.trim()) return `Field ${i + 1}: field ID is required.`;
      if (ids.has(f.id)) return `Field ${i + 1}: field ID "${f.id}" is used more than once.`;
      ids.add(f.id);
      if (f.type === "select" && f.options.filter((o) => o.value.trim()).length === 0) {
        return `Field ${i + 1}: a dropdown needs at least one option.`;
      }
      if (f.showIfEnabled && (!f.showIfField || f.showIfEquals === "")) {
        return `Field ${i + 1}: finish or disable its conditional visibility.`;
      }
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setSubmitting(true);

    const byId = Object.fromEntries(fields.map((f) => [f.id, f]));
    const payloadFields = fields.map((f) => {
      const field = { id: f.id.trim(), label: f.label.trim(), type: f.type, required: f.required };
      if (f.placeholder.trim()) field.placeholder = f.placeholder.trim();
      if (f.type === "select") {
        field.options = f.options
          .filter((o) => o.value.trim())
          .map((o) => ({ value: o.value.trim(), label: o.label.trim() || o.value.trim() }));
      }
      if (f.showIfEnabled && f.showIfField) {
        const parent = byId[f.showIfField];
        field.showIf = { field: f.showIfField, equals: coerceEquals(f.showIfEquals, parent?.type) };
      }
      return field;
    });

    try {
      const schema = await createSchema(formId.trim(), title.trim(), payloadFields);
      navigate(`/forms/${schema.formId}`);
    } catch (err) {
      setError(err.message || "Could not create the form.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fb-shell">
      <div className="fb-bg" aria-hidden="true">
        <div className="fb-bg__wave" />
      </div>
      <div className="fb-header">
        <Link to="/dashboard" className="fb-header__brand-link">
          <Logo size={36} />
          <span className="fb-brand">Forma AI</span>
        </Link>
      </div>

      <div className="fb-card cf-card">
        <span className="fb-eyebrow">Create Form</span>
        <h1 className="fb-title">Design a new form</h1>
        <p className="fb-subtitle">Add fields, set their type, and optionally make one depend on another.</p>

        {error && <div className="fb-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="cf-form-meta">
            <div className="df-field">
              <label htmlFor="formId">Form ID</label>
              <input id="formId" value={formId} onChange={(e) => setFormId(e.target.value)} placeholder="e.g. contact-request" />
            </div>
            <div className="df-field">
              <label htmlFor="title">Title</label>
              <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Contact Request" />
            </div>
          </div>

          <div className="cf-fields">
            {fields.map((field, i) => (
              <FieldEditor
                key={field._key}
                field={field}
                index={i}
                total={fields.length}
                priorFields={fields.slice(0, i).filter((f) => f.id.trim())}
                onChange={updateField}
                onRemove={removeField}
                onMove={moveField}
                canRemove={fields.length > 1}
              />
            ))}
          </div>

          <button type="button" className="cf-add-btn cf-add-field" onClick={addField}>
            + Add field
          </button>

          <button type="submit" className="df-submit cf-submit" disabled={submitting}>
            {submitting ? "Creating…" : "Create form"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateForm;
