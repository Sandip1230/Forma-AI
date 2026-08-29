import { useEffect, useRef, useCallback } from "react";
import { useFormSessionStore } from "../store/formSessionStore";
import { fetchDraft, saveDraft } from "../services/api";

// Fetches any existing draft on load and auto-saves 1.2s after the user
// stops changing values. Reads/writes the shared session store rather than
// holding its own state, so FormBuilder and this hook always agree on
// draft state without needing to be wired together manually.
export function useDraftSync(formId, draftId, schema) {
  const { draftValues, draftFound, draftLoaded, savingDraft, setDraftLoaded, dismissDraftBanner, setSavingDraft } =
    useFormSessionStore();
  const saveTimerRef = useRef(null);

  useEffect(() => {
    if (!schema) return;
    fetchDraft(formId, draftId)
      .then((data) => setDraftLoaded(data?.values ?? null, Boolean(data)))
      .catch(() => setDraftLoaded(null, false));
  }, [schema, formId, draftId, setDraftLoaded]);

  const handleValuesChange = useCallback(
    (values) => {
      const hasAnyValue = Object.values(values).some((v) => v !== "" && v !== undefined && v !== false);
      if (!hasAnyValue) return;
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        setSavingDraft(true);
        saveDraft(formId, draftId, values)
          .catch(() => {}) // best-effort — a failed autosave shouldn't interrupt someone filling out the form
          .finally(() => setSavingDraft(false));
      }, 1200);
    },
    [formId, draftId, setSavingDraft]
  );

  return { draftValues, draftFound, draftLoaded, savingDraft, dismissDraftBanner, handleValuesChange };
}
