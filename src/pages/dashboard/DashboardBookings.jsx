import { useCallback, useEffect, useMemo, useState } from "react";
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
import Modal from "../../components/dashboard/Modal";
import Icon from "../../components/Icon";
import { formatDate, formatMoney } from "../../lib/tourImages";

const STATUSES = ["pending", "waitlist", "confirmed", "cancelled"];
const LABELS = {
  pending: "Pending",
  waitlist: "Waitlist",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
};
const SOURCES = {
  website: "Website",
  agent: "Agent referral",
  repeat: "Repeat guest",
  social: "Social campaign",
  staff: "Added by team",
};

export default function DashboardBookings() {
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await api("/bookings?status=all");
      setRows(data.bookings);
      setError("");
      return data.bookings;
    } catch (e) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(
    () =>
      Object.fromEntries(
        STATUSES.map((s) => [s, rows.filter((b) => b.status === s).length]),
      ),
    [rows],
  );
  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return rows.filter(
      (b) =>
        (status === "all" || b.status === status) &&
        (!term ||
          [b.reference, b.guestName, b.email, b.tour?.title]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(term))),
    );
  }, [rows, query, status]);

  async function changeStatus(booking, next) {
    setBusy(booking._id);
    setError("");
    try {
      await api(`/bookings/${booking._id}/status`, {
        method: "PATCH",
        body: { status: next },
      });
      const fresh = await load();
      setSelected((current) =>
        current?._id === booking._id
          ? fresh?.find((row) => row._id === booking._id) || current
          : current,
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  }

  const openValue = rows
    .filter((b) => b.status === "pending" || b.status === "waitlist")
    .reduce((sum, b) => sum + b.total, 0);

  return (
    <div className="portal-page">
      <PageHeader
        eyebrow="TRAVELLER REQUESTS"
        title="Every journey"
        accent="starts with a request."
        description="Review requests and confirm places. Confirming reserves seats; moving a confirmed booking to another status releases them."
      />
      <SummaryStrip
        items={[
          {
            label: "Awaiting review",
            value: counts.pending ?? 0,
            icon: "clock",
            tone: "warn",
          },
          {
            label: "On the waitlist",
            value: counts.waitlist ?? 0,
            icon: "users",
            tone: "info",
          },
          {
            label: "Confirmed",
            value: counts.confirmed ?? 0,
            icon: "check",
            tone: "good",
          },
          {
            label: "Open request value",
            value: formatMoney(openValue),
            icon: "dollar",
          },
        ]}
      />
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      <Toolbar>
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Search name, email, reference or journey"
        />
        <Segmented
          label="Filter by status"
          value={status}
          onChange={setStatus}
          options={[
            { value: "all", label: "All", count: rows.length },
            ...STATUSES.map((s) => ({
              value: s,
              label: LABELS[s],
              count: counts[s],
            })),
          ]}
        />
      </Toolbar>
      <Card className="portal-table-card">
        {loading ? (
          <LoadingState>Loading requests…</LoadingState>
        ) : !visible.length ? (
          <EmptyState icon="calendar" title="No requests found">
            {rows.length
              ? "Try another status or clear your search."
              : "New booking requests from the website will appear here."}
          </EmptyState>
        ) : (
          <div className="portal-table-wrap">
            <table className="portal-data-table is-responsive">
              <thead>
                <tr>
                  <th>Traveller</th>
                  <th>Journey</th>
                  <th>Departure</th>
                  <th>Guests</th>
                  <th>Trip total</th>
                  <th>Status</th>
                  <th className="is-actions">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((b) => (
                  <tr key={b._id}>
                    <td data-label="Traveller">
                      <div className="portal-cell-person">
                        <Avatar name={b.guestName} size="sm" />
                        <div>
                          <strong>{b.guestName}</strong>
                          <small>
                            {b.reference} · {b.email}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td data-label="Journey">
                      <strong>{b.tour?.title || "Journey"}</strong>
                      {b.notes && (
                        <small className="portal-note-hint">
                          <Icon name="mail" size={12} /> Has guest notes
                        </small>
                      )}
                    </td>
                    <td data-label="Departure" className="is-num">
                      {formatDate(b.departure?.startDate)}
                    </td>
                    <td data-label="Guests" className="is-num">
                      {b.partySize}
                    </td>
                    <td data-label="Trip total" className="is-num">
                      <strong>{formatMoney(b.total)}</strong>
                    </td>
                    <td data-label="Status">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="is-actions">
                      <div className="portal-row-actions">
                        <select
                          aria-label={`Change status of ${b.reference}`}
                          disabled={busy === b._id}
                          value={b.status}
                          onChange={(e) => changeStatus(b, e.target.value)}
                          className="portal-select is-small"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {LABELS[s]}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="portal-icon-btn"
                          aria-label={`View ${b.reference}`}
                          onClick={() => setSelected(b)}
                        >
                          <Icon name="arrow" size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {selected && (
        <Modal
          title={selected.guestName}
          description={`Request ${selected.reference} · received ${formatDate(selected.createdAt)}`}
          onClose={() => {
            setSelected(null);
            setError("");
          }}
        >
          <div className="portal-booking-detail-head">
            <StatusBadge status={selected.status} />
            <span>{SOURCES[selected.source] || "Website"}</span>
          </div>
          <dl className="portal-detail-list">
            <div>
              <dt>Journey</dt>
              <dd>{selected.tour?.title || "Journey"}</dd>
            </div>
            <div>
              <dt>Departure</dt>
              <dd>{formatDate(selected.departure?.startDate)}</dd>
            </div>
            <div>
              <dt>Travellers</dt>
              <dd>{selected.partySize}</dd>
            </div>
            <div>
              <dt>Trip total</dt>
              <dd>{formatMoney(selected.total)}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>
                <a
                  className="portal-card-link"
                  href={`mailto:${selected.email}?subject=${encodeURIComponent(`Your Wanderlust request ${selected.reference}`)}`}
                >
                  {selected.email}
                </a>
              </dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{selected.phone || "Not provided"}</dd>
            </div>
          </dl>
          {selected.departure && (
            <p className="portal-detail-capacity">
              Departure capacity: {selected.departure.bookedCount}/
              {selected.departure.seats} places confirmed
            </p>
          )}
          <div className="portal-note-block">
            <strong>Guest notes</strong>
            {selected.notes || "No notes were added to this request."}
          </div>
          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}
          <div className="portal-modal-actions">
            {selected.status !== "cancelled" && (
              <button
                type="button"
                className="portal-btn portal-btn-secondary"
                disabled={busy === selected._id}
                onClick={() => changeStatus(selected, "cancelled")}
              >
                Cancel request
              </button>
            )}
            {selected.status !== "confirmed" && (
              <button
                type="button"
                className="portal-btn portal-btn-primary"
                disabled={busy === selected._id}
                onClick={() => changeStatus(selected, "confirmed")}
              >
                <Icon name="check" size={15} />
                {busy === selected._id ? "Saving…" : "Confirm places"}
              </button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
