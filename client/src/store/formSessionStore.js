import { create } from "zustand";

const initialState = {
  // AI extraction results
  prefillValues: null,
  aiFilledIds: [],
  lowConfidenceIds: [],
  aiWasUsed: false,

  // Save & Resume
  draftLoaded: false,
  draftFound: false,
  draftValues: null,
  savingDraft: false,

  // Submission
  submitting: false,
  submitted: false,
  submitError: "",
};

// Owns the orchestration state around filling out one form — AI extraction
// results, draft load/save state, and submission state — matching the
// project brief's "State Management (Redux/Zustand)" module. Raw field
// values and validation stay in react-hook-form (used by DynamicForm),
// which is the right tool for that layer and is named as its own module in
// the brief; this store only holds the state around it, not the fields
// themselves.
export const useFormSessionStore = create((set) => ({
  ...initialState,

  setExtracted: (result) =>
    set({
      prefillValues: result.values,
      aiFilledIds: result.filledFieldIds,
      lowConfidenceIds: result.lowConfidenceFieldIds || [],
      aiWasUsed: true,
    }),

  setDraftLoaded: (values, found) => set({ draftValues: values, draftFound: found, draftLoaded: true }),
  dismissDraftBanner: () => set({ draftFound: false }),
  setSavingDraft: (savingDraft) => set({ savingDraft }),

  setSubmitting: (submitting) => set({ submitting }),
  setSubmitted: (submitted) => set({ submitted }),
  setSubmitError: (submitError) => set({ submitError }),

  resetSession: () => set(initialState),
}));
