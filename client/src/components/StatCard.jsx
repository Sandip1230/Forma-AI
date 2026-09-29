// `delta` is optional and signed — omit it (or pass 0) for a stat with
// nothing to compare against yet. More activity reads as positive here
// (this is submission volume, not something like error count), so a rise
// gets the success color and a drop just gets a muted one, never red.
function StatCard({ label, value, icon, tone = "default", delta, deltaLabel }) {
  const showDelta = typeof delta === "number" && delta !== 0;
  return (
    <div className={`stat-card stat-card--${tone}`}>
      <div className="stat-card__icon">{icon}</div>
      <div>
        <div className="stat-card__value-row">
          <div className="stat-card__value">{value}</div>
          {showDelta && (
            <span className={`stat-card__delta ${delta > 0 ? "stat-card__delta--up" : "stat-card__delta--down"}`}>
              {delta > 0 ? "↑" : "↓"} {Math.abs(delta)}
            </span>
          )}
        </div>
        <div className="stat-card__label">{label}{showDelta && deltaLabel ? ` · ${deltaLabel}` : ""}</div>
      </div>
    </div>
  );
}

export default StatCard;