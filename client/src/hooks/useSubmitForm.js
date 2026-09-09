import { useFormSessionStore } from "../store/formSessionStore";
import { submitFormResponse, deleteDraft } from "../services/api";

// Submits the form, cleans up its draft on success, and tracks submit/error
// state in the shared session store.
export function useSubmitForm(formId, draftId) {
  const {
    submitting, submitted, submitError, setSubmitting, setSubmitted, setSubmitError,
    prefillValues, aiFilledIds, aiWasUsed,
  } = useFormSessionStore();

  const submit = async (values) => {
    setSubmitting(true);
    setSubmitError("");
    try {
      // What the AI actually filled in for the fields it touched, so the
      // server can tell whether the user kept or corrected each one — not
      // sent as a precomputed verdict, since the server should be the one
      // deciding "kept" vs "corrected", not trusting the client's own math.
      const __aiOriginalValues =
        aiWasUsed && aiFilledIds.length > 0
          ? Object.fromEntries(aiFilledIds.map((id) => [id, prefillValues?.[id]]))
          : undefined;

      await submitFormResponse(formId, { ...values, __draftId: draftId, __aiOriginalValues });
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
