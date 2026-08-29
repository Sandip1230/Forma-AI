import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import FieldRenderer from "./FieldRenderer";
import "./DynamicForm.css";

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

  return (
    <form className="df" onSubmit={handleSubmit(onSubmit)} noValidate>
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
            Submit
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </>
        )}
      </button>
    </form>
  );
}

export default DynamicForm;