import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import {
  ConfirmDialog,
  LoadingState,
  StatusBadge,
  SummaryStrip,
} from "../components/dashboard/DashboardUi";
import Icon from "../components/Icon";
import { formatDate, formatMoney, resolveTourImage } from "../lib/tourImages";
export default function AccountBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [cancelling, setCancelling] = useState(null);
  const [cancelError, setCancelError] = useState("");
  const load = useCallback(async () => {
    try {
      setError("");
      const data = await api("/bookings/me");
      setBookings(data.bookings);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  async function cancel() {
    setBusy(cancelling._id);
    setCancelError("");
    try {
      await api(`/bookings/${cancelling._id}/cancel`, { method: "POST" });
      setCancelling(null);
      await load();
    } catch (e) {
      setCancelError(e.message);
    } finally {
      setBusy("");
    }
  }
  const active = bookings.filter((b) => b.status !== "cancelled");
  return (
    <div className="account-page">
      <div className="account-page-header">
        <div>
          <p className="eyebrow">YOUR NEXT CHAPTERS</p>
          <h1>My journeys</h1>
          <p>
            Follow your booking requests here. Our team confirms availability
            before reserving your places.
          </p>
        </div>
      </div>
      {!loading && bookings.length > 0 && (
        <SummaryStrip
          items={[
            {
              label: "Confirmed",
              value: bookings.filter((b) => b.status === "confirmed").length,
              icon: "check",
              tone: "good",
            },
            {
              label: "Awaiting confirmation",
              value: bookings.filter((b) =>
                ["pending", "waitlist"].includes(b.status),
              ).length,
              icon: "clock",
              tone: "warn",
            },
            {
              label: "Estimated trip value",
              value: formatMoney(active.reduce((sum, b) => sum + b.total, 0)),
              icon: "dollar",
            },
          ]}
        />
      )}
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      {loading ? (
        <LoadingState>Loading your journeys…</LoadingState>
      ) : !bookings.length ? (
        <div className="account-empty">
          <Icon name="globe" size={35} />
          <h2>Your story is still unfolding.</h2>
          <p>Find a journey that speaks to you and request your place.</p>
          <Link className="button" to="/packages">
            Explore journeys <Icon name="arrow" size={16} />
          </Link>
        </div>
      ) : (
        bookings.map((b) => (
          <article key={b._id} className="account-journey-card">
            <img
              src={resolveTourImage(b.tour?.imageKey, b.tour?.slug, 500)}
              alt={b.tour?.title || "Journey"}
            />
            <div className="account-journey-body">
              <div className="account-journey-top">
                <h2>{b.tour?.title || "Your journey"}</h2>
                <StatusBadge status={b.status} />
              </div>
              <p className="account-journey-ref">REQUEST {b.reference}</p>
              <div className="account-journey-meta">
                <span>
                  <Icon name="calendar" size={14} />
                  {formatDate(b.departure?.startDate)}
                </span>
                <span>
                  <Icon name="users" size={14} />
                  {b.partySize} travellers
                </span>
                <span>
                  <Icon name="globe" size={14} />
                  {formatMoney(b.total)} estimated
                </span>
              </div>
              <div className="account-journey-actions">
                <Link to={`/booking/${b._id}/success`}>View details</Link>
                {["pending", "waitlist"].includes(b.status) && (
                  <button
                    disabled={busy === b._id}
                    onClick={() => {
                      setCancelError("");
                      setCancelling(b);
                    }}
                  >
                    {busy === b._id ? "Cancelling…" : "Cancel request"}
                  </button>
                )}
                {b.status === "confirmed" && (
                  <Link to="/contact">Contact us about this trip</Link>
                )}
              </div>
            </div>
          </article>
        ))
      )}
      {cancelling && (
        <ConfirmDialog
          title="Cancel this request?"
          confirmLabel="Cancel request"
          busy={busy === cancelling._id}
          error={cancelError}
          onClose={() => setCancelling(null)}
          onConfirm={cancel}
        >
          Your request <strong>{cancelling.reference}</strong> for{" "}
          {cancelling.tour?.title || "this journey"} will be cancelled. You
          can always send a new request later.
        </ConfirmDialog>
      )}
    </div>
  );
}
