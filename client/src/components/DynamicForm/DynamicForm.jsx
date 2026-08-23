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

function DynamicForm({ schema, onSubmit, submitting, prefillValues, aiFilledIds = [] }) {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();

  useEffect(() => {
    if (prefillValues) reset(prefillValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillValues]);

  const liveValues = watch();
  const visibility = useMemo(() => resolveVisibility(schema.fields, liveValues), [schema.fields, liveValues]);

  return (
    <form className="df" onSubmit={handleSubmit(onSubmit)} noValidate>
      {schema.fields.map((field) => {
        const visible = visibility[field.id];
        if (!visible) return null;
        return (
          <div key={field.id} className="df-field-wrap fade-in">
            <FieldRenderer field={field} register={register} error={errors[field.id]} aiFilled={aiFilledIds.includes(field.id)} />
          </div>
        );
      })}

      <button type="submit" className="df-submit" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit"}
      </button>
    </form>
  );
}

export default DynamicForm;