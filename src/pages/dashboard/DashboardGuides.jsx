import { useEffect, useMemo, useState } from "react";
import { api } from "../../api/client";
import {
  Avatar,
  ConfirmDialog,
  EmptyState,
  LoadingState,
  PageHeader,
  SearchField,
  Segmented,
  SummaryStrip,
  Toolbar,
} from "../../components/dashboard/DashboardUi";
import Modal from "../../components/dashboard/Modal";
import Icon from "../../components/Icon";

const STATUSES = ["Available", "On tour", "Leave soon"];
const STATUS_CLASS = {
  Available: "confirmed",
  "On tour": "in_progress",
  "Leave soon": "pending",
};

const empty = {
  name: "",
  region: "",
  experienceYears: 5,
  languages: "English",
  status: "Available",
  email: "",
  phone: "",
  tours: [],
};

function Rating({ value }) {
  const rating = Number(value) || 0;
  return (
    <span className="portal-rating" aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Icon
          key={star}
          name="star"
          size={13}
          className={rating >= star - 0.25 ? "is-on" : ""}
        />
      ))}
      <strong>{rating.toFixed(1)}</strong>
    </span>
  );
}

const DashboardGuides = () => {
  const [guides, setGuides] = useState([]);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [removing, setRemoving] = useState(null);
  const [removeError, setRemoveError] = useState("");

  const load = () =>
    Promise.all([api("/guides"), api("/tours?published=all")])
      .then(([g, t]) => {
        setGuides(g.guides);
        setTours(t.tours);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return guides.filter(
      (g) =>
        (status === "all" || g.status === status) &&
        (!term ||
          [g.name, g.region, ...(g.languages || [])]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(term))),
    );
  }, [guides, query, status]);

  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }));
  const toggleTour = (id) =>
    setForm((f) => ({
      ...f,
      tours: f.tours.includes(id)
        ? f.tours.filter((tour) => tour !== id)
        : [...f.tours, id],
    }));

  const startEdit = (guide) => {
    setError("");
    setEditing(guide);
    setForm(
      guide
        ? {
            name: guide.name,
            region: guide.region || "",
            experienceYears: guide.experienceYears,
            languages: (guide.languages || []).join(", "),
            status: guide.status,
            email: guide.email || "",
            phone: guide.phone || "",
            tours: (guide.tours || []).map((tour) => tour._id || tour),
          }
        : empty,
    );
    setOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const payload = {
        ...form,
        languages: form.languages
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      if (editing)
        await api(`/guides/${editing._id}`, { method: "PATCH", body: payload });
      else await api("/guides", { method: "POST", body: payload });
      setOpen(false);
      setEditing(null);
      setForm(empty);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    setRemoveError("");
    try {
      await api(`/guides/${removing._id}`, { method: "DELETE" });
      setRemoving(null);
      load();
    } catch (err) {
      setRemoveError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const count = (s) => guides.filter((g) => g.status === s).length;
  const avgRating = guides.length
    ? guides.reduce((sum, g) => sum + (Number(g.rating) || 0), 0) /
      guides.length
    : 0;

  return (
    <div className="portal-page">
      <PageHeader
        eyebrow="YOUR GUIDING TEAM"
        title="Guides"
        accent="who make it personal."
        description="Hosts, their languages and the journeys they lead. Assign a guide to a specific date from Departures."
        actions={
          <button
            type="button"
            onClick={() => startEdit(null)}
            className="portal-btn portal-btn-primary"
          >
            <Icon name="plus" size={15} /> Add guide
          </button>
        }
      />
      <SummaryStrip
        items={[
          { label: "Guides", value: guides.length, icon: "shield" },
          {
            label: "Available now",
            value: count("Available"),
            icon: "check",
            tone: "good",
          },
          {
            label: "On tour",
            value: count("On tour"),
            icon: "globe",
            tone: "info",
          },
          {
            label: "Average rating",
            value: avgRating.toFixed(1),
            icon: "star",
          },
        ]}
      />
      {error && !open && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      <Toolbar>
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Search name, region or language"
        />
        <Segmented
          label="Filter by availability"
          value={status}
          onChange={setStatus}
          options={[
            { value: "all", label: "All", count: guides.length },
            ...STATUSES.map((s) => ({ value: s, label: s, count: count(s) })),
          ]}
        />
      </Toolbar>
      {loading ? (
        <LoadingState>Loading guides…</LoadingState>
      ) : !visible.length ? (
        <div className="portal-card">
          <EmptyState
            icon="shield"
            title={guides.length ? "No guides match" : "No guides yet"}
          >
            {guides.length
              ? "Try another search or availability filter."
              : "Add the hosts who lead your journeys."}
          </EmptyState>
        </div>
      ) : (
        <div className="portal-people-grid">
          {visible.map((guide) => (
            <article key={guide._id} className="portal-person-card">
              <header>
                <Avatar name={guide.name} size="lg" />
                <div>
                  <h3>{guide.name}</h3>
                  <p>
                    {guide.region || "Region not set"} ·{" "}
                    {guide.experienceYears} yrs
                  </p>
                </div>
                <span
                  className={`portal-status portal-status-${STATUS_CLASS[guide.status] || "confirmed"}`}
                >
                  <span className="portal-status-dot" aria-hidden="true" />
                  {guide.status}
                </span>
              </header>
              <Rating value={guide.rating} />
              <div>
                <p className="portal-mini-label">LANGUAGES</p>
                <div className="portal-chip-list">
                  {(guide.languages || []).map((language) => (
                    <span key={language} className="portal-chip">
                      {language}
                    </span>
                  ))}
                  {!guide.languages?.length && (
                    <span className="portal-muted">Not set</span>
                  )}
                </div>
              </div>
              <div>
                <p className="portal-mini-label">LEADS</p>
                <ul className="portal-person-list">
                  {(guide.tours || []).map((tour) => (
                    <li key={tour._id || tour}>
                      <Icon name="pin" size={13} />
                      {tour.title || "Journey"}
                    </li>
                  ))}
                  {!guide.tours?.length && (
                    <li className="portal-muted">No journeys assigned</li>
                  )}
                </ul>
              </div>
              <footer>
                {guide.email ? (
                  <a
                    className="portal-card-link"
                    href={`mailto:${guide.email}`}
                  >
                    <Icon name="mail" size={14} /> Email
                  </a>
                ) : (
                  <span className="portal-muted">No email saved</span>
                )}
                <div className="portal-row-actions">
                  <button
                    type="button"
                    className="portal-icon-btn"
                    aria-label={`Edit ${guide.name}`}
                    onClick={() => startEdit(guide)}
                  >
                    <Icon name="edit" size={15} />
                  </button>
                  <button
                    type="button"
                    className="portal-icon-btn is-danger"
                    aria-label={`Delete ${guide.name}`}
                    onClick={() => {
                      setRemoveError("");
                      setRemoving(guide);
                    }}
                  >
                    <Icon name="trash" size={15} />
                  </button>
                </div>
              </footer>
            </article>
          ))}
        </div>
      )}
      {open ? (
        <Modal
          title={editing ? "Edit guide" : "Add guide"}
          onClose={() => setOpen(false)}
          size="lg"
        >
          <form className="form-stack" onSubmit={submit}>
            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}
            <div className="form-row">
              <label className="field">
                Full name
                <input
                  required
                  minLength="2"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                />
              </label>
              <label className="field">
                Region
                <input
                  value={form.region}
                  onChange={(e) => set("region", e.target.value)}
                  placeholder="e.g. Alpine Europe"
                />
              </label>
            </div>
            <div className="form-row">
              <label className="field">
                Email address
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </label>
              <label className="field">
                Phone number
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </label>
            </div>
            <div className="form-row">
              <label className="field">
                Languages
                <input
                  value={form.languages}
                  onChange={(e) => set("languages", e.target.value)}
                  placeholder="English, French"
                />
                <small>Separate languages with commas.</small>
              </label>
              <div className="form-row">
                <label className="field">
                  Experience (years)
                  <input
                    type="number"
                    min="0"
                    max="70"
                    value={form.experienceYears}
                    onChange={(e) => set("experienceYears", e.target.value)}
                  />
                </label>
                <label className="field">
                  Availability
                  <select
                    value={form.status}
                    onChange={(e) => set("status", e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
            <fieldset className="portal-fieldset">
              <legend>Journeys this guide leads</legend>
              <div className="portal-option-grid">
                {tours.map((tour) => (
                  <label key={tour._id} className="portal-check">
                    <input
                      type="checkbox"
                      checked={form.tours.includes(tour._id)}
                      onChange={() => toggleTour(tour._id)}
                    />
                    <span>
                      <strong>{tour.title}</strong>
                      <small>{tour.region}</small>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="portal-modal-actions">
              <button
                type="button"
                className="portal-btn portal-btn-secondary"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button
                disabled={busy}
                type="submit"
                className="portal-btn portal-btn-primary"
              >
                {busy ? "Saving…" : editing ? "Save changes" : "Add guide"}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
      {removing && (
        <ConfirmDialog
          title="Remove this guide?"
          confirmLabel="Remove guide"
          busy={busy}
          error={removeError}
          onClose={() => setRemoving(null)}
          onConfirm={remove}
        >
          <strong>{removing.name}</strong> will be removed from your team.
          Departures they were assigned to will show as unassigned.
        </ConfirmDialog>
      )}
    </div>
  );
};

export default DashboardGuides;
