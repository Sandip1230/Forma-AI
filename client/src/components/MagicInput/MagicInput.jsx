import { useState } from "react";
import { extractFormValues } from "../../services/api";
import "./MagicInput.css";

function MagicInput({ formId, onExtracted }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(true);

  const handleExtract = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    try {
      const result = await extractFormValues(formId, text);
      onExtracted(result);
      setOpen(false);
    } catch (err) {
      setError(err.message || "Couldn't extract details from that text.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button className="magic-reopen" onClick={() => setOpen(true)}>
        <span className="magic-reopen__spark">✦</span> Describe it in your own words instead
      </button>
    );
  }

  return (
    <div className="magic-input">
      <div className="magic-input__label">
        <span className="magic-input__spark">✦</span>
        Describe what happened, and we'll fill out the form for you
      </div>

      <textarea
        className="magic-input__textarea"
        placeholder="e.g. I hit a deer on I-95 yesterday in my Honda, and the windshield shattered."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        disabled={loading}
      />

      {error && <div className="magic-input__error">{error}</div>}

      <div className="magic-input__actions">
        <button className="magic-input__skip" onClick={() => setOpen(false)} disabled={loading}>
          Fill manually instead
        </button>
        <button className="magic-input__submit" onClick={handleExtract} disabled={loading || !text.trim()}>
          {loading ? (
            <>
              <span className="magic-input__spinner" />
              Reading…
            </>
          ) : (
            <>Extract with AI</>
          )}
        </button>
      </div>

      {loading && (
        <div className="magic-input__skeleton" aria-hidden="true">
          <div className="magic-input__skeleton-line magic-input__skeleton-line--label" />
          <div className="magic-input__skeleton-line" />
          <div className="magic-input__skeleton-line magic-input__skeleton-line--label" />
          <div className="magic-input__skeleton-line" />
        </div>
      )}
    </div>
  );
}

export default MagicInput;