import { useCallback, useEffect, useState } from "react";
import { api } from "../../api/client";
import { Card, StatusBadge } from "../../components/dashboard/DashboardUi";
import { formatDate, formatMoney } from "../../lib/tourImages";
const statuses = ["all", "pending", "confirmed", "waitlist", "cancelled"];
export default function DashboardBookings() {
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setError("");
    try {
      const params = new URLSearchParams({ status, q: search });
      const data = await api(`/bookings?${params}`);
      setRows(data.bookings);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [status, search]);
  useEffect(() => {
    load();
  }, [load]);
  async function changeStatus(id, next) {
    setBusy(id);
    setError("");
    try {
      await api(`/bookings/${id}/status`, {
        method: "PATCH",
        body: { status: next },
      });
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  }
  return (
    <div className="portal-page space-y-6">
      <div>
        <p className="eyebrow">TRAVELLER REQUESTS</p>
        <h2 className="font-volkhov text-4xl mt-2">
          Every journey starts here.
        </h2>
        <p className="status-note mt-3">
          Review requests and confirm places. Confirmation reserves seats;
          changing a confirmed booking to another status releases them.
        </p>
      </div>
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      <Card
        title="Booking requests"
        subtitle={`${rows.length} requests in this view`}
      >
        <div className="flex flex-wrap gap-4 justify-between mb-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSearch(q);
            }}
            className="flex gap-2"
          >
            <input
              aria-label="Search bookings"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Name, email, or reference"
              className="border border-black/10 rounded-lg px-3 py-2 text-xs"
            />
            <button className="text-button">Search</button>
          </form>
          <div className="filter-pills" style={{ marginBottom: 0 }}>
            {statuses.map((s) => (
              <button
                key={s}
                className={status === s ? "active" : ""}
                aria-pressed={status === s}
                onClick={() => setStatus(s)}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <p role="status">Loading requests…</p>
        ) : !rows.length ? (
          <p className="status-note py-8">No requests match your filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr>
                  {[
                    "Reference / traveller",
                    "Journey",
                    "Departure",
                    "Travellers",
                    "Trip total",
                    "Status",
                    "Update",
                  ].map((h) => (
                    <th key={h} className="pr-5 border-b border-black/10">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((b) => (
                  <tr key={b._id} className="border-b border-black/5">
                    <td className="pr-5">
                      <span className="font-mono text-[10px] text-primary">
                        {b.reference}
                      </span>
                      <p className="font-medium mt-1">{b.guestName}</p>
                      <p className="status-note">{b.email}</p>
                      {b.phone && <p className="status-note">{b.phone}</p>}
                      {b.notes && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-xs text-primary">
                            Guest notes
                          </summary>
                          <p className="status-note max-w-xs whitespace-pre-wrap mt-2">
                            {b.notes}
                          </p>
                        </details>
                      )}
                    </td>
                    <td className="pr-5">{b.tour?.title}</td>
                    <td className="pr-5 whitespace-nowrap">
                      {formatDate(b.departure?.startDate)}
                    </td>
                    <td className="pr-5">{b.partySize}</td>
                    <td className="pr-5">{formatMoney(b.total)}</td>
                    <td className="pr-5">
                      <StatusBadge status={b.status} />
                    </td>
                    <td>
                      <select
                        aria-label={`Update ${b.reference}`}
                        disabled={busy === b._id}
                        value={b.status}
                        onChange={(e) => changeStatus(b._id, e.target.value)}
                        className="border border-black/10 p-2 rounded-lg text-xs"
                      >
                        {statuses.slice(1).map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
