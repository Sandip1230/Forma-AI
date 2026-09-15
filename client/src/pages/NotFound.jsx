import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import "./FormBuilder.css";

function NotFound() {
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
        <span className="fb-eyebrow">404</span>
        <h1 className="fb-title">Page not found</h1>
        <p className="fb-subtitle">There's nothing at this address.</p>
        <Link to="/" className="df-submit" style={{ display: "inline-flex", textDecoration: "none", width: "fit-content" }}>
          Back to your workspace
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
