import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";
import "./FormBuilder.css";
import "./Auth.css";

function Login() {
  const { login, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState("password"); // "password" | "otp"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await login(email, password);
      setStep("otp");
    } catch (err) {
      setError(err.message || "Could not log in.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await verifyOtp(email, code);
      navigate("/");
    } catch (err) {
      setError(err.message || "Could not verify that code.");
    } finally {
      setSubmitting(false);
    }
  };

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

      <div className="fb-card auth-card">
        {step === "password" && (
          <>
            <span className="fb-eyebrow">Log in</span>
            <h1 className="fb-title">Welcome back</h1>
            <p className="fb-subtitle">Enter your email and password to continue.</p>

            {error && <div className="fb-error">{error}</div>}

            <form className="df" onSubmit={handlePasswordSubmit}>
              <div className="df-field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="df-field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button type="submit" className="df-submit" disabled={submitting}>
                {submitting ? "Sending code…" : "Continue"}
              </button>
            </form>

            <p className="auth-switch">
              Don't have an account? <Link to="/signup">Sign up</Link>
            </p>
          </>
        )}

        {step === "otp" && (
          <>
            <span className="fb-eyebrow">Verify it's you</span>
            <h1 className="fb-title">Enter your code</h1>
            <p className="fb-subtitle">We emailed a 6-digit code to {email}. It expires in 10 minutes.</p>

            {error && <div className="fb-error">{error}</div>}

            <form className="df" onSubmit={handleOtpSubmit}>
              <div className="df-field">
                <label htmlFor="code">Login code</label>
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                />
              </div>
              <button type="submit" className="df-submit" disabled={submitting}>
                {submitting ? "Verifying…" : "Verify & log in"}
              </button>
            </form>

            <p className="auth-switch">
              <button type="button" className="auth-linklike" onClick={() => setStep("password")}>
                ← Back
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;
