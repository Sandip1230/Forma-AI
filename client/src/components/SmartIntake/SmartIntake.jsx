import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { classifyFormType } from "../../services/api";
import "./SmartIntake.css";

// The entry point for "describe what you need before you know which form to
// open" — Magic Input (in FormBuilder) only exists once a formId is already
// in the URL. This classifies free text against every existing form, then
// hands the same text straight into that form's Magic Input so it isn't
// retyped.
function SmartIntake() {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [noMatch, setNoMatch] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    setNoMatch(false);
    try {
      const result = await classifyFormType(text.trim());
      if (result.formId) {
        navigate(`/forms/${result.formId}`, { state: { prefillText: text.trim() } });
      } else {
        setNoMatch(true);
      }
    } catch (err) {
      setError(err.message || "Couldn't figure out which form fits that.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="smart-intake">
      <div className="smart-intake__label">
        <span className="smart-intake__spark">✦</span>
        Describe what you need, and we'll find the right form
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          className="smart-intake__textarea"
          placeholder="e.g. My basement flooded during last night's storm and I need to file a claim."
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setNoMatch(false);
          }}
          rows={2}
          disabled={loading}
        />

        {error && <div className="smart-intake__error">{error}</div>}
        {noMatch && (
          <div className="smart-intake__notice">
            None of the existing forms seem to match that — try{" "}
            <Link to="/forms">browsing all forms</Link> or{" "}
            <Link to="/dashboard">creating a new one</Link>.
          </div>
        )}

        <button className="smart-intake__submit" type="submit" disabled={loading || !text.trim()}>
          {loading ? (
            <>
              <span className="smart-intake__spinner" />
              Finding your form…
            </>
          ) : (
            <>Find my form</>
          )}
        </button>
      </form>
    </div>
  );
}

export default SmartIntake;
