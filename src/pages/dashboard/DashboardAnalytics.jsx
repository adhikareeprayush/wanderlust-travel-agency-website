import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import {
  Card,
  LoadingState,
  PageHeader,
  StatCard,
} from "../../components/dashboard/DashboardUi";
import {
  CapacityDonut,
  DepartureFillList,
  DestinationBars,
  LeadSourceDonut,
  PipelineBar,
  RevenueColumnChart,
  TrendSummary,
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
        <LoadingState>Loading analytics…</LoadingState>
      </div>
    );
  return (
    <div className="portal-page">
      <PageHeader
        eyebrow="INSIGHT FOR WHAT COMES NEXT"
        title="Know where you stand."
        accent="See where you're going."
        description="Confirmed trip value, traveller interest and available places from your live records."
        actions={
          <Link
            className="portal-btn portal-btn-secondary"
            to="/dashboard/bookings"
          >
            Review requests <Icon name="arrow" size={15} />
          </Link>
        }
      />
      <div className="portal-stats-grid">
        {data.stats.map((stat) => (
          <StatCard key={stat.id} {...stat} />
        ))}
      </div>
      <div className="portal-analytics-grid">
        <Card
          title="Confirmed trip value"
          subtitle="Value of journeys confirmed each month"
        >
          <TrendSummary data={data.revenueByMonth} />
          <RevenueColumnChart data={data.revenueByMonth} height={300} />
        </Card>
        <div className="portal-stack">
          <Card
            title="Request pipeline"
            subtitle="Every booking request by its current status"
            action={
              <Link className="portal-card-link" to="/dashboard/bookings">
                Open <Icon name="arrow" size={15} />
              </Link>
            }
          >
            <PipelineBar data={data.pipeline} />
          </Card>
          <Card title="Capacity" subtitle="All places on upcoming departures">
            <CapacityDonut
              value={data.occupancy}
              booked={data.seats?.booked}
              total={data.seats?.total}
              label="Average tour fill"
              detail="Pending requests do not hold seats."
            />
          </Card>
        </div>
        <Card
          title="Next departures"
          subtitle="Confirmed places on the six soonest dates"
          action={
            <Link className="portal-card-link" to="/dashboard/departures">
              All dates <Icon name="arrow" size={15} />
            </Link>
          }
        >
          <DepartureFillList data={data.upcomingDepartures} />
        </Card>
        <div className="portal-stack">
          <Card
            title="Popular destinations"
            subtitle="Confirmed bookings by region"
          >
            <DestinationBars data={data.topDestinations} />
          </Card>
          <Card
            title="Where travellers find us"
            subtitle="Source of confirmed bookings"
          >
            <LeadSourceDonut data={data.leadSources} />
          </Card>
        </div>
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
