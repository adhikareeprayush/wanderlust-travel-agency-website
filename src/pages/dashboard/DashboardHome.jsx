import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import {
  Card,
  LoadingState,
  StatCard,
  StatusBadge,
} from "../../components/dashboard/DashboardUi";
import {
  CapacityDonut,
  RevenueColumnChart,
  TrendSummary,
} from "../../components/dashboard/DashboardCharts";
import { formatDate, formatMoney } from "../../lib/tourImages";
import { PERMISSIONS } from "../../lib/permissions";
import { useAuth } from "../../context/useAuth";
import Icon from "../../components/Icon";

// Staff without analytics access still get a useful starting point.
function StaffWelcome({ user, can }) {
  const areas = PERMISSIONS.filter(
    (item) => item.key !== "analytics" && can(item.key),
  );
  return (
    <div className="portal-page portal-overview">
      <section className="portal-overview-hero">
        <div className="portal-overview-photo" />
        <div className="portal-overview-copy">
          <p className="portal-overline">YOUR WORKSPACE · WANDERLUST TRAVEL</p>
          <h2>
            Welcome back,
            <br />
            <em>{user?.name?.split(" ")[0] || "there"}.</em>
          </h2>
          <p>Everything you look after for our travellers, in one place.</p>
        </div>
      </section>
      <div className="portal-section-title">
        <div>
          <p className="eyebrow">YOUR AREAS</p>
          <h2>Where to next?</h2>
        </div>
      </div>
      {areas.length ? (
        <div className="portal-area-grid">
          {areas.map((item) => (
            <Link
              key={item.key}
              to={`/dashboard/${item.key}`}
              className="portal-area-card"
            >
              <span className="portal-settings-icon" aria-hidden="true">
                <Icon name={item.icon} size={18} />
              </span>
              <strong>{item.label}</strong>
              <p>{item.description}</p>
              <Icon name="arrow" size={16} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="portal-card">
          <p className="portal-empty-copy" style={{ padding: 24 }}>
            No workspace areas have been assigned to you yet. Ask an
            administrator to set up your permissions.
          </p>
        </div>
      )}
    </div>
  );
}

export default function DashboardHome() {
  const { user, can } = useAuth();
  const hasAnalytics = can("analytics");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!hasAnalytics) return;
    api("/analytics/overview")
      .then(setData)
      .catch((e) => setError(e.message));
  }, [hasAnalytics]);
  if (!hasAnalytics) return <StaffWelcome user={user} can={can} />;
  if (error)
    return (
      <div className="portal-page">
        <p role="alert" className="error-message">
          {error}
        </p>
      </div>
    );
  if (!data)
    return (
      <div className="portal-page">
        <LoadingState>Loading your workspace…</LoadingState>
      </div>
    );
  const pending =
    data.stats.find((stat) => stat.id === "bookings")?.value || "0";
  const quickLinks = [
    {
      to: "/dashboard/departures",
      icon: "calendar",
      label: "Manage departure dates",
      permission: "departures",
    },
    {
      to: "/dashboard/enquiries",
      icon: "mail",
      label: "Read new enquiries",
      permission: "enquiries",
    },
    {
      to: "/dashboard/tours",
      icon: "pin",
      label: "Update journeys",
      permission: "tours",
    },
  ].filter((item) => can(item.permission));
  return (
    <div className="portal-page portal-overview">
      <section className="portal-overview-hero">
        <div className="portal-overview-photo" />
        <div className="portal-overview-copy">
          <p className="portal-overline">YOUR WORKSPACE · WANDERLUST TRAVEL</p>
          <h2>
            Good journeys start
            <br />
            <em>with great care.</em>
          </h2>
          <p>
            A clear view of the requests, people and plans that matter today.
          </p>
          {can("bookings") && (
            <Link to="/dashboard/bookings" className="portal-hero-button">
              Review booking requests <Icon name="arrow" size={17} />
            </Link>
          )}
        </div>
        <div className="portal-overview-callout">
          <span>REQUESTS TO REVIEW</span>
          <strong>{pending}</strong>
          <small>Every traveller starts somewhere.</small>
        </div>
      </section>
      <div className="portal-section-title">
        <div>
          <p className="eyebrow">THE BIG PICTURE</p>
          <h2>At a glance</h2>
        </div>
        <span>Live from your workspace</span>
      </div>
      <div className="portal-stats-grid">
        {data.stats.map((stat) => (
          <StatCard key={stat.id} {...stat} />
        ))}
      </div>
      <div className="portal-overview-grid">
        <Card
          title="Confirmed trip value"
          subtitle="Monthly value of confirmed journeys"
          className="portal-chart-card"
          action={
            <Link className="portal-card-link" to="/dashboard/analytics">
              Full analytics <Icon name="arrow" size={16} />
            </Link>
          }
        >
          <TrendSummary data={data.revenueByMonth} />
          <RevenueColumnChart data={data.revenueByMonth} />
        </Card>
        <Card
          title="Capacity health"
          subtitle="Places across future departures"
        >
          <CapacityDonut
            value={data.occupancy}
            booked={data.seats?.booked}
            total={data.seats?.total}
            label="Average departure fill"
            detail="Confirmed places on upcoming departures."
          />
          {quickLinks.length > 0 && (
            <>
              <div className="portal-card-divider" />
              <p className="portal-mini-label">QUICK ACCESS</p>
              <div className="portal-quick-links">
                {quickLinks.map((item) => (
                  <Link key={item.to} to={item.to}>
                    <span>
                      <Icon name={item.icon} size={17} /> {item.label}
                    </span>
                    <Icon name="arrow" size={16} />
                  </Link>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>
      <div className="portal-overview-grid portal-overview-lower">
        <Card
          title="Recent booking requests"
          subtitle="The latest conversations about new journeys"
          action={
            can("bookings") && (
              <Link className="portal-card-link" to="/dashboard/bookings">
                View all <Icon name="arrow" size={16} />
              </Link>
            )
          }
        >
          <div className="portal-table-wrap">
            <table className="portal-data-table portal-recent-table">
              <thead>
                <tr>
                  <th>TRAVELLER</th>
                  <th>JOURNEY</th>
                  <th>DEPARTURE</th>
                  <th>VALUE</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {data.recentBookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>
                      <strong>{booking.guestName}</strong>
                      <small>{booking.reference}</small>
                    </td>
                    <td>{booking.tour?.title || "Journey"}</td>
                    <td className="is-num">
                      {formatDate(booking.departure?.startDate)}
                    </td>
                    <td className="is-num">{formatMoney(booking.total)}</td>
                    <td>
                      <StatusBadge status={booking.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!data.recentBookings.length && (
              <p className="portal-empty-copy">
                Booking requests will appear here.
              </p>
            )}
          </div>
        </Card>
        <Card title="Latest activity" subtitle="A timeline of recent updates">
          <div className="portal-activity-list">
            {data.activity.map((activity) => (
              <div key={activity.id} className="portal-activity-item">
                <span className="portal-activity-pin" />
                <div>
                  <p>{activity.message}</p>
                  <small>{formatDate(activity.time)}</small>
                </div>
              </div>
            ))}
            {!data.activity.length && (
              <p className="portal-empty-copy">
                Your team's activity will appear here.
              </p>
            )}
          </div>
          {data.openTasks?.length > 0 && (
            <div className="portal-task-block">
              <p className="portal-mini-label">UPCOMING NOTES</p>
              {data.openTasks.map((task) => (
                <div key={task.id}>
                  <Icon name="clock" size={15} />
                  <span>{task.label}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
