import "./Analytics.css";

const MAX_BARS = 8;

// Horizontal bars, one per form — a single series (submission count), so per
// the chart's own title there's no legend to draw, and with at most 8 bars
// every value is directly labeled rather than hidden behind a hover.
function SubmissionsByFormChart({ forms }) {
  const top = [...forms].sort((a, b) => b.submissionCount - a.submissionCount).slice(0, MAX_BARS);
  const max = Math.max(1, ...top.map((f) => f.submissionCount));

  return (
    <div className="analytics-card">
      <h3 className="analytics-card__title">Submissions by form</h3>
      {top.length === 0 ? (
        <p className="analytics-card__empty">No forms yet.</p>
      ) : (
        <div className="bf-chart">
          {top.map((f) => (
            <div className="bf-row" key={f.formId}>
              <span className="bf-row__label" title={f.title}>
                {f.title}
              </span>
              <div className="bf-row__track">
                <div className="bf-row__bar" style={{ width: `${(f.submissionCount / max) * 100}%` }} />
              </div>
              <span className="bf-row__value">{f.submissionCount}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SubmissionsByFormChart;
