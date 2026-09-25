import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import {
  Avatar,
  Card,
  EmptyState,
  LoadingState,
  PageHeader,
  SearchField,
  Segmented,
  StatusBadge,
  SummaryStrip,
  Toolbar,
} from "../../components/dashboard/DashboardUi";
import Icon from "../../components/Icon";
import { formatDate } from "../../lib/tourImages";

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "In progress" },
  { value: "closed", label: "Closed" },
];

export default function DashboardEnquiries() {
  const [rows, setRows] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [tab, setTab] = useState("enquiries");
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  useEffect(() => {
    Promise.all([api("/enquiries"), api("/newsletter")])
      .then(([a, b]) => {
        setRows(a.enquiries);
        setSubscribers(b.subscribers);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  async function update(id, next) {
    setBusy(id);
    setError("");
    try {
      const data = await api(`/enquiries/${id}`, {
        method: "PATCH",
        body: { status: next },
      });
      setRows((prev) =>
        prev.map((row) => (row._id === id ? data.enquiry : row)),
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  }
  const count = (s) => rows.filter((row) => row.status === s).length;
  const term = query.trim().toLowerCase();
  const visible = useMemo(
    () =>
      rows.filter(
        (row) =>
          (status === "all" || row.status === status) &&
          (!term ||
            [row.name, row.email, row.message, row.tourSlug]
              .filter(Boolean)
              .some((value) => value.toLowerCase().includes(term))),
      ),
    [rows, status, term],
  );
  const visibleSubscribers = subscribers.filter(
    (s) => !term || s.email.toLowerCase().includes(term),
  );
  return (
    <div className="portal-page">
      <PageHeader
        eyebrow="KEEP THE CONVERSATION GOING"
        title="Enquiries"
        accent="& inspiration."
        description="Answer travel questions, track follow-ups and see who has asked for travel inspiration."
      />
      <SummaryStrip
        items={[
          { label: "New enquiries", value: count("new"), icon: "inbox" },
          {
            label: "In progress",
            value: count("in_progress"),
            icon: "clock",
            tone: "info",
          },
          {
            label: "Closed",
            value: count("closed"),
            icon: "check",
            tone: "muted",
          },
          {
            label: "Newsletter subscribers",
            value: subscribers.length,
            icon: "mail",
            tone: "good",
          },
        ]}
      />
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      <Toolbar>
        <div className="portal-toolbar-group">
          <Segmented
            label="Choose list"
            value={tab}
            onChange={setTab}
            options={[
              { value: "enquiries", label: "Enquiries", count: rows.length },
              {
                value: "subscribers",
                label: "Subscribers",
                count: subscribers.length,
              },
            ]}
          />
          {tab === "enquiries" && (
            <select
              aria-label="Filter by status"
              className="portal-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">Every status</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} ({count(option.value)})
                </option>
              ))}
            </select>
          )}
        </div>
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder={
            tab === "enquiries" ? "Search name, email or message" : "Search email"
          }
        />
      </Toolbar>
      {loading ? (
        <LoadingState>Opening the inbox…</LoadingState>
      ) : tab === "enquiries" ? (
        visible.length ? (
          <div className="portal-inbox">
            {visible.map((row) => (
              <article
                key={row._id}
                className={`portal-enquiry${row.status === "new" ? " is-new" : ""}`}
              >
                <header>
                  <div className="portal-cell-person">
                    <Avatar name={row.name} />
                    <div>
                      <h3>{row.name}</h3>
                      <p>
                        {row.email}
                        {row.phone && ` · ${row.phone}`}
                      </p>
                    </div>
                  </div>
                  <div className="portal-enquiry-meta">
                    <StatusBadge status={row.status} />
                    <time dateTime={row.createdAt}>
                      {formatDate(row.createdAt)}
                    </time>
                  </div>
                </header>
                <p className="portal-enquiry-message">{row.message}</p>
                <footer>
                  <div className="portal-chip-list">
                    {row.tourSlug ? (
                      <Link
                        className="portal-chip is-brand"
                        to={`/packages/${row.tourSlug}`}
                        target="_blank"
                      >
                        <Icon name="pin" size={12} />
                        {row.tourSlug.replace(/-/g, " ")}
                      </Link>
                    ) : (
                      <span className="portal-chip">General enquiry</span>
                    )}
                  </div>
                  <div className="portal-row-actions">
                    <select
                      aria-label={`Status for ${row.name}`}
                      disabled={busy === row._id}
                      value={row.status}
                      onChange={(e) => update(row._id, e.target.value)}
                      className="portal-select is-small"
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <a
                      className="portal-btn portal-btn-primary is-small"
                      href={`mailto:${row.email}?subject=${encodeURIComponent("Your Wanderlust enquiry")}`}
                      onClick={() => {
                        if (row.status === "new") update(row._id, "in_progress");
                      }}
                    >
                      <Icon name="mail" size={13} /> Reply
                    </a>
                  </div>
                </footer>
              </article>
            ))}
          </div>
        ) : (
          <div className="portal-card">
            <EmptyState icon="inbox" title="All caught up">
              {rows.length
                ? "No enquiries match this view."
                : "New website enquiries will appear here."}
            </EmptyState>
          </div>
        )
      ) : (
        <Card
          title="Travel inspiration subscribers"
          subtitle="People who explicitly signed up for the newsletter"
        >
          {visibleSubscribers.length ? (
            <div className="portal-table-wrap">
              <table className="portal-data-table">
                <thead>
                  <tr>
                    <th>Email address</th>
                    <th>Subscribed</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleSubscribers.map((s) => (
                    <tr key={s._id}>
                      <td>
                        <div className="portal-cell-person">
                          <Avatar name={s.email} size="sm" />
                          <strong>{s.email}</strong>
                        </div>
                      </td>
                      <td className="is-num">{formatDate(s.subscribedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState icon="mail" title="No subscribers yet">
              Newsletter sign-ups from the website footer will appear here.
            </EmptyState>
          )}
        </Card>
      )}
    </div>
  );
}
