import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useFormSchema } from "../hooks/useFormSchema";
import { submitFormResponse, fetchDraft, saveDraft, deleteDraft } from "../services/api";
import { getDraftId } from "../utils/draftId";
import DynamicForm from "../components/DynamicForm/DynamicForm";
import MagicInput from "../components/MagicInput/MagicInput";
import Logo from "../components/Logo";
import "./FormBuilder.css";

function FormBuilder() {
  const { formId } = useParams();
  const { schema, loading, error } = useFormSchema(formId);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [prefillValues, setPrefillValues] = useState(null);
  const [aiFilledIds, setAiFilledIds] = useState([]);
  const [aiWasUsed, setAiWasUsed] = useState(false);

  const draftId = getDraftId(formId);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [draftFound, setDraftFound] = useState(false);
  const [draftValues, setDraftValues] = useState(null);
  const [savingDraft, setSavingDraft] = useState(false);
  const saveTimerRef = useRef(null);

  useEffect(() => {
    if (!schema) return;
    fetchDraft(formId, draftId)
      .then((data) => {
        if (data) {
          setDraftValues(data.values);
          setDraftFound(true);
        }
      })
      .finally(() => setDraftLoaded(true));
  }, [schema, formId, draftId]);

  const handleValuesChange = useCallback((values) => {
    const hasAnyValue = Object.values(values).some((v) => v !== "" && v !== undefined && v !== false);
    if (!hasAnyValue) return;
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      setSavingDraft(true);
      saveDraft(formId, draftId, values)
        .catch(() => {}) // best-effort — a failed autosave shouldn't interrupt someone filling out the form
        .finally(() => setSavingDraft(false));
    }, 1200);
  }, [formId, draftId]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    setSubmitError("");
    try {
      await submitFormResponse(formId, { ...values, __draftId: draftId });
      deleteDraft(formId, draftId).catch(() => {});
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message || "Could not submit the form. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExtracted = (result) => {
    setPrefillValues(result.values);
    setAiFilledIds(result.filledFieldIds);
    setAiWasUsed(true);
  };

  return (
    <div className="fb-shell">
      <div className="fb-bg" aria-hidden="true">
        <div className="fb-bg__wave" />
      </div>
      <div className="fb-header">
        <Link to="/" className="fb-header__brand-link">
          <Logo size={36} />
          <span className="fb-brand">Forma AI</span>
        </Link>
      </div>

      <div className="fb-card">
        {loading && (
          <div className="fb-skeleton">
            <div className="fb-skeleton__line fb-skeleton__line--label" />
            <div className="fb-skeleton__line" />
            <div className="fb-skeleton__line fb-skeleton__line--label" />
            <div className="fb-skeleton__line" />
            <div className="fb-skeleton__line fb-skeleton__line--label" />
            <div className="fb-skeleton__line" />
          </div>
        )}

        {!loading && error && (
          <div className="fb-error">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
              <path stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="M12 9v4m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 18c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && schema && !submitted && (
          <>
            <span className="fb-eyebrow">Form ID · {schema.formId}</span>
            <h1 className="fb-title">{schema.title}</h1>
            <p className="fb-subtitle">All fields marked * are required.</p>
            {savingDraft && <span className="fb-draft-status">Saving draft…</span>}

            {submitError && (
              <div className="fb-error" style={{ marginBottom: 18 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                  <path stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="M12 9v4m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 18c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{submitError}</span>
              </div>
            )}

            {draftLoaded && draftFound && (
              <div className="fb-draft-banner">
                <span>✓ Picking up where you left off — a saved draft was restored.</span>
                <button onClick={() => setDraftFound(false)}>Dismiss</button>
              </div>
            )}

            <MagicInput formId={formId} onExtracted={handleExtracted} />

            <DynamicForm
              schema={schema}
              onSubmit={handleSubmit}
              submitting={submitting}
              prefillValues={prefillValues || draftValues}
              aiFilledIds={aiFilledIds}
              aiWasUsed={aiWasUsed}
              onValuesChange={handleValuesChange}
            />
          </>
        )}

        {!loading && !error && submitted && (
          <div className="fb-success">
            <div className="fb-success__icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <p className="fb-success__title">Submitted</p>
            <p className="fb-success__sub">Thanks — we've received your response.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FormBuilder;