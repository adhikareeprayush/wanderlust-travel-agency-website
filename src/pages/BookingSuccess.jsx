import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import { formatDate, formatMoney } from "../lib/tourImages";
import { StatusBadge } from "../components/dashboard/DashboardUi";
import Brand from "../components/Brand";
import Icon from "../components/Icon";
export default function BookingSuccess() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api(`/bookings/${id}`)
      .then((d) => setBooking(d.booking))
      .catch((e) => setError(e.message));
  }, [id]);
  return (
    <div className="receipt">
      <Brand />
      <div className="receipt-icon" style={{ marginTop: 40 }}>
        <Icon name="check" size={30} />
      </div>
      <p className="eyebrow">YOUR NEXT CHAPTER</p>
      <h1>
        {booking?.status === "confirmed"
          ? "Your journey is confirmed."
          : booking?.status === "waitlist"
            ? "You’re on the waitlist."
            : "Your request is with us."}
      </h1>
      {error ? (
        <p role="alert" className="error-message">
          {error} Please sign in to view a booking linked to your account, or
          use the same browser session in which you submitted your request.
        </p>
      ) : !booking ? (
        <p role="status">Loading your request…</p>
      ) : (
        <>
          <p>
            {booking.status === "confirmed"
              ? "Our team has confirmed your places. Check the trip details below."
              : booking.status === "waitlist"
                ? "We’ll review your request when places become available. No places have been reserved yet."
                : "Our team will review availability and contact you to confirm the details. No payment has been collected and no places are reserved until confirmation."}
          </p>
          <div className="receipt-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 15,
              }}
            >
              <span className="eyebrow">{booking.reference}</span>
              <StatusBadge status={booking.status} />
            </div>
            <h2>{booking.tour?.title}</h2>
            <p>
              {formatDate(booking.departure?.startDate)} · {booking.partySize}{" "}
              travellers
            </p>
            <p>
              Estimated total: <strong>{formatMoney(booking.total)}</strong>
            </p>
            <p style={{ marginTop: 18 }}>Contact email: {booking.email}</p>
            <p>
              Keep your reference number for any questions about this journey.
            </p>
          </div>
        </>
      )}
      <div className="receipt-actions">
        <Link to="/account/bookings" className="button">
          My trips <Icon size={17} />
        </Link>
        <Link to="/packages" className="button button-outline">
          Keep exploring
        </Link>
      </div>
    </div>
  );
}
