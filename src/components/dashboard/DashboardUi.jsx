import Icon from "../Icon";
import Modal from "./Modal";

const STATUS_NAMES = {
  confirmed: "Confirmed",
  pending: "Pending",
  waitlist: "Waitlist",
  cancelled: "Cancelled",
  open: "Open",
  full: "Full",
  past: "Past",
  new: "New",
  in_progress: "In progress",
  closed: "Closed",
  published: "Published",
  draft: "Draft",
};
export function StatusBadge({ status }) {
  return (
    <span className={`portal-status portal-status-${status}`}>
      <span className="portal-status-dot" aria-hidden="true" />
      {STATUS_NAMES[status] || status}
    </span>
  );
}

const STAT_ICONS = {
  revenue: "chart",
  bookings: "calendar",
  occupancy: "users",
  nps: "mail",
};
export function StatCard({ label, value, change, positive, hint, id, icon }) {
  return (
    <article className="portal-stat">
      <div className="portal-stat-top">
        <p>{label}</p>
        <span className="portal-stat-icon" aria-hidden="true">
          <Icon name={icon || STAT_ICONS[id] || "star"} size={16} />
        </span>
      </div>
      <strong>{value}</strong>
      {(change || hint) && (
        <p className="portal-stat-foot">
          {change && (
            <span className={positive ? "is-positive" : "is-negative"}>
              {change}
            </span>
          )}{" "}
          {hint}
        </p>
      )}
    </article>
  );
}

export function Card({ title, subtitle, children, action, className = "" }) {
  return (
    <section className={`portal-card ${className}`}>
      {(title || action) && (
        <div className="portal-card-header">
          <div>
            {title && <h2>{title}</h2>}
            {subtitle && <p>{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="portal-card-body">{children}</div>
    </section>
  );
}

export function PageHeader({ eyebrow, title, accent, description, actions }) {
  return (
    <div className="portal-page-intro">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>
          {title}
          {accent && (
            <>
              <br />
              <em>{accent}</em>
            </>
          )}
        </h2>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="portal-page-actions">{actions}</div>}
    </div>
  );
}

/** Compact counts that summarise a list page. */
export function SummaryStrip({ items }) {
  return (
    <div className="portal-summary">
      {items.map((item) => (
        <div key={item.label} className="portal-summary-item">
          <span
            className={`portal-summary-icon${item.tone ? ` is-${item.tone}` : ""}`}
            aria-hidden="true"
          >
            <Icon name={item.icon || "star"} size={17} />
          </span>
          <div>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Toolbar({ children }) {
  return <div className="portal-toolbar">{children}</div>;
}

export function SearchField({ value, onChange, placeholder, label }) {
  return (
    <label className="portal-search">
      <Icon name="search" size={16} />
      <span className="sr-only">{label || placeholder}</span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
        >
          <Icon name="close" size={14} />
        </button>
      )}
    </label>
  );
}

export function Segmented({ options, value, onChange, label }) {
  return (
    <div className="portal-segmented" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={value === option.value ? "active" : ""}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
          {option.count !== undefined && <span>{option.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function EmptyState({ icon = "globe", title, children, action }) {
  return (
    <div className="portal-empty">
      <span aria-hidden="true">
        <Icon name={icon} size={24} />
      </span>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

export function LoadingState({ children = "Loading…" }) {
  return (
    <div className="portal-loading" role="status">
      <span aria-hidden="true" />
      {children}
    </div>
  );
}

export function Avatar({ name, size = "md" }) {
  const initials =
    name
      ?.split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";
  return (
    <span className={`portal-list-avatar is-${size}`} aria-hidden="true">
      {initials}
    </span>
  );
}

export function ConfirmDialog({
  title,
  children,
  confirmLabel = "Delete",
  busy,
  error,
  onConfirm,
  onClose,
}) {
  return (
    <Modal title={title} onClose={onClose} size="sm">
      <p className="portal-confirm-copy">{children}</p>
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      <div className="portal-modal-actions">
        <button
          type="button"
          className="portal-btn portal-btn-secondary"
          onClick={onClose}
        >
          Keep it
        </button>
        <button
          type="button"
          className="portal-btn portal-btn-danger"
          onClick={onConfirm}
          disabled={busy}
        >
          {busy ? "Working…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
