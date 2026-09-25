import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { Card, StatCard } from "../../components/dashboard/DashboardUi";
import {
  DestinationBars,
  LeadSourceDonut,
  RevenueAreaChart,
  CapacityDonut,
} from "../../components/dashboard/DashboardCharts";
import Icon from "../../components/Icon";
export default function DashboardAnalytics() {
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
        <p role="status">Loading analytics…</p>
      </div>
    );
  return (
    <div className="portal-page">
      <div className="portal-page-intro">
        <div>
          <p className="eyebrow">INSIGHT FOR WHAT COMES NEXT</p>
          <h2>
            Know where you stand.
            <br />
            <em>See where you're going.</em>
          </h2>
          <p>
            Confirmed trip value, traveller interest and available places from
            your live records.
          </p>
        </div>
        <Link className="portal-outline-action" to="/dashboard/bookings">
          Review requests <Icon name="arrow" size={16} />
        </Link>
      </div>
      <div className="portal-stats-grid">
        {data.stats.map((stat) => (
          <StatCard key={stat.id} {...stat} />
        ))}
      </div>
      <div className="portal-analytics-grid">
        <Card
          title="Confirmed trip value"
          subtitle="Value of confirmed journeys over time"
          className="portal-chart-card portal-wide"
        >
          <RevenueAreaChart data={data.revenueByMonth} />
        </Card>
        <Card title="Capacity" subtitle="Places on upcoming departures">
          <CapacityDonut
            value={data.occupancy}
            label="Average tour fill"
            detail="Based on confirmed places against total capacity."
          />
        </Card>
        <Card
          title="Popular destinations"
          subtitle="Share of confirmed bookings"
        >
          <DestinationBars data={data.topDestinations} />
        </Card>
        <Card
          title="Where travellers find us"
          subtitle="Source mix of confirmed bookings"
        >
          <LeadSourceDonut data={data.leadSources} />
        </Card>
      </div>
      <div className="portal-analytics-note">
        <Icon name="shield" size={19} />
        <p>
          Trip value reflects confirmed bookings. It is an estimate of booked
          travel, not a record of payments collected.
        </p>
      </div>
    </div>
  );
}
