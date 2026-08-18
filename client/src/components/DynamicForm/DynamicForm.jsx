import { useForm } from "react-hook-form";
import FieldRenderer from "./FieldRenderer";
import "./DynamicForm.css";

function DynamicForm({ schema, onSubmit, submitting }) {
  const { register, handleSubmit, formState: { errors } } = useForm();

  return (
    <form className="df" onSubmit={handleSubmit(onSubmit)} noValidate>
      {schema.fields.map((field) => (
        <FieldRenderer key={field.id} field={field} register={register} error={errors[field.id]} />
      ))}

      <button type="submit" className="df-submit" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit"}
      </button>
    </form>
  );
}

export default DynamicForm;