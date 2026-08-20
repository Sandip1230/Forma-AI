import { Link } from "react-router-dom";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function FormsTable({ forms }) {
  if (forms.length === 0) {
    return <div className="forms-table__empty">No forms yet. Use "Seed Demo Form" above to create one.</div>;
  }

  return (
    <div className="forms-table">
      <div className="forms-table__row forms-table__row--head">
        <span>Title</span>
        <span>Form ID</span>
        <span>Fields</span>
        <span>Submissions</span>
        <span>Created</span>
        <span></span>
      </div>
      {forms.map((f) => (
        <div className="forms-table__row" key={f.formId}>
          <span className="forms-table__title">{f.title}</span>
          <code className="forms-table__id">{f.formId}</code>
          <span>{f.fieldCount}</span>
          <span>
            {f.submissionCount > 0 ? (
              <span className="forms-table__badge forms-table__badge--active">{f.submissionCount}</span>
            ) : (
              <span className="forms-table__badge">0</span>
            )}
          </span>
          <span className="forms-table__date">{formatDate(f.createdAt)}</span>
          <Link to={`/forms/${f.formId}`} className="forms-table__open">
            Open
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M9 7h8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </Link>
        </div>
      ))}
    </div>
  );
}

export default FormsTable;