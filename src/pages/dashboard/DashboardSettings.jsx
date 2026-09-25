import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { Card } from "../../components/dashboard/DashboardUi";
import Icon from "../../components/Icon";
export default function DashboardSettings() {
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api("/settings")
      .then((d) => setSettings(d.settings))
      .catch((e) => setError(e.message));
  }, []);
  return (
    <div className="portal-page space-y-6">
      <div>
        <p className="eyebrow">YOUR AGENCY</p>
        <h2 className="font-volkhov text-4xl mt-2">Service settings</h2>
        <p className="status-note mt-3">
          A clear view of how your booking service and team access are
          configured.
        </p>
      </div>
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      {!settings && !error ? (
        <p role="status">Loading settings…</p>
      ) : (
        settings && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card title="Booking process" subtitle="Team confirmation">
              <span className="portal-settings-icon">
                <Icon name="calendar" size={18} />
              </span>
              <p className="status-note">
                Travellers submit requests. Your team checks availability and
                confirms places from Bookings. Pending requests stay open until
                reviewed. No online payments are collected.
              </p>
            </Card>
            <Card
              title="Email delivery"
              subtitle={
                settings.emailConfigured
                  ? "SMTP connected"
                  : "Local email preview"
              }
            >
              <span className="portal-settings-icon">
                <Icon name="mail" size={18} />
              </span>
              <p className="status-note">
                {settings.emailConfigured
                  ? "Request acknowledgements and booking status updates are sent through the configured mail provider."
                  : "Email delivery is not configured. Requests and enquiries are saved, but messages are previewed in server logs. Set SMTP credentials before sending customer emails."}
              </p>
            </Card>
            <Card
              title="Prices & availability"
              subtitle={`Currency: ${settings.currency}`}
            >
              <span className="portal-settings-icon">
                <Icon name="globe" size={18} />
              </span>
              <p className="status-note">
                Edit prices and published journeys in Tours. Add dates and
                capacity in Departures. Customer totals are calculated by the
                server from the current tour price.
              </p>
            </Card>
            <Card
              title="Accounts & access"
              subtitle="Customer, staff and administrator roles"
            >
              <span className="portal-settings-icon">
                <Icon name="shield" size={18} />
              </span>
              <p className="status-note">
                Customers see their own booking requests. Staff can manage
                travel operations. Access is checked by the server on every
                protected request.
              </p>
            </Card>
          </div>
        )
      )}
    </div>
  );
}
