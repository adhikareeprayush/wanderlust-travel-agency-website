import { useEffect, useMemo, useState } from "react";
import { api } from "../../api/client";
import {
  ConfirmDialog,
  EmptyState,
  LoadingState,
  PageHeader,
  Segmented,
  StatusBadge,
  SummaryStrip,
  Toolbar,
} from "../../components/dashboard/DashboardUi";
import Modal from "../../components/dashboard/Modal";
import Icon from "../../components/Icon";
import { formatDate } from "../../lib/tourImages";

const empty = {
  tour: "",
  startDate: "",
  seats: 16,
  notes: "",
  guide: "",
  status: "open",
};
const isPast = (d) => new Date(d.startDate) < new Date();
const monthLabel = (value) =>
  new Date(value).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

export default function DashboardCalendar() {
  const [departures, setDepartures] = useState([]);
  const [tours, setTours] = useState([]);
  const [guides, setGuides] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [when, setWhen] = useState("upcoming");
  const [tourFilter, setTourFilter] = useState("all");
  const [removing, setRemoving] = useState(null);
  const [removeError, setRemoveError] = useState("");

  async function load() {
    try {
      const [d, t, g] = await Promise.all([
        api("/departures"),
        api("/tours?published=all"),
        api("/guides"),
      ]);
      setDepartures(d.departures);
      setTours(t.tours);
      setGuides(g.guides);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  const upcoming = departures.filter(
    (d) => !isPast(d) && d.status !== "cancelled",
  );
  const booked = upcoming.reduce((sum, d) => sum + d.bookedCount, 0);
  const seats = upcoming.reduce((sum, d) => sum + d.seats, 0);

  const groups = useMemo(() => {
    const rows = departures
      .filter((d) =>
        when === "upcoming" ? !isPast(d) : when === "past" ? isPast(d) : true,
      )
      .filter((d) => tourFilter === "all" || d.tour?._id === tourFilter);
    if (when === "past") rows.reverse();
    const map = new Map();
    for (const d of rows) {
      const key = monthLabel(d.startDate);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(d);
    }
    return [...map.entries()];
  }, [departures, when, tourFilter]);

  const change = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const body = { ...form, guide: form.guide || null };
      if (
        editing &&
        body.startDate ===
          new Date(editing.startDate).toISOString().slice(0, 10)
      )
        delete body.startDate;
      await api(editing ? `/departures/${editing._id}` : "/departures", {
        method: editing ? "PATCH" : "POST",
        body,
      });
      setOpen(false);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    setBusy(true);
    setRemoveError("");
    try {
      await api(`/departures/${removing._id}`, { method: "DELETE" });
      setRemoving(null);
      await load();
    } catch (err) {
      setRemoveError(err.message);
    } finally {
      setBusy(false);
    }
  }
  function edit(d) {
    setError("");
    setEditing(d);
    setForm(
      d
        ? {
            tour: d.tour?._id || "",
            startDate: new Date(d.startDate).toISOString().slice(0, 10),
            seats: d.seats,
            guide: d.guide?._id || "",
            notes: d.notes || "",
            status: d.status,
          }
        : { ...empty, tour: tourFilter === "all" ? "" : tourFilter },
    );
    setOpen(true);
  }
  return (
    <div className="portal-page">
      <PageHeader
        eyebrow="THE ROAD AHEAD"
        title="Departures,"
        accent="date by date."
        description="Manage dates, guide assignments and available places. Confirmed bookings fill places; pending requests do not."
        actions={
          <button
            type="button"
            className="portal-btn portal-btn-primary"
            onClick={() => edit(null)}
          >
            <Icon name="plus" size={15} /> Add departure
          </button>
        }
      />
      <SummaryStrip
        items={[
          {
            label: "Upcoming departures",
            value: upcoming.length,
            icon: "calendar",
          },
          {
            label: "Places confirmed",
            value: `${booked}/${seats}`,
            icon: "users",
            tone: "good",
          },
          {
            label: "Average fill",
            value: `${seats ? Math.round((booked / seats) * 100) : 0}%`,
            icon: "chart",
            tone: "info",
          },
          {
            label: "Without a guide",
            value: upcoming.filter((d) => !d.guide).length,
            icon: "alert",
            tone: "warn",
          },
        ]}
      />
      {error && !open && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      <Toolbar>
        <select
          aria-label="Filter by journey"
          className="portal-select"
          value={tourFilter}
          onChange={(e) => setTourFilter(e.target.value)}
        >
          <option value="all">All journeys</option>
          {tours.map((t) => (
            <option key={t._id} value={t._id}>
              {t.title}
            </option>
          ))}
        </select>
        <Segmented
          label="Show departures"
          value={when}
          onChange={setWhen}
          options={[
            {
              value: "upcoming",
              label: "Upcoming",
              count: departures.filter((d) => !isPast(d)).length,
            },
            {
              value: "past",
              label: "Past",
              count: departures.filter(isPast).length,
            },
            { value: "all", label: "All", count: departures.length },
          ]}
        />
      </Toolbar>
      {loading ? (
        <LoadingState>Loading departures…</LoadingState>
      ) : !groups.length ? (
        <div className="portal-card">
          <EmptyState icon="calendar" title="No departures here">
            Add a date for a journey so travellers can request places.
          </EmptyState>
        </div>
      ) : (
        groups.map(([month, rows]) => (
          <section key={month} className="portal-month">
            <h3 className="portal-month-title">
              {month} <span>{rows.length}</span>
            </h3>
            <div className="portal-card portal-departure-list">
              {rows.map((d) => {
                const fill = Math.round(
                  (d.bookedCount / Math.max(d.seats, 1)) * 100,
                );
                const date = new Date(d.startDate);
                return (
                  <article key={d._id} className="portal-departure-row">
                    <span className="viz-date-chip is-lg">
                      <strong>{date.getDate()}</strong>
                      {date.toLocaleString("en-GB", { weekday: "short" })}
                    </span>
                    <div className="portal-departure-main">
                      <h4>{d.tour?.title || "Journey"}</h4>
                      <p>
                        <span>
                          <Icon name="shield" size={13} />
                          {d.guide?.name || "No guide yet"}
                        </span>
                        {d.tour?.durationDays && (
                          <span>
                            <Icon name="clock" size={13} />
                            {d.tour.durationDays} days
                          </span>
                        )}
                        {d.notes && (
                          <span className="portal-departure-note">
                            <Icon name="mail" size={13} />
                            {d.notes}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="portal-departure-fill">
                      <p>
                        <strong>{d.bookedCount}</strong>/{d.seats} places
                        <span>{fill}%</span>
                      </p>
                      <span
                        className={`portal-capacity-track${fill >= 100 ? " is-full" : ""}`}
                      >
                        <span style={{ width: `${Math.min(100, fill)}%` }} />
                      </span>
                    </div>
                    <StatusBadge status={isPast(d) ? "past" : d.status} />
                    <div className="portal-row-actions">
                      <button
                        type="button"
                        className="portal-icon-btn"
                        aria-label={`Edit departure on ${formatDate(d.startDate)}`}
                        onClick={() => edit(d)}
                      >
                        <Icon name="edit" size={15} />
                      </button>
                      <button
                        type="button"
                        className="portal-icon-btn is-danger"
                        aria-label={`Delete departure on ${formatDate(d.startDate)}`}
                        onClick={() => {
                          setRemoveError("");
                          setRemoving(d);
                        }}
                      >
                        <Icon name="trash" size={15} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))
      )}
      {open && (
        <Modal
          title={editing ? "Edit departure" : "Add departure"}
          description={
            editing
              ? `${editing.tour?.title} · ${editing.bookedCount} places confirmed`
              : "Choose a journey, a future date and how many places are available."
          }
          onClose={() => setOpen(false)}
        >
          <form className="form-stack" onSubmit={submit}>
            <label className="field">
              Journey
              <select
                name="tour"
                value={form.tour}
                onChange={change}
                required
                disabled={Boolean(editing)}
              >
                <option value="">Choose a journey</option>
                {tours.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </label>
            <div className="form-row">
              <label className="field">
                Departure date
                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={change}
                  required
                  min={
                    !editing
                      ? new Date(Date.now() + 864e5).toISOString().slice(0, 10)
                      : undefined
                  }
                />
              </label>
              <label className="field">
                Total capacity
                <input
                  type="number"
                  name="seats"
                  value={form.seats}
                  onChange={change}
                  required
                  min={Math.max(1, editing?.bookedCount || 0)}
                  max="200"
                  step="1"
                />
              </label>
            </div>
            <div className="form-row">
              <label className="field">
                Guide
                <select name="guide" value={form.guide} onChange={change}>
                  <option value="">Unassigned</option>
                  {guides.map((g) => (
                    <option key={g._id} value={g._id}>
                      {g.name} · {g.status}
                    </option>
                  ))}
                </select>
              </label>
              {editing && (
                <label className="field">
                  Status
                  <select name="status" value={form.status} onChange={change}>
                    <option value="open">Open</option>
                    <option value="full">Full</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </label>
              )}
            </div>
            {editing && (
              <p className="portal-form-hint">
                Resolve active requests before cancelling a departure.
              </p>
            )}
            <label className="field">
              Team notes
              <textarea
                name="notes"
                value={form.notes}
                onChange={change}
                maxLength="2000"
                rows="3"
                placeholder="Rooming lists, supplier holds, reminders…"
              />
            </label>
            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}
            <div className="portal-modal-actions">
              <button
                type="button"
                className="portal-btn portal-btn-secondary"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button className="portal-btn portal-btn-primary" disabled={busy}>
                {busy ? "Saving…" : editing ? "Save changes" : "Add departure"}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {removing && (
        <ConfirmDialog
          title="Delete this departure?"
          confirmLabel="Delete date"
          busy={busy}
          error={removeError}
          onClose={() => setRemoving(null)}
          onConfirm={remove}
        >
          The {formatDate(removing.startDate)} date for{" "}
          <strong>{removing.tour?.title}</strong> will be removed. Dates with
          booking history cannot be deleted; set their status to cancelled
          instead.
        </ConfirmDialog>
      )}
    </div>
  );
}
