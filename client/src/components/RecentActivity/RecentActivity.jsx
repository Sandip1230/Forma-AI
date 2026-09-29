import { useEffect, useState } from "react";
import { fetchRecentActivity, subscribeToSubmissionEvents } from "../../services/api";
import "./RecentActivity.css";

const MAX_ITEMS = 8;

function formatRelativeTime(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// The first thing you see after logging in shouldn't be static — this pulls
// the last few submissions across every form on load, then stays live via
// the same SSE stream the Dashboard uses, so new activity appears here too
// without a refresh.
function RecentActivity() {
  const [items, setItems] = useState(null);
  const [live, setLive] = useState(false);
  const [, forceTick] = useState(0);

  useEffect(() => {
    fetchRecentActivity()
      .then(setItems)
      .catch(() => setItems([]));

    const source = subscribeToSubmissionEvents();
    source.onopen = () => setLive(true);
    source.onerror = () => setLive(false);
    source.addEventListener("submission", (e) => {
      const { formId, formTitle, submittedAt } = JSON.parse(e.data);
      setItems((prev) => [{ formId, formTitle, submittedAt }, ...(prev || [])].slice(0, MAX_ITEMS));
    });
    return () => source.close();
  }, []);

  // Relative timestamps ("2m ago") go stale silently otherwise — this just
  // re-renders once a minute so they stay roughly accurate.
  useEffect(() => {
    const timer = setInterval(() => forceTick((n) => n + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  if (items && items.length === 0) return null;

  return (
    <div className="recent-activity">
      <div className="recent-activity__head">
        <h3 className="recent-activity__title">Recent activity</h3>
        <span className={`recent-activity__live ${live ? "recent-activity__live--on" : ""}`}>
          <span className="recent-activity__live-dot" />
          {live ? "Live" : "Connecting…"}
        </span>
      </div>

      {items === null ? (
        <div className="recent-activity__empty">Loading…</div>
      ) : (
        <ul className="recent-activity__list">
          {items.map((item, i) => (
            <li key={`${item.formId}-${item.submittedAt}-${i}`} className="recent-activity__item">
              <span className="recent-activity__dot" />
              <span className="recent-activity__text">
                New submission on <strong>{item.formTitle}</strong>
              </span>
              <span className="recent-activity__time">{formatRelativeTime(item.submittedAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default RecentActivity;
