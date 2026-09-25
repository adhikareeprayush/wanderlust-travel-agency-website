import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { Card, StatusBadge } from "../../components/dashboard/DashboardUi";
import Modal from "../../components/dashboard/Modal";
import { formatDate } from "../../lib/tourImages";
const empty = {
  tour: "",
  startDate: "",
  seats: 16,
  notes: "",
  guide: "",
  status: "open",
};
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
        : empty,
    );
    setOpen(true);
  }
  return (
    <div className="portal-page space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">THE ROAD AHEAD</p>
          <h2 className="font-volkhov text-4xl mt-2">Departures</h2>
          <p className="status-note mt-3">
            Manage dates, guide assignments and available places.
          </p>
        </div>
        <button className="button" onClick={() => edit(null)}>
          Add departure
        </button>
      </div>
      {error && !open && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      {loading ? (
        <p role="status">Loading departures…</p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {departures.map((d) => (
            <Card
              key={d._id}
              title={formatDate(d.startDate)}
              subtitle={d.tour?.title}
              action={
                <StatusBadge
                  status={
                    new Date(d.startDate) < new Date() ? "past" : d.status
                  }
                />
              }
            >
              <p className="font-volkhov text-3xl">
                {d.bookedCount}{" "}
                <span className="text-lg text-[#77816d]">
                  / {d.seats} places
                </span>
              </p>
              <div
                className="portal-capacity-track"
                aria-label={`${Math.round((d.bookedCount / Math.max(d.seats, 1)) * 100)}% of places filled`}
              >
                <span
                  style={{
                    width: `${Math.min(100, Math.round((d.bookedCount / Math.max(d.seats, 1)) * 100))}%`,
                  }}
                />
              </div>
              <p className="status-note mt-3">
                Guide: {d.guide?.name || "Unassigned"}
              </p>
              {d.notes && <p className="status-note mt-2">{d.notes}</p>}
              <button
                className="button button-outline w-full mt-5"
                onClick={() => edit(d)}
              >
                Edit departure
              </button>
            </Card>
          ))}
        </div>
      )}
      {open && (
        <Modal
          title={editing ? "Edit departure" : "Add departure"}
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
            <label className="field">
              Guide
              <select name="guide" value={form.guide} onChange={change}>
                <option value="">Unassigned</option>
                {guides.map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.name}
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
                <small>
                  Resolve active requests before cancelling a departure.
                </small>
              </label>
            )}
            <label className="field">
              Team notes
              <textarea
                name="notes"
                value={form.notes}
                onChange={change}
                maxLength="2000"
              />
            </label>
            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}
            <button className="button" disabled={busy}>
              {busy ? "Saving…" : "Save departure"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
