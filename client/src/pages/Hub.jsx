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
          <span className="hub-user-email">{user?.email}</span>
          {user?.role === "admin" && (
            <Link to="/admin" className="hub-admin-link">
              Admin Dashboard
            </Link>
          )}
          <button className="hub-logout" onClick={logout}>
            Log out
          </button>
          <ThemeToggle />
        </nav>
      </header>

      <main className="dash-main">
        <div className="dash-intro">
          <span className="dash-eyebrow">Your workspace</span>
          <h1 className="dash-title">What do you want to do?</h1>
          <p className="dash-subtitle">Build a new form, or review the ones you've already created.</p>
        </div>

        <div className="hub-tiles">
          <Link to="/forms/new" className="hub-tile">
            <div className="hub-tile__icon hub-tile__icon--accent">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h2>Create Form</h2>
            <p>Design a new dynamic form from scratch.</p>
          </Link>

          <Link to="/my-forms" className="hub-tile">
            <div className="hub-tile__icon hub-tile__icon--pink">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M6 2h9l5 5v13a1 1 0 01-1 1H6a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.7" />
                <path d="M9 11h6M9 15h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </div>
            <h2>Your Forms</h2>
            <p>See the forms you've built and their submissions.</p>
          </Link>
        </div>
      </main>
    </div>
  );
}

export default Hub;
