import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { createSchema, updateSchema, fetchFormSchema } from "../services/api";
import { FORM_TEMPLATES } from "../data/formTemplates";
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
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
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
    pattern: "",
    patternMessage: "",
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

// Reverses the payload shape a fetched schema comes back in into the
// builder's own field state, so an existing form can be loaded into the same
// editor used to create one.
function fieldToBuilderState(field) {
  return {
    _key: newFieldKey(),
    id: field.id,
    idTouched: true,
    label: field.label,
    type: field.type,
    required: !!field.required,
    placeholder: field.placeholder || "",
    pattern: field.pattern || "",
    patternMessage: field.patternMessage || "",
    options: field.options && field.options.length > 0 ? field.options.map((o) => ({ value: o.value, label: o.label })) : [{ value: "", label: "" }],
    showIfEnabled: !!field.showIf,
    showIfField: field.showIf?.field || "",
    showIfEquals: field.showIf ? String(field.showIf.equals) : "",
  };
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

        {field.type === "text" && (
          <>
            <div className="df-field">
              <label>Validation pattern (optional)</label>
              <input
                value={field.pattern}
                onChange={(e) => set({ pattern: e.target.value })}
                placeholder="e.g. ^\d{5}$"
              />
            </div>
            <div className="df-field">
              <label>Pattern error message (optional)</label>
              <input
                value={field.patternMessage}
                onChange={(e) => set({ patternMessage: e.target.value })}
                placeholder="e.g. Must be a 5-digit ZIP code"
                disabled={!field.pattern.trim()}
              />
            </div>
          </>
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

function TemplateGallery({ onChoose, onStartFromScratch }) {
  return (
    <div className="cf-gallery">
      <div className="cf-gallery__grid">
        {FORM_TEMPLATES.map((t) => (
          <button type="button" className="cf-gallery__card" key={t.key} onClick={() => onChoose(t)}>
            <h3>
              <span className="cf-gallery__emoji" aria-hidden="true">{t.emoji}</span> {t.title}
            </h3>
            <p>{t.description}</p>
            <span className="cf-gallery__count">{t.fields.length} fields, ready to go</span>
          </button>
        ))}
      </div>
      <button type="button" className="cf-gallery__scratch" onClick={onStartFromScratch}>
        Or start from a blank form →
      </button>
    </div>
  );
}

function CreateForm() {
  const navigate = useNavigate();
  const { formId: routeFormId } = useParams();
  const isEditMode = Boolean(routeFormId);

  // Templates only make sense when creating fresh — an edit always jumps
  // straight to the builder with the existing form's own fields.
  const [templateChosen, setTemplateChosen] = useState(isEditMode);
  const [formId, setFormId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState([blankField()]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [loadingExisting, setLoadingExisting] = useState(isEditMode);
  const [loadError, setLoadError] = useState("");

  const applyTemplate = (template) => {
    setFormId(template.suggestedFormId);
    setTitle(template.title);
    setDescription(template.description);
    setFields(template.fields.map(fieldToBuilderState));
    setTemplateChosen(true);
  };

  // A no-op unless a template was already applied and then abandoned via
  // "Back to templates" — without this, "start from scratch" after that
  // would silently keep the previous template's fields instead of actually
  // being blank.
  const startFromScratch = () => {
    setFormId("");
    setTitle("");
    setDescription("");
    setFields([blankField()]);
    setTemplateChosen(true);
  };

  useEffect(() => {
    if (!isEditMode) return;
    fetchFormSchema(routeFormId)
      .then((schema) => {
        setFormId(schema.formId);
        setTitle(schema.title);
        setDescription(schema.description || "");
        setCurrentVersion(schema.version || 1);
        setFields(schema.fields.length > 0 ? schema.fields.map(fieldToBuilderState) : [blankField()]);
      })
      .catch((err) => setLoadError(err.message || "Could not load this form."))
      .finally(() => setLoadingExisting(false));
  }, [isEditMode, routeFormId]);

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
      if (f.type === "text" && f.pattern.trim()) {
        try {
          new RegExp(f.pattern.trim());
        } catch {
          return `Field ${i + 1}: "${f.pattern}" isn't a valid regular expression.`;
        }
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
      if (f.type === "text" && f.pattern.trim()) {
        field.pattern = f.pattern.trim();
        if (f.patternMessage.trim()) field.patternMessage = f.patternMessage.trim();
      }
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
      const schema = isEditMode
        ? await updateSchema(formId.trim(), title.trim(), payloadFields, description.trim() || undefined)
        : await createSchema(formId.trim(), title.trim(), payloadFields, description.trim() || undefined);
      navigate(`/forms/${schema.formId}`);
    } catch (err) {
      setError(err.message || `Could not ${isEditMode ? "save" : "create"} the form.`);
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
        <span className="fb-eyebrow">
          {isEditMode ? "Edit Form" : "Create Form"}
          {isEditMode && currentVersion && <span className="cf-version-badge">v{currentVersion}</span>}
        </span>
        <h1 className="fb-title">
          {isEditMode ? "Edit this form" : templateChosen ? "Design a new form" : "Start from a template"}
        </h1>
        <p className="fb-subtitle">
          {isEditMode
            ? "Saving creates a new version — submissions already on file keep the version they were filled under."
            : templateChosen
            ? "Add fields, set their type, and optionally make one depend on another."
            : "Pick a common claim type to start with its fields already filled in, or build one from scratch."}
        </p>

        {error && <div className="fb-error">{error}</div>}
        {isEditMode && loadError && <div className="fb-error">{loadError}</div>}

        {isEditMode && loadingExisting ? (
          <div className="cf-loading">Loading form…</div>
        ) : !templateChosen ? (
          <TemplateGallery onChoose={applyTemplate} onStartFromScratch={startFromScratch} />
        ) : (
        <form onSubmit={handleSubmit}>
          {!isEditMode && (
            <button type="button" className="cf-back-to-gallery" onClick={() => setTemplateChosen(false)}>
              ← Back to templates
            </button>
          )}
          <div className="cf-form-meta">
            <div className="df-field">
              <label htmlFor="formId">Form ID</label>
              <input
                id="formId"
                value={formId}
                onChange={(e) => setFormId(e.target.value)}
                placeholder="e.g. contact-request"
                disabled={isEditMode}
              />
            </div>
            <div className="df-field">
              <label htmlFor="title">Title</label>
              <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Contact Request" />
            </div>
            <div className="df-field cf-form-meta__full">
              <label htmlFor="description">Description (optional)</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this form for? Helps AI match a user's free-text description to the right form."
                rows={2}
              />
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
            {isEditMode ? (submitting ? "Saving…" : "Save changes") : (submitting ? "Creating…" : "Create form")}
          </button>
        </form>
        )}
      </div>
    </div>
  );
}

export default CreateForm;
