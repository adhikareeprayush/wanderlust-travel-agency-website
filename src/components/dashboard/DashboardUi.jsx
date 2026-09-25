export function StatusBadge({ status }) {
  const names = {
    confirmed: "Confirmed",
    pending: "Pending",
    waitlist: "Waitlist",
    cancelled: "Cancelled",
    open: "Open",
    full: "Full",
    past: "Past",
  };
  return (
    <span className={`portal-status portal-status-${status}`}>
      <span className="portal-status-dot" aria-hidden="true" />
      {names[status] || status}
    </span>
  );
}
export function StatCard({ label, value, change, positive, hint, id }) {
  const icons = {
    revenue: "chart",
    bookings: "calendar",
    occupancy: "users",
    nps: "mail",
  };
  return (
    <article className="portal-stat">
      <div className="portal-stat-top">
        <p>{label}</p>
        <span className="portal-stat-icon" aria-hidden="true">
          {id === "revenue"
            ? "$"
            : id === "bookings"
              ? "↗"
              : id === "occupancy"
                ? "◫"
                : icons[id]
                  ? "✉"
                  : "◉"}
        </span>
      </div>
      <strong>{value}</strong>
      <p className="portal-stat-foot">
        <span className={positive ? "is-positive" : "is-negative"}>
          {change}
        </span>{" "}
        {hint}
      </p>
    </article>
  );
}
export function Card({ title, subtitle, children, action, className = "" }) {
  return (
    <section className={`portal-card ${className}`}>
      <div className="portal-card-header">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="portal-card-body">{children}</div>
    </section>
  );
}
