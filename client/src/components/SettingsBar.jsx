import { useState } from "react";
import { seedDemoForm, resetDemoData, checkHealth, exportResponsesCsv } from "../services/api";
import DocsModal from "./DocsModal";

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

function SettingsBar({ onDataChanged, isAdmin = false }) {
  const [toast, setToast] = useState(null); // { text, tone }
  const [busy, setBusy] = useState(null);
  const [docsOpen, setDocsOpen] = useState(false);

  const showToast = (text, tone = "info") => {
    setToast({ text, tone });
    setTimeout(() => setToast(null), 2800);
  };

  const run = async (id, fn, successMsg) => {
    setBusy(id);
    try {
      const result = await fn();
      showToast(successMsg ? successMsg(result) : "Done.", "success");
      onDataChanged?.();
    } catch (err) {
      showToast(err.message || "Something went wrong.", "error");
    } finally {
      setBusy(null);
    }
  };

  const handleSeed = () => run("seed", seedDemoForm, (r) => r.message);
  const handleExport = () => run("export", exportResponsesCsv, () => "Download started.");
  const handleHealth = () => run("health", checkHealth, (r) => `API healthy — ${r.latencyMs}ms`);
  const handleReset = () => {
    if (!window.confirm("Delete all claim-demo submissions? This can't be undone.")) return;
    run("reset", resetDemoData, (r) => r.message);
  };
  const handleViewForms = () => document.getElementById("dash-forms-section")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="settings-bar">
      <span className="settings-bar__label">Quick Actions</span>
      <div className="settings-bar__grid">
        {isAdmin && (
          <button className="settings-btn" onClick={handleSeed} disabled={busy === "seed"}>
            <Icon name="seed" /> {busy === "seed" ? "Seeding…" : "Seed Demo Form"}
          </button>
        )}
        <button className="settings-btn" onClick={handleViewForms}>
          <Icon name="list" /> View All Forms
        </button>
        {isAdmin && (
          <button className="settings-btn" onClick={handleExport} disabled={busy === "export"}>
            <Icon name="export" /> {busy === "export" ? "Exporting…" : "Export Responses"}
          </button>
        )}
        <button className="settings-btn" onClick={handleHealth} disabled={busy === "health"}>
          <Icon name="health" /> {busy === "health" ? "Checking…" : "API Health Check"}
        </button>
        {isAdmin && (
          <button className="settings-btn settings-btn--danger" onClick={handleReset} disabled={busy === "reset"}>
            <Icon name="reset" /> {busy === "reset" ? "Resetting…" : "Reset Demo Data"}
          </button>
        )}
        <button className="settings-btn" onClick={() => setDocsOpen(true)}>
          <Icon name="docs" /> Documentation
        </button>
      </div>
      {toast && <div className={`settings-toast settings-toast--${toast.tone} fade-in`}>{toast.text}</div>}
      {docsOpen && <DocsModal onClose={() => setDocsOpen(false)} />}
    </div>
  );
}

export default SettingsBar;