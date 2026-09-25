import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../../api/client";
import {
  Card,
  LoadingState,
  PageHeader,
  Segmented,
} from "../../components/dashboard/DashboardUi";
import Icon from "../../components/Icon";
import SettingsTeam from "./SettingsTeam";

const ROLES = [
  {
    role: "Customer",
    access: "Requests journeys, sees and cancels their own pending requests.",
  },
  {
    role: "Staff",
    access:
      "Works only in the areas an administrator grants: bookings, journeys, departures, enquiries, travellers, guides, suppliers or analytics.",
  },
  {
    role: "Administrator",
    access:
      "Every area, plus creating staff accounts, managing their access and service settings.",
  },
];
const FLOW = [
  {
    icon: "mail",
    title: "Request received",
    copy: "The traveller chooses a date and group size. The server calculates the total.",
  },
  {
    icon: "search",
    title: "Team review",
    copy: "Your team checks availability. Requests stay pending until reviewed.",
  },
  {
    icon: "check",
    title: "Places confirmed",
    copy: "Confirming reserves seats. Requests for more places than remain join the waitlist.",
  },
];
const SHORTCUTS = [
  { to: "/dashboard/tours", icon: "pin", label: "Prices & published journeys" },
  { to: "/dashboard/departures", icon: "calendar", label: "Dates & capacity" },
  { to: "/dashboard/guides", icon: "shield", label: "Guide team" },
  { to: "/dashboard/enquiries", icon: "mail", label: "Newsletter subscribers" },
];

function StatusRow({ icon, title, detail, state, tone }) {
  return (
    <li className="portal-setting-row">
      <span className="portal-settings-icon" aria-hidden="true">
        <Icon name={icon} size={17} />
      </span>
      <div>
        <strong>{title}</strong>
        <p>{detail}</p>
      </div>
      <span className={`portal-status portal-status-${tone}`}>
        <span className="portal-status-dot" aria-hidden="true" />
        {state}
      </span>
    </li>
  );
}

function ServiceSettings() {
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api("/settings")
      .then((d) => setSettings(d.settings))
      .catch((e) => setError(e.message));
  }, []);
  if (error)
    return (
      <p className="error-message" role="alert">
        {error}
      </p>
    );
  if (!settings) return <LoadingState>Loading settings…</LoadingState>;
  return (
    <div className="portal-settings-grid">
      <div className="portal-stack">
        <Card title="Service status" subtitle="Read from the server configuration">
          <ul className="portal-setting-list">
            <StatusRow
              icon="calendar"
              title="Booking mode"
              detail="Travellers send requests; your team confirms places."
              state="Request & confirm"
              tone="confirmed"
            />
            <StatusRow
              icon="dollar"
              title="Online payments"
              detail="No card details are collected. Trip totals are estimates until arranged with the traveller."
              state={settings.onlinePayments ? "On" : "Off"}
              tone="closed"
            />
            <StatusRow
              icon="mail"
              title="Email delivery"
              detail={
                settings.emailConfigured
                  ? "Acknowledgements and status updates are sent through your mail provider."
                  : "Messages are saved and previewed in server logs. Add SMTP credentials to send real emails."
              }
              state={settings.emailConfigured ? "Connected" : "Preview only"}
              tone={settings.emailConfigured ? "confirmed" : "pending"}
            />
            <StatusRow
              icon="globe"
              title="Currency"
              detail="Prices and totals across the website and workspace."
              state={settings.currency}
              tone="in_progress"
            />
          </ul>
        </Card>
        <Card
          title="How a booking moves"
          subtitle="The same flow for website and team-created requests"
        >
          <ol className="portal-flow">
            {FLOW.map((step, index) => (
              <li key={step.title}>
                <span aria-hidden="true">
                  <Icon name={step.icon} size={17} />
                </span>
                <small>STEP {index + 1}</small>
                <strong>{step.title}</strong>
                <p>{step.copy}</p>
              </li>
            ))}
          </ol>
        </Card>
      </div>
      <div className="portal-stack">
        <Card
          title="Roles & access"
          subtitle="Checked by the server on every protected request"
        >
          <ul className="portal-role-list">
            {ROLES.map((item) => (
              <li key={item.role}>
                <strong>{item.role}</strong>
                <p>{item.access}</p>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Where to change things">
          <div className="portal-quick-links">
            {SHORTCUTS.map((item) => (
              <Link key={item.to} to={item.to}>
                <span>
                  <Icon name={item.icon} size={17} /> {item.label}
                </span>
                <Icon name="arrow" size={16} />
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardSettings() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "service" ? "service" : "team";
  const [adding, setAdding] = useState(false);
  return (
    <div className="portal-page">
      <PageHeader
        eyebrow="ADMINISTRATION"
        title="Team & settings"
        accent="in your hands."
        description="Create staff accounts, decide which areas each person can work in, and review how the service is configured."
        actions={
          tab === "team" && (
            <button
              type="button"
              className="portal-btn portal-btn-primary"
              onClick={() => setAdding(true)}
            >
              <Icon name="plus" size={15} /> Add team member
            </button>
          )
        }
      />
      <Segmented
        label="Settings section"
        value={tab}
        onChange={(value) => setParams({ tab: value }, { replace: true })}
        options={[
          { value: "team", label: "Team & permissions" },
          { value: "service", label: "Service" },
        ]}
      />
      {tab === "team" ? (
        <SettingsTeam adding={adding} onAddingChange={setAdding} />
      ) : (
        <ServiceSettings />
      )}
    </div>
  );
}
