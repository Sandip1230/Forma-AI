import { useFormSessionStore } from "../store/formSessionStore";
import { submitFormResponse, deleteDraft } from "../services/api";

// Submits the form, cleans up its draft on success, and tracks submit/error
// state in the shared session store.
export function useSubmitForm(formId, draftId) {
  const { submitting, submitted, submitError, setSubmitting, setSubmitted, setSubmitError } = useFormSessionStore();

  const submit = async (values) => {
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

  return { submit, submitting, submitted, submitError };
}
