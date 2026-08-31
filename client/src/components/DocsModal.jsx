const ENDPOINTS = [
  { method: "GET", path: "/api/forms", desc: "List all form schemas with field/submission counts" },
  { method: "GET", path: "/api/forms/stats", desc: "Dashboard totals (forms, submissions, today)" },
  { method: "GET", path: "/api/forms/:formId", desc: "Fetch one form's schema" },
  { method: "POST", path: "/api/forms/:formId/extract", desc: "AI-extract field values from free text" },
  { method: "POST", path: "/api/forms/:formId/responses", desc: "Submit a filled-out form" },
  { method: "GET", path: "/api/forms/export", desc: "Download all responses as CSV" },
  { method: "POST", path: "/api/forms/seed-demo", desc: "(Re)seed the claim-demo form" },
  { method: "DELETE", path: "/api/forms/demo-data", desc: "Delete all claim-demo submissions" },
];

function DocsModal({ onClose }) {
  return (
    <div className="docs-overlay" onClick={onClose}>
      <div className="docs-panel" onClick={(e) => e.stopPropagation()}>
        <div className="docs-panel__header">
          <h2>API Reference</h2>
          <button onClick={onClose} aria-label="Close">
            <svg width="16" height="17" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </button>
        </div>
        <div className="docs-panel__body">
          {ENDPOINTS.map((e) => (
            <div className="docs-row" key={e.method + e.path}>
              <span className={`docs-method docs-method--${e.method.toLowerCase()}`}>{e.method}</span>
              <code className="docs-path">{e.path}</code>
              <span className="docs-desc">{e.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DocsModal;