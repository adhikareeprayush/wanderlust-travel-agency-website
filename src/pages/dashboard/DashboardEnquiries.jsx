import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { Card } from "../../components/dashboard/DashboardUi";
import { formatDate } from "../../lib/tourImages";
export default function DashboardEnquiries() {
  const [rows, setRows] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [tab, setTab] = useState("enquiries");
  useEffect(() => {
    Promise.all([api("/enquiries"), api("/newsletter")])
      .then(([a, b]) => {
        setRows(a.enquiries);
        setSubscribers(b.subscribers);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  async function update(id, status) {
    setBusy(id);
    setError("");
    try {
      const data = await api(`/enquiries/${id}`, {
        method: "PATCH",
        body: { status },
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
  return (
    <div className="portal-page space-y-6">
      <div>
        <p className="eyebrow">KEEP THE CONVERSATION GOING</p>
        <h2 className="font-volkhov text-4xl mt-2">Enquiries & inspiration</h2>
        <p className="status-note mt-3">
          Review travel plans, track follow-ups, and see who has subscribed.
        </p>
      </div>
      <div className="filter-pills">
        {["enquiries", "subscribers"].map((t) => (
          <button
            key={t}
            className={tab === t ? "active" : ""}
            onClick={() => setTab(t)}
          >
            {t === "enquiries"
              ? `Enquiries (${rows.length})`
              : `Subscribers (${subscribers.length})`}
          </button>
        ))}
      </div>
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      {loading ? (
        <p role="status">Opening the inbox…</p>
      ) : tab === "enquiries" ? (
        rows.length ? (
          rows.map((row) => (
            <Card
              key={row._id}
              title={row.name}
              subtitle={`${row.email} · ${formatDate(row.createdAt)}`}
              action={
                <select
                  aria-label={`Status for ${row.name}`}
                  disabled={busy === row._id}
                  value={row.status}
                  onChange={(e) => update(row._id, e.target.value)}
                  className="rounded-lg border border-black/10 p-2 text-xs"
                >
                  <option value="new">New</option>
                  <option value="in_progress">In progress</option>
                  <option value="closed">Closed</option>
                </select>
              }
            >
              <p className="text-sm whitespace-pre-wrap leading-7">
                {row.message}
              </p>
              {row.phone && <p className="status-note mt-3">{row.phone}</p>}
              {row.tourSlug && (
                <p className="status-note mt-3">Journey: {row.tourSlug}</p>
              )}
            </Card>
          ))
        ) : (
          <Card title="All caught up">
            <p className="status-note">
              New website enquiries will appear here.
            </p>
          </Card>
        )
      ) : (
        <Card
          title="Travel inspiration subscribers"
          subtitle="Explicit newsletter sign-ups"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr>
                  <th>Email address</th>
                  <th>Subscribed</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((s) => (
                  <tr key={s._id} className="border-t border-black/5">
                    <td>{s.email}</td>
                    <td>{formatDate(s.subscribedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!subscribers.length && (
              <p className="status-note py-6">No subscribers yet.</p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
