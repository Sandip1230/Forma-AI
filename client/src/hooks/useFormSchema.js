import { useEffect, useState } from "react";
import { fetchFormSchema } from "../services/api";
import { exampleSchema } from "../lib/exampleSchema";

export function useFormSchema(formId) {
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    fetchFormSchema(formId)
      .then((data) => {
        if (!cancelled) setSchema(data);
      })
      .catch((err) => {
        if (cancelled) return;
        // TEMPORARY fallback: no backend exists yet, so a failed fetch
        // (connection refused, 404) falls back to the local example
        // schema instead of leaving the page blank. Remove this catch
        // block once GET /api/forms/:id is real.
        if (formId === exampleSchema.formId) {
          setSchema(exampleSchema);
        } else {
          setError(err.message || "Could not load this form.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [formId]);

  return { schema, loading, error };
}