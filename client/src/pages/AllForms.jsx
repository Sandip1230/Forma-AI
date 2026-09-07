import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchForms, fetchFormResponses } from "../services/api";
import Logo from "../components/Logo";
import "./Dashboard.css";
import "./Hub.css";
import "./YourForms.css";

function SubmissionsPanel({ formId }) {
  const [responses, setResponses] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchFormResponses(formId)
      .then(setResponses)
      .catch((err) => setError(err.message || "Could not load submissions."));
  }, [formId]);

  if (error) return <div className="fb-error yf-panel-error">{error}</div>;
  if (!responses) return <div className="yf-panel-loading">Loading submissions…</div>;
  if (responses.length === 0) return <div className="yf-panel-empty">No submissions yet.</div>;

  const columns = [...new Set(responses.flatMap((r) => Object.keys(r.values || {})))];

  return (
    <div className="yf-table-wrap">
      <table className="yf-table">
        <thead>
          <tr>
            <th>Submitted</th>
            <th title="Which version of the form this was filled against">Schema v</th>
            {columns.map((c) => (
              <th key={c}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {responses.map((r) => (
            <tr key={r.id}>
              <td>{new Date(r.submittedAt).toLocaleString()}</td>
              <td>v{r.schemaVersion || 1}</td>
              {columns.map((c) => (
                <td key={c}>{String(r.values?.[c] ?? "")}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AllForms() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openFormId, setOpenFormId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    fetchForms()
      .then(setForms)
      .catch((err) => setError(err.message || "Could not load forms."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="dash">
      <header className="dash-header">
        <div className="dash-header__brand">
          <Link to="/" className="fb-header__brand-link">
            <Logo size={34} />
            <span className="dash-brand-text">Forma AI</span>
          </Link>
        </div>
        <nav className="dash-header__nav">
          <Link to="/" className="hub-admin-link">
            ← Back
          </Link>
        </nav>
      </header>

      <main className="dash-main">
        <div className="dash-intro">
          <span className="dash-eyebrow">Schema Store</span>
          <h1 className="dash-title">All Forms</h1>
          <p className="dash-subtitle">Every form type in the shared store, and what's been submitted to each.</p>
        </div>

        {error && <div className="dash-error">{error}</div>}

        {loading ? (
          <div className="forms-table__empty">Loading…</div>
        ) : forms.length === 0 ? (
          <div className="forms-table__empty">
            No forms yet. <Link to="/forms/new">Create one</Link>.
          </div>
        ) : (
          <div className="yf-list">
            {forms.map((f) => (
              <div className="yf-card" key={f.formId}>
                <div className="yf-card__row" onClick={() => setOpenFormId(openFormId === f.formId ? null : f.formId)}>
                  <div>
                    <div className="yf-card__title">{f.title}</div>
                    <code className="forms-table__id">{f.formId}</code>
                  </div>
                  <div className="yf-card__meta">
                    <span>{f.fieldCount} field{f.fieldCount === 1 ? "" : "s"}</span>
                    <span className="forms-table__badge forms-table__badge--version">v{f.version || 1}</span>
                    <span className="forms-table__badge forms-table__badge--active">{f.submissionCount} submission{f.submissionCount === 1 ? "" : "s"}</span>
                    <Link to={`/forms/${f.formId}/edit`} className="forms-table__open" onClick={(e) => e.stopPropagation()}>
                      Edit
                    </Link>
                    <Link to={`/forms/${f.formId}`} className="forms-table__open" onClick={(e) => e.stopPropagation()}>
                      Open
                    </Link>
                    <span className="yf-card__chevron">{openFormId === f.formId ? "▲" : "▼"}</span>
                  </div>
                </div>
                {openFormId === f.formId && <SubmissionsPanel formId={f.formId} />}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default AllForms;
