import { useEffect } from "react";
import { useForm } from "react-hook-form";
import FieldRenderer from "./FieldRenderer";
import "./DynamicForm.css";

function DynamicForm({ schema, onSubmit, submitting, prefillValues, aiFilledIds = [] }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (prefillValues) reset(prefillValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillValues]);

  return (
    <form className="df" onSubmit={handleSubmit(onSubmit)} noValidate>
      {schema.fields.map((field) => (
        <FieldRenderer
          key={field.id}
          field={field}
          register={register}
          error={errors[field.id]}
          aiFilled={aiFilledIds.includes(field.id)}
        />
      ))}

      <button type="submit" className="df-submit" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit"}
      </button>
    </form>
  );
}

export default DynamicForm;