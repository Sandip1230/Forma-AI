import { useState } from "react";

const ACTIONS = [
  { id: "seed", label: "Seed Demo Form", icon: "seed" },
  { id: "list", label: "View All Forms", icon: "list" },
  { id: "export", label: "Export Responses", icon: "export" },
  { id: "health", label: "API Health Check", icon: "health" },
  { id: "reset", label: "Reset Demo Data", icon: "reset", danger: true },
  { id: "docs", label: "Documentation", icon: "docs" },
];

function Icon({ name }) {
  const p = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none" };
  switch (name) {
    case "seed": return <svg {...p}><path d="M12 22c4-3 7-6 7-11a7 7 0 10-14 0c0 5 3 8 7 11z" stroke="currentColor" strokeWidth="1.7" /><circle cx="12" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.7" /></svg>;
    case "list": return <svg {...p}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" /></svg>;
    case "export": return <svg {...p}><path d="M12 3v12M7 10l5-5 5 5M5 21h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case "health": return <svg {...p}><path d="M3 12h4l2-7 4 14 2-7h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case "reset": return <svg {...p}><path d="M4 4v6h6M20 20v-6h-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M4.6 15a8 8 0 0014.4 2.4M19.4 9A8 8 0 005 6.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
    case "docs": return <svg {...p}><path d="M6 2h9l5 5v13a1 1 0 01-1 1H6a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.7" /><path d="M9 11h6M9 15h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>;
    default: return null;
  }
}

function SettingsBar() {
  const [toast, setToast] = useState("");

  const handleClick = (action) => {
    // Phase 1 is UI-only by design — every action surfaces an honest
    // "not wired yet" message instead of silently doing nothing or
    // pretending to succeed. Phase 2 replaces each of these with a real
    // handler (API call, CSV export, etc).
    setToast(`"${action.label}" will be wired up in Phase 2.`);
    setTimeout(() => setToast(""), 2200);
  };

  return (
    <div className="settings-bar">
      <span className="settings-bar__label">Quick Actions</span>
      <div className="settings-bar__grid">
        {ACTIONS.map((a) => (
          <button key={a.id} className={`settings-btn ${a.danger ? "settings-btn--danger" : ""}`} onClick={() => handleClick(a)}>
            <Icon name={a.icon} />
            {a.label}
          </button>
        ))}
      </div>
      {toast && <div className="settings-toast fade-in">{toast}</div>}
    </div>
  );
}

export default SettingsBar;