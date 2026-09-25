import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import {
  Card,
  StatCard,
  StatusBadge,
} from "../../components/dashboard/DashboardUi";
import {
  CapacityDonut,
  RevenueAreaChart,
} from "../../components/dashboard/DashboardCharts";
import { formatDate, formatMoney } from "../../lib/tourImages";
import Icon from "../../components/Icon";
export default function DashboardHome() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api("/analytics/overview")
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);
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
        <p role="status">Loading your workspace…</p>
      </div>
    );
  const pending =
    data.stats.find((stat) => stat.id === "bookings")?.value || "0";
  return (
    <div className="portal-page portal-overview">
      <section className="portal-overview-hero">
        <div className="portal-overview-photo" />
        <div className="portal-overview-copy">
          <p className="portal-overline">YOUR WORKSPACE · WANDERLUST TRAVEL</p>
          <h2>
            Good journeys start
            <br />
            with great care.
          </h2>
          <p>
            A clear view of the requests, people and plans that matter today.
          </p>
          <Link to="/dashboard/bookings" className="portal-hero-button">
            Review booking requests <Icon name="arrow" size={17} />
          </Link>
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
        >
          <RevenueAreaChart data={data.revenueByMonth} />
        </Card>
        <Card
          title="Capacity health"
          subtitle="Places across future departures"
        >
          <CapacityDonut
            value={data.occupancy}
            label="Average departure fill"
            detail="Calculated from confirmed places on upcoming departures."
          />
          <div className="portal-card-divider" />
          <p className="portal-mini-label">QUICK ACCESS</p>
          <div className="portal-quick-links">
            <Link to="/dashboard/departures">
              <span>
                <Icon name="calendar" size={17} /> Manage departure dates
              </span>
              <Icon name="arrow" size={16} />
            </Link>
            <Link to="/dashboard/enquiries">
              <span>
                <Icon name="mail" size={17} /> Read new enquiries
              </span>
              <Icon name="arrow" size={16} />
            </Link>
            <Link to="/dashboard/tours">
              <span>
                <Icon name="pin" size={17} /> Update journeys
              </span>
              <Icon name="arrow" size={16} />
            </Link>
          </div>
        </Card>
      </div>
      <div className="portal-overview-grid portal-overview-lower">
        <Card
          title="Recent booking requests"
          subtitle="The latest conversations about new journeys"
          action={
            <Link className="portal-card-link" to="/dashboard/bookings">
              View all <Icon name="arrow" size={16} />
            </Link>
          }
        >
          <div className="portal-table-wrap">
            <table className="portal-data-table">
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
                      <span>{booking.reference}</span>
                    </td>
                    <td>{booking.tour?.title || "Journey"}</td>
                    <td>{formatDate(booking.departure?.startDate)}</td>
                    <td>{formatMoney(booking.total)}</td>
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
