import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthBrandPanel from "../components/AuthBrandPanel";
import "./FormBuilder.css";
import "./Auth.css";

function Signup() {
  const { signup, verifySignupOtp } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState("details"); // "details" | "verify"
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    try {
      await signup(username, email, password);
      setStep("verify");
    } catch (err) {
      setError(err.message || "Could not create your account.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await verifySignupOtp(email, code);
      navigate("/");
    } catch (err) {
      setError(err.message || "Could not verify that code.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <AuthBrandPanel />

      <div className="auth-form-panel">
        <div className="auth-form-panel__inner">
        {step === "details" && (
          <>
            <span className="auth-eyebrow">Sign up</span>
            <h1 className="auth-title">Create your account</h1>
            <p className="auth-subtitle">You'll be able to build and manage your own forms.</p>

            {error && <div className="fb-error">{error}</div>}

            <form className="df" onSubmit={handleDetailsSubmit}>
              <div className="df-field">
                <label htmlFor="username">Username</label>
                <input id="username" type="text" required value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
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
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="df-field">
                <label htmlFor="confirmPassword">Confirm password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <button type="submit" className="df-submit" disabled={submitting}>
                {submitting ? "Creating account…" : "Sign up"}
              </button>
            </form>

            <p className="auth-switch">
              Already have an account? <Link to="/login">Log in</Link>
            </p>
          </>
        )}

        {step === "verify" && (
          <>
            <span className="auth-eyebrow">Verify your email</span>
            <h1 className="auth-title">Enter your code</h1>
            <p className="auth-subtitle">We emailed a 6-digit code to {email}. It expires in 10 minutes.</p>

            {error && <div className="fb-error">{error}</div>}

            <form className="df" onSubmit={handleVerifySubmit}>
              <div className="df-field">
                <label htmlFor="code">Verification code</label>
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
                {submitting ? "Verifying…" : "Verify & continue"}
              </button>
            </form>

            <p className="auth-switch">
              <button type="button" className="auth-linklike" onClick={() => setStep("details")}>
                ← Back
              </button>
            </p>
          </>
        )}
        </div>
      </div>
    </div>
  );
}

export default Signup;
