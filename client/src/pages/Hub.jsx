import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";
import ThemeToggle from "../components/ThemeToggle";
import "./Dashboard.css";
import "./Hub.css";

function Hub() {
  const { user, logout } = useAuth();

  return (
    <div className="dash">
      <header className="dash-header">
        <div className="dash-header__brand">
          <Logo size={34} />
          <span className="dash-brand-text">Forma AI</span>
        </div>
        <nav className="dash-header__nav">
          <span className="hub-user-email">{user?.username}</span>
          <button className="hub-logout" onClick={logout}>
            Log out
          </button>
          <ThemeToggle />
        </nav>
      </header>

      <main className="dash-main">
        <div className="dash-intro">
          <span className="dash-eyebrow">Your workspace</span>
          <h1 className="dash-title">Hello {user?.username}</h1>
          <p className="dash-subtitle">Build a new form, or browse everything in the shared store.</p>
        </div>

        <div className="hub-tiles">
          <Link to="/dashboard" className="hub-tile">
            <div className="hub-tile__icon hub-tile__icon--accent">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h2>Create Form</h2>
            <p>Manage the shared form store and design new form types.</p>
          </Link>

          <Link to="/forms" className="hub-tile">
            <div className="hub-tile__icon hub-tile__icon--blue">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M6 2h9l5 5v13a1 1 0 01-1 1H6a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.7" />
                <path d="M9 11h6M9 15h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </div>
            <h2>All Forms</h2>
            <p>Browse every form and its submissions.</p>
          </Link>
        </div>
      </main>
    </div>
  );
}

export default Hub;
