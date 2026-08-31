import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthBrandPanel from "../components/AuthBrandPanel";
import "./FormBuilder.css";
import "./Auth.css";

function ForgotPassword() {
  const { forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState("request"); // "request" | "reset"
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const { message } = await forgotPassword(email);
      setInfo(message);
      setStep("reset");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    try {
      await resetPassword(email, code, newPassword);
      navigate("/");
    } catch (err) {
      setError(err.message || "Could not reset your password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <AuthBrandPanel />

      <div className="auth-form-panel">
        <div className="auth-form-panel__inner">
        {step === "request" && (
          <>
            <span className="auth-eyebrow">Reset password</span>
            <h1 className="auth-title">Forgot your password?</h1>
            <p className="auth-subtitle">Enter your email and we'll send you a reset code.</p>

            {error && <div className="fb-error">{error}</div>}

            <form className="df" onSubmit={handleRequestSubmit}>
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
              <button type="submit" className="df-submit" disabled={submitting}>
                {submitting ? "Sending…" : "Send reset code"}
              </button>
            </form>

            <p className="auth-switch">
              <Link to="/login">← Back to log in</Link>
            </p>
          </>
        )}

        {step === "reset" && (
          <>
            <span className="auth-eyebrow">Reset password</span>
            <h1 className="auth-title">Enter your code</h1>
            <p className="auth-subtitle">{info || `If ${email} has an account, a code was sent — enter it below along with your new password.`}</p>

            {error && <div className="fb-error">{error}</div>}

            <form className="df" onSubmit={handleResetSubmit}>
              <div className="df-field">
                <label htmlFor="code">Reset code</label>
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
              <div className="df-field">
                <label htmlFor="newPassword">New password</label>
                <input
                  id="newPassword"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="df-field">
                <label htmlFor="confirmPassword">Confirm new password</label>
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
                {submitting ? "Resetting…" : "Reset password & log in"}
              </button>
            </form>

            <p className="auth-switch">
              <button type="button" className="auth-linklike" onClick={() => setStep("request")}>
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

export default ForgotPassword;
