import { useState } from "react";
import "./Analytics.css";

function formatShortDate(isoDate) {
  const d = new Date(`${isoDate}T00:00:00`);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// Daily submission counts as columns. 14 points is too many to label
// directly without clutter, so each bar carries its value on hover/focus
// instead, with just the first and last date anchoring the axis.
function SubmissionsTimelineChart({ dailySubmissions }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const max = Math.max(1, ...dailySubmissions.map((d) => d.count));
  const active = activeIndex !== null ? dailySubmissions[activeIndex] : null;

  return (
    <div className="analytics-card">
      <div className="analytics-card__head">
        <h3 className="analytics-card__title">Submissions, last {dailySubmissions.length} days</h3>
        <span className="tl-chart__readout">
          {active ? (
            <>
              <strong>{active.count}</strong> on {formatShortDate(active.date)}
            </>
          ) : (
            <>&nbsp;</>
          )}
        </span>
      </div>

      <div className="tl-chart">
        {dailySubmissions.map((d, i) => (
          <div
            key={d.date}
            className={`tl-col ${i === activeIndex ? "tl-col--active" : ""}`}
            tabIndex={0}
            onMouseEnter={() => setActiveIndex(i)}
            onMouseLeave={() => setActiveIndex(null)}
            onFocus={() => setActiveIndex(i)}
            onBlur={() => setActiveIndex(null)}
          >
            <div className="tl-col__bar" style={{ height: `${(d.count / max) * 100}%` }} />
          </div>
        ))}
      </div>
      <div className="tl-chart__axis">
        <span>{formatShortDate(dailySubmissions[0]?.date)}</span>
        <span>{formatShortDate(dailySubmissions[dailySubmissions.length - 1]?.date)}</span>
      </div>

      {/* Every day's exact count, reachable without hovering — the chart
          itself only labels values on hover/focus. */}
      <details className="tl-chart__table-toggle">
        <summary>View exact counts</summary>
        <table className="tl-chart__table">
          <tbody>
            {dailySubmissions.map((d) => (
              <tr key={d.date}>
                <td>{formatShortDate(d.date)}</td>
                <td>{d.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}

export default SubmissionsTimelineChart;
