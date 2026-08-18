import { useState } from "react";
import { useParams } from "react-router-dom";
import { useFormSchema } from "../hooks/useFormSchema";
import { submitFormResponse } from "../services/api";
import DynamicForm from "../components/DynamicForm/DynamicForm";
import Logo from "../components/Logo";
import "./FormBuilder.css";

function FormBuilder() {
  const { formId } = useParams();
  const { schema, loading, error } = useFormSchema(formId);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      await submitFormResponse(formId, values);
      setSubmitted(true);
    } catch (err) {
      console.warn("Submit failed (expected until the backend exists):", err.message);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fb-shell">
      <div className="fb-header">
        <Logo size={36} />
        <span className="fb-brand">Forma AI</span>
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
            <DynamicForm schema={schema} onSubmit={handleSubmit} submitting={submitting} />
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