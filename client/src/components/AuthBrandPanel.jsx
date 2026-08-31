import { Link } from "react-router-dom";
import Logo from "./Logo";

const FEATURES = [
  {
    icon: <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />,
    text: "Describe what happened in plain English — AI extracts the details and fills the form for you.",
  },
  {
    icon: <path d="M6 3v6a3 3 0 003 3h3M6 3H4m2 0h2M18 21v-6a3 3 0 00-3-3h-3m6 9h2m-2 0h-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
    text: "Every field is driven by a JSON schema, so branching questions appear only when they're actually relevant.",
  },
  {
    icon: <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
    text: "Low-confidence AI answers are flagged for a quick human check instead of silently guessing.",
  },
];

function AuthBrandPanel() {
  return (
    <div className="auth-brand-panel">
      <div className="auth-brand-panel__glow auth-brand-panel__glow--a" aria-hidden="true" />
      <div className="auth-brand-panel__glow auth-brand-panel__glow--b" aria-hidden="true" />

      <Link to="/login" className="auth-brand-logo">
        <Logo size={38} variant="light" />
        <span>Forma AI</span>
      </Link>

      <div className="auth-brand-panel__content">
        <h1 className="auth-brand-title">AI-augmented forms, without the busywork</h1>
        <p className="auth-brand-sub">
          Forma AI turns long, branching questionnaires into a conversation — built for teams managing dozens of
          form types, like insurance claims and healthcare intake.
        </p>

        <ul className="auth-brand-features">
          {FEATURES.map((f, i) => (
            <li key={i}>
              <span className="auth-brand-features__icon">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  {f.icon}
                </svg>
              </span>
              {f.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default AuthBrandPanel;
