import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import "./FormBuilder.css";

function CreateForm() {
  return (
    <div className="fb-shell">
      <div className="fb-bg" aria-hidden="true">
        <div className="fb-bg__wave" />
      </div>
      <div className="fb-header">
        <Link to="/" className="fb-header__brand-link">
          <Logo size={36} />
          <span className="fb-brand">Forma AI</span>
        </Link>
      </div>

      <div className="fb-card">
        <span className="fb-eyebrow">Create Form</span>
        <h1 className="fb-title">The form builder isn't built yet</h1>
        <p className="fb-subtitle">
          This is a placeholder — the actual field editor (add fields, set types, required/options, showIf
          conditions) is the next piece of work.
        </p>
        <Link to="/" className="df-submit" style={{ display: "inline-block", textAlign: "center", textDecoration: "none" }}>
          ← Back to your workspace
        </Link>
      </div>
    </div>
  );
}

export default CreateForm;
