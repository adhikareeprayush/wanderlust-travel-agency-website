import { useLayoutEffect, useRef, useState } from "react";

const money = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);

const compactMoney = (value) =>
  value >= 1000
    ? `$${new Intl.NumberFormat("en-US", {
        maximumFractionDigits: value >= 10000 ? 0 : 1,
      }).format(value / 1000)}K`
    : `$${Math.round(value)}`;

const percent = (part, total) =>
  total ? Math.round((part / total) * 100) : 0;

// Series colours follow the entity, never its rank.
const SOURCE_COLORS = {
  website: "var(--viz-1)",
  agent: "var(--viz-2)",
  repeat: "var(--viz-3)",
  social: "var(--viz-4)",
};
const STATUS_META = {
  pending: { label: "Pending", color: "var(--status-pending)" },
  waitlist: { label: "Waitlist", color: "var(--status-waitlist)" },
  confirmed: { label: "Confirmed", color: "var(--status-confirmed)" },
  cancelled: { label: "Cancelled", color: "var(--status-cancelled)" },
};

function useWidth() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.floor(entry.contentRect.width)),
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, width];
}

function niceTicks(max, count = 4) {
  if (max <= 0) return [0, 1000, 2000, 3000, 4000].slice(0, count + 1);
  const rough = max / count;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step =
    [1, 2, 2.5, 5, 10].find((m) => m * magnitude >= rough) * magnitude;
  return Array.from({ length: count + 1 }, (_, i) => i * step);
}

function Tooltip({ tip }) {
  if (!tip) return null;
  return (
    <div
      className="viz-tooltip"
      role="presentation"
      style={{ left: tip.x, top: tip.y }}
    >
      <strong>{tip.value}</strong>
      <span>{tip.label}</span>
      {tip.detail && <small>{tip.detail}</small>}
    </div>
  );
}

/** Monthly totals as columns: discrete periods, honest with sparse data. */
export const RevenueColumnChart = ({ data, height = 250 }) => {
  const [ref, width] = useWidth();
  const [active, setActive] = useState(null);
  const series = data?.length ? data : [];
  const margin = { top: 26, right: 4, bottom: 34, left: 46 };
  const plotW = Math.max(width - margin.left - margin.right, 0);
  const plotH = height - margin.top - margin.bottom;
  const ticks = niceTicks(Math.max(...series.map((d) => d.amount), 0));
  const top = ticks[ticks.length - 1] || 1;
  const band = series.length ? plotW / series.length : 0;
  const barW = Math.min(28, band * 0.5);
  const y = (value) => margin.top + plotH - (value / top) * plotH;
  const peak = series.reduce(
    (best, d, i) => (d.amount > (series[best]?.amount ?? 0) ? i : best),
    0,
  );

  const show = (i) => {
    const d = series[i];
    setActive({
      index: i,
      x: margin.left + band * i + band / 2,
      y: Math.min(y(d.amount), margin.top + plotH - 8) - 10,
      value: money(d.amount),
      label: `${d.month} ${d.year ?? ""}`.trim(),
      detail: `${d.bookings ?? 0} confirmed ${d.bookings === 1 ? "booking" : "bookings"}`,
    });
  };

  return (
    <div className="viz-frame" ref={ref} onPointerLeave={() => setActive(null)}>
      {width > 0 && (
        <svg
          width={width}
          height={height}
          role="img"
          aria-label="Confirmed trip value by month"
        >
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                className="viz-grid"
                x1={margin.left}
                x2={width - margin.right}
                y1={y(tick)}
                y2={y(tick)}
              />
              <text
                className="viz-axis-label"
                x={margin.left - 10}
                y={y(tick)}
                dy="0.32em"
                textAnchor="end"
              >
                {compactMoney(tick)}
              </text>
            </g>
          ))}
          {series.map((d, i) => {
            const cx = margin.left + band * i + band / 2;
            const h = Math.max((d.amount / top) * plotH, 0);
            const r = Math.min(4, h);
            const x0 = cx - barW / 2;
            const yb = margin.top + plotH;
            const path =
              h > 0
                ? `M${x0},${yb} V${yb - h + r} Q${x0},${yb - h} ${x0 + r},${yb - h} H${x0 + barW - r} Q${x0 + barW},${yb - h} ${x0 + barW},${yb - h + r} V${yb} Z`
                : "";
            const isActive = active?.index === i;
            return (
              <g
                key={`${d.month}-${d.year}`}
                tabIndex={0}
                className="viz-hit"
                aria-label={`${d.month} ${d.year ?? ""}: ${money(d.amount)}`}
                onPointerEnter={() => show(i)}
                onFocus={() => show(i)}
                onBlur={() => setActive(null)}
              >
                <rect
                  x={margin.left + band * i}
                  y={margin.top}
                  width={band}
                  height={plotH}
                  className={`viz-band${isActive ? " is-active" : ""}`}
                />
                {h > 0 ? (
                  <path
                    d={path}
                    className="viz-column"
                    style={{ opacity: active && !isActive ? 0.55 : 1 }}
                  />
                ) : (
                  <line
                    className="viz-zero"
                    x1={x0}
                    x2={x0 + barW}
                    y1={yb - 1}
                    y2={yb - 1}
                  />
                )}
                {i === peak && d.amount > 0 && !active && (
                  <text
                    className="viz-value-label"
                    x={cx}
                    y={yb - h - 9}
                    textAnchor="middle"
                  >
                    {compactMoney(d.amount)}
                  </text>
                )}
                <text
                  className="viz-axis-label"
                  x={cx}
                  y={height - 12}
                  textAnchor="middle"
                >
                  {d.month}
                </text>
              </g>
            );
          })}
          <line
            className="viz-baseline"
            x1={margin.left}
            x2={width - margin.right}
            y1={margin.top + plotH}
            y2={margin.top + plotH}
          />
        </svg>
      )}
      <Tooltip tip={active} />
      <table className="sr-only">
        <caption>Confirmed trip value by month</caption>
        <thead>
          <tr>
            <th>Month</th>
            <th>Trip value</th>
            <th>Confirmed bookings</th>
          </tr>
        </thead>
        <tbody>
          {series.map((d) => (
            <tr key={`${d.month}-${d.year}`}>
              <td>
                {d.month} {d.year}
              </td>
              <td>{money(d.amount)}</td>
              <td>{d.bookings ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
// Kept for existing imports.
export const RevenueAreaChart = RevenueColumnChart;

/** Headline figures that sit above the trend chart. */
export const TrendSummary = ({ data }) => {
  const total = (data || []).reduce((sum, d) => sum + d.amount, 0);
  const bookings = (data || []).reduce((sum, d) => sum + (d.bookings || 0), 0);
  const best = (data || []).reduce(
    (top, d) => (d.amount > (top?.amount ?? 0) ? d : top),
    null,
  );
  return (
    <div className="viz-summary">
      <div>
        <span>Last {data?.length || 0} months</span>
        <strong>{money(total)}</strong>
      </div>
      <div>
        <span>Confirmed bookings</span>
        <strong>{bookings}</strong>
      </div>
      <div>
        <span>Strongest month</span>
        <strong>{best ? `${best.month} ${best.year ?? ""}` : "—"}</strong>
      </div>
    </div>
  );
};

/** Part-to-whole of booking requests by status: one stacked bar + legend. */
export const PipelineBar = ({ data }) => {
  const [active, setActive] = useState(null);
  const rows = data?.length ? data : [];
  const total = rows.reduce((sum, d) => sum + d.count, 0);
  if (!total)
    return (
      <p className="portal-empty-copy">
        Booking requests will be summarised here.
      </p>
    );
  return (
    <div className="viz-pipeline">
      <div className="viz-pipeline-head">
        <strong>{total}</strong>
        <span>booking requests on record</span>
      </div>
      <div className="viz-stack" role="img" aria-label="Requests by status">
        {rows
          .filter((d) => d.count > 0)
          .map((d) => (
            <span
              key={d.status}
              tabIndex={0}
              className={active && active !== d.status ? "is-dim" : ""}
              style={{
                flexGrow: d.count,
                background: STATUS_META[d.status]?.color,
              }}
              aria-label={`${STATUS_META[d.status]?.label}: ${d.count}`}
              onPointerEnter={() => setActive(d.status)}
              onPointerLeave={() => setActive(null)}
              onFocus={() => setActive(d.status)}
              onBlur={() => setActive(null)}
            />
          ))}
      </div>
      <ul className="viz-legend-list">
        {rows.map((d) => (
          <li
            key={d.status}
            className={active && active !== d.status ? "is-dim" : ""}
          >
            <span
              className="viz-swatch"
              style={{ background: STATUS_META[d.status]?.color }}
            />
            <span>{STATUS_META[d.status]?.label || d.status}</span>
            <strong>{d.count}</strong>
            <small>{percent(d.count, total)}%</small>
          </li>
        ))}
      </ul>
    </div>
  );
};

/** A single fill meter: value arc on a lighter step of the same hue. */
export const CapacityDonut = ({ value = 0, label, detail, booked, total }) => {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const fill = Math.min(Math.max(value, 0), 100);
  const dash = (fill / 100) * circumference;
  return (
    <div className="viz-gauge">
      <div className="viz-gauge-ring">
        <svg viewBox="0 0 110 110" role="img" aria-label={`${fill}% filled`}>
          <circle className="viz-gauge-track" cx="55" cy="55" r={radius} />
          {fill > 0 && (
            <circle
              className="viz-gauge-value"
              cx="55"
              cy="55"
              r={radius}
              strokeDasharray={`${dash} ${circumference}`}
              transform="rotate(-90 55 55)"
            />
          )}
        </svg>
        <div>
          <strong>{fill}%</strong>
          <span>filled</span>
        </div>
      </div>
      <div className="viz-gauge-copy">
        <p>{label}</p>
        {total !== undefined && (
          <strong>
            {booked} of {total} places
          </strong>
        )}
        <span>{detail}</span>
      </div>
    </div>
  );
};

/** Upcoming departures, each as a capacity meter. */
export const DepartureFillList = ({ data }) => {
  const rows = data?.length ? data : [];
  if (!rows.length)
    return (
      <p className="portal-empty-copy">
        Add a future departure to track its capacity.
      </p>
    );
  return (
    <ul className="viz-meter-list">
      {rows.map((d) => {
        const date = new Date(d.startDate);
        const fill = percent(d.booked, d.seats);
        return (
          <li key={d.id}>
            <span className="viz-date-chip">
              <strong>{date.getDate()}</strong>
              {date.toLocaleString("en-GB", { month: "short" })}
            </span>
            <div>
              <p>
                <span>{d.tour}</span>
                <small>
                  {d.booked}/{d.seats} · {fill}%
                </small>
              </p>
              <span
                className="viz-meter"
                role="meter"
                aria-valuemin={0}
                aria-valuemax={d.seats}
                aria-valuenow={d.booked}
                aria-label={`${d.tour} capacity`}
              >
                <span style={{ width: `${Math.max(fill, fill ? 3 : 0)}%` }} />
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

/** One series, so one colour; value sits at the bar tip. */
export const DestinationBars = ({ data }) => {
  const rows = data?.length ? data : [];
  const max = Math.max(...rows.map((item) => item.bookings), 1);
  if (!rows.length)
    return (
      <p className="portal-empty-copy">
        Destination insights will appear after a journey is confirmed.
      </p>
    );
  return (
    <ul className="viz-bar-list">
      {rows.map((item) => (
        <li key={item.name}>
          <span className="viz-bar-name">{item.name}</span>
          <span className="viz-bar-track">
            <span style={{ width: `${(item.bookings / max) * 100}%` }} />
          </span>
          <span className="viz-bar-value">
            <strong>{item.bookings}</strong> · {item.share}%
          </span>
        </li>
      ))}
    </ul>
  );
};

/** Part-to-whole for four sources: a donut with surface gaps and a legend. */
export const LeadSourceDonut = ({ data }) => {
  const [active, setActive] = useState(null);
  const series = data?.length ? data : [];
  const total = series.reduce((sum, item) => sum + (item.count ?? 0), 0);
  const radius = 42;
  const stroke = 13;
  const circumference = 2 * Math.PI * radius;
  const visible = series.filter((item) => item.count > 0);
  const gap = visible.length > 1 ? 3 : 0;
  let running = 0;
  const current = series.find((item) => item.key === active);
  return (
    <div className="viz-donut">
      <div className="viz-donut-ring">
        <svg viewBox="0 0 110 110" role="img" aria-label="Booking sources">
          <circle
            className="viz-gauge-track"
            cx="55"
            cy="55"
            r={radius}
            style={{ strokeWidth: stroke }}
          />
          {total > 0 &&
            visible.map((item) => {
              const length = (item.count / total) * circumference;
              const offset = running;
              running += length;
              return (
                <circle
                  key={item.key}
                  cx="55"
                  cy="55"
                  r={radius}
                  fill="none"
                  stroke={SOURCE_COLORS[item.key]}
                  strokeWidth={stroke}
                  strokeDasharray={`${Math.max(length - gap, 0.5)} ${circumference}`}
                  strokeDashoffset={-offset}
                  transform="rotate(-90 55 55)"
                  className={`viz-donut-segment${active && active !== item.key ? " is-dim" : ""}`}
                  onPointerEnter={() => setActive(item.key)}
                  onPointerLeave={() => setActive(null)}
                />
              );
            })}
        </svg>
        <div>
          <strong>{current ? current.count : total}</strong>
          <span>
            {current
              ? current.name
              : total === 1
                ? "booking"
                : "confirmed bookings"}
          </span>
        </div>
      </div>
      <ul className="viz-legend-list">
        {series.map((item) => (
          <li
            key={item.key}
            tabIndex={0}
            className={active && active !== item.key ? "is-dim" : ""}
            onPointerEnter={() => setActive(item.key)}
            onPointerLeave={() => setActive(null)}
            onFocus={() => setActive(item.key)}
            onBlur={() => setActive(null)}
          >
            <span
              className="viz-swatch"
              style={{ background: SOURCE_COLORS[item.key] }}
            />
            <span>{item.name}</span>
            <strong>{item.count ?? 0}</strong>
            <small>{percent(item.count ?? 0, total)}%</small>
          </li>
        ))}
      </ul>
    </div>
  );
};
