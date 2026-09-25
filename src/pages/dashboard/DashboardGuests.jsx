import { useEffect, useMemo, useState } from "react";
import { api } from "../../api/client";
import {
  Avatar,
  Card,
  ConfirmDialog,
  EmptyState,
  LoadingState,
  PageHeader,
  SearchField,
  SummaryStrip,
  Toolbar,
} from "../../components/dashboard/DashboardUi";
import Modal from "../../components/dashboard/Modal";
import Icon from "../../components/Icon";
import { formatMoney } from "../../lib/tourImages";

const empty = {
  name: "",
  email: "",
  phone: "",
  segment: "Traveler",
  notes: "",
  nextTrip: "",
};
const segments = [
  "Traveler",
  "Repeat guest",
  "Family",
  "Couple",
  "Solo",
  "Adventure",
  "Group",
];

const DashboardGuests = () => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [segment, setSegment] = useState("all");
  const [removing, setRemoving] = useState(null);
  const [removeError, setRemoveError] = useState("");

  const load = () =>
    api("/guests")
      .then((d) => setGuests(d.guests))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  useEffect(() => {
    load();
  }, []);

  const segmentOptions = useMemo(
    () => [...new Set(guests.map((g) => g.segment).filter(Boolean))].sort(),
    [guests],
  );
  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return guests.filter(
      (g) =>
        (segment === "all" || g.segment === segment) &&
        (!term ||
          [g.name, g.email, g.phone, g.nextTrip, g.notes]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(term))),
    );
  }, [guests, query, segment]);

  const startEdit = (guest) => {
    setError("");
    setEditing(guest);
    setForm(
      guest
        ? {
            name: guest.name,
            email: guest.email,
            phone: guest.phone || "",
            segment: guest.segment || "Traveler",
            notes: guest.notes || "",
            nextTrip: guest.nextTrip || "",
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
      if (editing)
        await api(`/guests/${editing._id}`, { method: "PATCH", body: form });
      else await api("/guests", { method: "POST", body: form });
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
      await api(`/guests/${removing._id}`, { method: "DELETE" });
      setRemoving(null);
      load();
    } catch (err) {
      setRemoveError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }));
  const totalValue = guests.reduce((sum, g) => sum + (g.lifetimeValue || 0), 0);

  return (
    <div className="portal-page">
      <PageHeader
        eyebrow="PEOPLE BEHIND THE JOURNEYS"
        title="Travellers"
        accent="we know by name."
        description="Contact details, future plans and confirmed trip value. Profiles are created automatically from booking requests."
        actions={
          <button
            type="button"
            onClick={() => startEdit(null)}
            className="portal-btn portal-btn-primary"
          >
            <Icon name="plus" size={15} /> Add traveller
          </button>
        }
      />
      <SummaryStrip
        items={[
          { label: "Traveller profiles", value: guests.length, icon: "users" },
          {
            label: "With a trip planned",
            value: guests.filter((g) => g.nextTrip).length,
            icon: "calendar",
            tone: "good",
          },
          {
            label: "Repeat guests",
            value: guests.filter((g) => g.segment === "Repeat guest").length,
            icon: "heart",
            tone: "info",
          },
          {
            label: "Confirmed trip value",
            value: formatMoney(totalValue),
            icon: "dollar",
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
          placeholder="Search name, email, trip or notes"
        />
        <select
          aria-label="Filter by segment"
          className="portal-select"
          value={segment}
          onChange={(e) => setSegment(e.target.value)}
        >
          <option value="all">All segments</option>
          {segmentOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </Toolbar>
      <Card className="portal-table-card">
        {loading ? (
          <LoadingState>Loading travellers…</LoadingState>
        ) : !visible.length ? (
          <EmptyState
            icon="users"
            title={guests.length ? "No travellers match" : "No travellers yet"}
          >
            {guests.length
              ? "Try another search or segment."
              : "Travellers are added when they request a journey, or you can add one yourself."}
          </EmptyState>
        ) : (
          <div className="portal-table-wrap">
            <table className="portal-data-table is-responsive">
              <thead>
                <tr>
                  <th>Traveller</th>
                  <th>Segment</th>
                  <th>Next journey</th>
                  <th>Team notes</th>
                  <th>Trip value</th>
                  <th className="is-actions">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((guest) => (
                  <tr key={guest._id}>
                    <td data-label="Traveller">
                      <div className="portal-cell-person">
                        <Avatar name={guest.name} size="sm" />
                        <div>
                          <strong>{guest.name}</strong>
                          <small>
                            <a href={`mailto:${guest.email}`}>{guest.email}</a>
                            {guest.phone && ` · ${guest.phone}`}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td data-label="Segment">
                      <span className="portal-chip">
                        {guest.segment || "Traveler"}
                      </span>
                    </td>
                    <td data-label="Next journey">
                      {guest.nextTrip || (
                        <span className="portal-muted">Nothing planned</span>
                      )}
                    </td>
                    <td data-label="Team notes" className="portal-cell-notes">
                      {guest.notes || <span className="portal-muted">—</span>}
                    </td>
                    <td data-label="Trip value" className="is-num">
                      <strong>{formatMoney(guest.lifetimeValue)}</strong>
                    </td>
                    <td className="is-actions">
                      <div className="portal-row-actions">
                        <button
                          type="button"
                          className="portal-icon-btn"
                          aria-label={`Edit ${guest.name}`}
                          onClick={() => startEdit(guest)}
                        >
                          <Icon name="edit" size={15} />
                        </button>
                        <button
                          type="button"
                          className="portal-icon-btn is-danger"
                          aria-label={`Delete ${guest.name}`}
                          onClick={() => {
                            setRemoveError("");
                            setRemoving(guest);
                          }}
                        >
                          <Icon name="trash" size={15} />
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
      {open ? (
        <Modal
          title={editing ? "Edit traveller" : "Add traveller"}
          description="Trip value is calculated from confirmed bookings."
          onClose={() => setOpen(false)}
        >
          <form className="form-stack" onSubmit={submit}>
            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}
            <label className="field">
              Full name
              <input
                required
                minLength="2"
                autoComplete="off"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </label>
            <div className="form-row">
              <label className="field">
                Email address
                <input
                  type="email"
                  required
                  autoComplete="off"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </label>
              <label className="field">
                Phone number
                <input
                  type="tel"
                  autoComplete="off"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="Including country code"
                />
              </label>
            </div>
            <div className="form-row">
              <label className="field">
                Segment
                <input
                  list="guest-segments"
                  value={form.segment}
                  onChange={(e) => set("segment", e.target.value)}
                />
                <datalist id="guest-segments">
                  {segments.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
              </label>
              <label className="field">
                Next journey
                <input
                  value={form.nextTrip}
                  onChange={(e) => set("nextTrip", e.target.value)}
                  placeholder="e.g. Kyoto Heritage"
                />
              </label>
            </div>
            <label className="field">
              Team notes
              <textarea
                rows="3"
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="Preferences, dietary needs, follow-ups…"
              />
            </label>
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
                {busy ? "Saving…" : editing ? "Save changes" : "Add traveller"}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
      {removing && (
        <ConfirmDialog
          title="Remove this traveller?"
          confirmLabel="Remove traveller"
          busy={busy}
          error={removeError}
          onClose={() => setRemoving(null)}
          onConfirm={remove}
        >
          <strong>{removing.name}</strong>'s profile will be removed from the
          directory. Their booking requests are kept.
        </ConfirmDialog>
      )}
    </div>
  );
};

export default DashboardGuests;
