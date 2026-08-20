import Logo from "../components/Logo";
import ThemeToggle from "../components/ThemeToggle";
import SettingsBar from "../components/SettingsBar";
import StatCard from "../components/StatCard";
import FormsTable from "../components/FormsTable";
import { mockForms, mockStats } from "../lib/mockDashboardData";
import "./Dashboard.css";

function Dashboard() {
  return (
    <div className="dash">
      <header className="dash-header">
        <div className="dash-header__brand">
          <Logo size={34} />
          <span className="dash-brand-text">Forma AI</span>
        </div>
        <nav className="dash-header__nav">
          <span className="dash-api-status">
            <span className="dash-api-status__dot" />
            API Online
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

        <div className="dash-stats">
          <StatCard
            label="Total Forms"
            value={mockStats.totalForms}
            tone="accent"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 2h9l5 5v13a1 1 0 01-1 1H6a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.7" /><path d="M9 11h6M9 15h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>}
          />
          <StatCard
            label="Total Submissions"
            value={mockStats.totalSubmissions}
            tone="success"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          />
          <StatCard
            label="Submitted Today"
            value={mockStats.submissionsToday}
            tone="pink"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" /></svg>}
          />
        </div>

        <SettingsBar />

        <section className="dash-section">
          <div className="dash-section__header">
            <h2>Forms</h2>
            <span className="dash-section__hint">Mock data — connects to GET /api/forms in Phase 2</span>
          </div>
          <FormsTable forms={mockForms} />
        </section>
      </main>
    </div>
  );
}

export default Dashboard;