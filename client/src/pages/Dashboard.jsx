import { useCallback, useEffect, useState } from "react";
import Logo from "../components/Logo";
import ThemeToggle from "../components/ThemeToggle";
import SettingsBar from "../components/SettingsBar";
import StatCard from "../components/StatCard";
import FormsTable from "../components/FormsTable";
import { fetchForms, fetchDashboardStats } from "../services/api";
import "./Dashboard.css";

function Dashboard() {
  const [forms, setForms] = useState([]);
  const [stats, setStats] = useState({ totalForms: 0, totalSubmissions: 0, submissionsToday: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [apiOnline, setApiOnline] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    Promise.all([fetchForms(), fetchDashboardStats()])
      .then(([formsData, statsData]) => {
        setForms(formsData);
        setStats(statsData);
        setApiOnline(true);
      })
      .catch((err) => {
        setError(err.message || "Could not reach the API.");
        setApiOnline(false);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="dash">
      <header className="dash-header">
        <div className="dash-header__brand">
          <Logo size={34} />
          <span className="dash-brand-text">Forma AI</span>
        </div>
        <nav className="dash-header__nav">
          <span className="dash-api-status">
            <span className={`dash-api-status__dot ${apiOnline ? "" : "dash-api-status__dot--off"}`} />
            {apiOnline ? "API Online" : "API Unreachable"}
          </span>
          <ThemeToggle />
        </nav>
      </header>

      <main className="dash-main">
        <div className="dash-intro">
          <span className="dash-eyebrow">Project Dashboard</span>
          <h1 className="dash-title">Forma AI Admin</h1>
          <p className="dash-subtitle">Manage form schemas and review incoming submissions.</p>
        </div>

        {error && <div className="dash-error">{error}</div>}

        <div className="dash-stats">
          <StatCard
            label="Total Forms" value={loading ? "…" : stats.totalForms} tone="accent"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 2h9l5 5v13a1 1 0 01-1 1H6a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.7" /><path d="M9 11h6M9 15h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>}
          />
          <StatCard
            label="Total Submissions" value={loading ? "…" : stats.totalSubmissions} tone="success"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          />
          <StatCard
            label="Submitted Today" value={loading ? "…" : stats.submissionsToday} tone="pink"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" /></svg>}
          />
        </div>

        <SettingsBar onDataChanged={load} />

        <section className="dash-section" id="dash-forms-section">
          <div className="dash-section__header">
            <h2>Forms</h2>
          </div>
          {loading ? <div className="forms-table__empty">Loading…</div> : <FormsTable forms={forms} />}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;