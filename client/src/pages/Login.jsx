import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthBrandPanel from "../components/AuthBrandPanel";
import "./FormBuilder.css";
import "./Auth.css";

function Login() {
  const { login, devLogin } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await login(identifier, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Could not log in.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDevLogin = async () => {
    setSubmitting(true);
    setError("");
    try {
      await devLogin();
      navigate("/");
    } catch (err) {
      setError(err.message || "Dev login is disabled on this server.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <AuthBrandPanel />

      <div className="auth-form-panel">
        <div className="auth-form-panel__inner">
          <span className="auth-eyebrow">Log in</span>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Enter your username or email, and your password, to continue.</p>

          {error && <div className="fb-error">{error}</div>}

          <form className="df" onSubmit={handleSubmit}>
            <div className="df-field">
              <label htmlFor="identifier">Username or email</label>
              <input
                id="identifier"
                type="text"
                required
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
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
              {submitting ? "Logging in…" : "Log in"}
            </button>
          </form>

          <p className="auth-switch">
            <Link to="/forgot-password">Forgot password?</Link>
          </p>
          <p className="auth-switch">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>

          {import.meta.env.DEV && (
            <>
              <div className="auth-divider">Local dev only</div>
              <button type="button" className="df-submit auth-dev-login" onClick={handleDevLogin} disabled={submitting}>
                🛠 Dev login (test user)
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
