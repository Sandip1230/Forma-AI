import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import FieldRenderer from "./FieldRenderer";
import { fetchSubmissionHistoryByPhone } from "../../services/api";
import "./DynamicForm.css";

// Turns a raw form value into what a person should actually read on the
// review screen — an option's label instead of its stored value, Yes/No
// instead of true/false, "—" instead of a blank.
function formatFieldValue(field, value) {
  if (value === undefined || value === null || value === "") return "—";
  if (field.type === "checkbox") return value ? "Yes" : "No";
  if (field.type === "select") {
    const opt = field.options?.find((o) => o.value === value);
    return opt?.label ?? String(value);
  }
  return String(value);
}

function resolveVisibility(fields, values) {
  const byId = Object.fromEntries(fields.map((f) => [f.id, f]));
  const cache = new Map();

  function isVisible(field, seen = new Set()) {
    if (cache.has(field.id)) return cache.get(field.id);
    if (!field.showIf) {
      cache.set(field.id, true);
      return true;
    }
    if (seen.has(field.id)) return false;

    const parent = byId[field.showIf.field];
    if (!parent) {
      cache.set(field.id, true);
      return true;
    }
    const parentVisible = isVisible(parent, new Set(seen).add(field.id));
    const result = parentVisible && values[field.showIf.field] === field.showIf.equals;
    cache.set(field.id, result);
    return result;
  }

  return Object.fromEntries(fields.map((f) => [f.id, isVisible(f)]));
}

function DynamicForm({ schema, onSubmit, submitting, prefillValues, aiFilledIds = [], aiWasUsed = false, onValuesChange }) {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  // Non-null once the form's own validation has passed once and the user
  // clicked Submit — holds the values that will actually be sent once they
  // confirm on the review screen below, so nothing is re-typed either way.
  const [pendingValues, setPendingValues] = useState(null);
  const [reviewConfirmed, setReviewConfirmed] = useState(false);
  const [phoneHistory, setPhoneHistory] = useState(null);

  const phoneField = schema.fields.find((f) => f.type === "phone");

  // Looked up the instant the review screen opens — a repeat number is
  // exactly the kind of thing worth surfacing before the confirm click, not
  // buried in a report afterward.
  useEffect(() => {
    if (!pendingValues || !phoneField) {
      setPhoneHistory(null);
      return;
    }
    const phoneValue = pendingValues[phoneField.id];
    if (!phoneValue) {
      setPhoneHistory(null);
      return;
    }
    let cancelled = false;
    fetchSubmissionHistoryByPhone(phoneValue)
      .then((result) => {
        if (!cancelled) setPhoneHistory(result);
      })
      .catch(() => {
        if (!cancelled) setPhoneHistory(null);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingValues]);

  useEffect(() => {
    if (prefillValues) reset(prefillValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillValues]);

  const liveValues = watch();
  const visibility = useMemo(() => resolveVisibility(schema.fields, liveValues), [schema.fields, liveValues]);

  useEffect(() => {
    onValuesChange?.(liveValues);
  }, [liveValues, onValuesChange]);

  const needsReview = useMemo(() => {
    if (!aiWasUsed) return [];
    return schema.fields
      .filter((f) => f.required && visibility[f.id] && !aiFilledIds.includes(f.id) && !liveValues[f.id])
      .map((f) => f.id);
  }, [aiWasUsed, aiFilledIds, schema.fields, visibility, liveValues]);

  const progress = useMemo(() => {
    const requiredVisible = schema.fields.filter((f) => f.required && visibility[f.id]);
    if (requiredVisible.length === 0) return 100;
    const filled = requiredVisible.filter((f) => {
      const v = liveValues[f.id];
      return v !== undefined && v !== "" && v !== false;
    }).length;
    return Math.round((filled / requiredVisible.length) * 100);
  }, [schema.fields, visibility, liveValues]);

  if (pendingValues) {
    const visibleFields = schema.fields.filter((f) => visibility[f.id]);
    return (
      <div className="df">
        <div className="df-review">
          <h3 className="df-review__title">Review your responses</h3>
          <p className="df-review__subtitle">Check everything below, then confirm to submit.</p>

          {phoneHistory?.count > 0 && (
            <div className="df-review-banner df-review-banner--history">
              <span className="df-review-banner__icon">ℹ</span>
              <span>
                This phone number has {phoneHistory.count} prior submission{phoneHistory.count > 1 ? "s" : ""}:{" "}
                {phoneHistory.matches
                  .map((m) => `${m.formTitle} (${new Date(m.submittedAt).toLocaleDateString()})`)
                  .join(", ")}
              </span>
            </div>
          )}

          <dl className="df-review__list">
            {visibleFields.map((field) => (
              <div className="df-review__row" key={field.id}>
                <dt>{field.label}</dt>
                <dd>{formatFieldValue(field, pendingValues[field.id])}</dd>
              </div>
            ))}
          </dl>

          <div className="df-field df-field--checkbox df-review__confirm">
            <label>
              <input
                type="checkbox"
                className="df-checkbox"
                checked={reviewConfirmed}
                onChange={(e) => setReviewConfirmed(e.target.checked)}
              />
              <span className="df-checkbox__box">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              <span>I've reviewed this and confirm it's accurate</span>
            </label>
          </div>

          <div className="df-review__actions">
            <button
              type="button"
              className="df-review__back"
              onClick={() => setPendingValues(null)}
              disabled={submitting}
            >
              ← Back to edit
            </button>
            <button
              type="button"
              className="df-submit"
              disabled={!reviewConfirmed || submitting}
              onClick={() => onSubmit(pendingValues)}
            >
              {submitting ? (
                <>
                  <span className="df-submit__spinner" />
                  Submitting…
                </>
              ) : (
                <>Confirm & Submit</>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form className="df" onSubmit={handleSubmit((values) => setPendingValues(values))} noValidate>
      <div className="df-progress">
        <div className="df-progress__bar">
          <div className="df-progress__fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="df-progress__label">{progress}% complete</span>
      </div>

      {aiWasUsed && needsReview.length > 0 && (
        <div className="df-review-banner">
          <span className="df-review-banner__icon">⚠</span>
          The AI couldn't confidently fill {needsReview.length} required field{needsReview.length > 1 ? "s" : ""} below — please complete {needsReview.length > 1 ? "them" : "it"} manually.
        </div>
      )}

      {schema.fields.map((field) => {
        if (!visibility[field.id]) return null;
        return (
          <div key={field.id} className="df-field-wrap">
            <FieldRenderer
              field={field}
              register={register}
              error={errors[field.id]}
              aiFilled={aiFilledIds.includes(field.id)}
              needsReview={needsReview.includes(field.id)}
            />
          </div>
        );
      })}

      <button type="submit" className="df-submit" disabled={submitting}>
        {submitting ? (
          <>
            <span className="df-submit__spinner" />
            Submitting…
          </>
        ) : (
          <>
            Review & Submit
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </>
        )}
      </button>
    </form>
  );
}

export default DynamicForm;