import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/useAuth";
import { formatDate, formatMoney } from "../lib/tourImages";
import Icon from "./Icon";
export default function BookingPanel({ tour, departures = [] }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const open = departures.filter(
    (d) => d.status !== "cancelled" && new Date(d.startDate) > new Date(),
  );
  const [form, setForm] = useState({
    guestName: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    partySize: 2,
    notes: "",
    departureId: open[0]?._id || "",
  });
  const [requestKey] = useState(() => crypto.randomUUID());
  const [trackingToken] = useState(
    () => crypto.randomUUID() + crypto.randomUUID(),
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const selected = open.find((d) => d._id === form.departureId);
  const remaining = selected
    ? Math.max(selected.seats - selected.bookedCount, 0)
    : 0;
  const total = tour.basePrice * Number(form.partySize || 1);
  const change = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const data = await api("/bookings", {
        method: "POST",
        body: {
          ...form,
          email: user?.email || form.email,
          partySize: Number(form.partySize),
          requestKey,
          trackingToken,
        },
      });
      sessionStorage.setItem(
        `booking-access:${data.booking._id}`,
        trackingToken,
      );
      navigate(`/booking/${data.booking._id}/success`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <aside className="booking-panel">
      <p className="eyebrow">MAKE ROOM FOR YOUR NEXT CHAPTER</p>
      <h2>Your journey starts here.</h2>
      <p className="booking-price">
        From <strong>{formatMoney(tour.basePrice)}</strong> / person
      </p>
      {!open.length ? (
        <div className="success-message">
          New dates are being planned.
          <br />
          <Link className="inline-link" to={`/contact?tour=${tour.slug}`}>
            Ask about this journey <Icon size={16} />
          </Link>
        </div>
      ) : (
        <>
          <p className="availability-note">
            <Icon name="users" size={15} />
            {remaining > 0
              ? `${remaining} places available on this departure`
              : "This departure is full. Join the waitlist."}
          </p>
          <form className="form-stack" onSubmit={submit}>
            <label className="field">
              Departure date
              <select
                name="departureId"
                value={form.departureId}
                onChange={change}
                required
              >
                {open.map((d) => (
                  <option key={d._id} value={d._id}>
                    {formatDate(d.startDate)} ·{" "}
                    {Math.max(d.seats - d.bookedCount, 0)} places
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Number of travellers
              <input
                type="number"
                name="partySize"
                value={form.partySize}
                onChange={change}
                min="1"
                max="30"
                step="1"
                required
              />
            </label>
            <label className="field">
              Full name
              <input
                name="guestName"
                autoComplete="name"
                value={form.guestName}
                onChange={change}
                minLength="2"
                maxLength="100"
                required
                placeholder="Your full name"
              />
            </label>
            <label className="field">
              Email address
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={user?.email || form.email}
                readOnly={Boolean(user)}
                onChange={change}
                maxLength="254"
                required
                placeholder="you@example.com"
              />
            </label>
            <label className="field">
              Phone <small>Optional</small>
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                maxLength="30"
                value={form.phone}
                onChange={change}
                placeholder="Include your country code"
              />
            </label>
            <label className="field">
              Anything we should know? <small>Optional</small>
              <textarea
                name="notes"
                maxLength="2000"
                value={form.notes}
                onChange={change}
                placeholder="A special occasion, dietary needs, or a question…"
              />
            </label>
            <div className="booking-total">
              <span>Estimated trip total</span>
              <strong>{formatMoney(total)}</strong>
            </div>
            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}
            <button className="button" disabled={busy}>
              {busy
                ? "Sending your request…"
                : remaining < Number(form.partySize)
                  ? "Join the waitlist"
                  : "Request this journey"}
              <Icon name="arrow" size={17} />
            </button>
            <p className="booking-disclaimer">
              No payment is collected. Our team will review availability and
              confirm your request. Places are reserved only after confirmation.
            </p>
          </form>
        </>
      )}
    </aside>
  );
}
