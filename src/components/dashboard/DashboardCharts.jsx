const money = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

export const RevenueAreaChart = ({ data }) => {
  const series = data?.length ? data : [{ month: "—", amount: 0 }];
  const values = series.map((item) => item.amount);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = series.map((item, index) => {
    const x = (index / Math.max(series.length - 1, 1)) * 100;
    const y = 82 - ((item.amount - min) / range) * 58;
    return { ...item, x, y };
  });
  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const areaPath = `${linePath} L 100 92 L 0 92 Z`;

  return (
    <div className="w-full">
      <div className="w-full overflow-hidden rounded-md bg-[#f5f8f2]">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="block h-72 w-full"
          role="img"
          aria-label="Confirmed trip value chart"
        >
          <defs>
            <linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#6f9b75" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#6f9b75" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {[24, 40, 56, 72, 88].map((y) => (
            <line
              key={y}
              x1="0"
              x2="100"
              y1={y}
              y2={y}
              stroke="#233d33"
              strokeOpacity="0.06"
              strokeWidth="0.6"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <path d={areaPath} fill="url(#revenueFill)" />
          <path
            d={linePath}
            fill="none"
            stroke="#285547"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.8"
            vectorEffect="non-scaling-stroke"
          />
          {points.map((point) => (
            <circle
              key={point.month}
              cx={point.x}
              cy={point.y}
              r="2.2"
              fill="#285547"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
      </div>
      <div className="mt-4 grid w-full grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {series.map((item) => (
          <div key={item.month} className="rounded-md bg-[#f5f8f2] p-3">
            <p className="text-xs font-medium text-[#75806f]">{item.month}</p>
            <p className="mt-1 text-sm font-medium text-[#233d33]">
              {money(item.amount)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const DestinationBars = ({ data }) => {
  const rows = data?.length ? data : [];
  const max = Math.max(...rows.map((item) => item.share), 1);

  if (!rows.length)
    return (
      <p className="portal-empty-copy">
        Destination insights will appear after a journey is confirmed.
      </p>
    );

  return (
    <div className="space-y-4">
      {rows.map((item) => (
        <div key={item.name}>
          <div className="mb-2 flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-[#233d33]">{item.name}</span>
            <span className="text-[#75806f]">
              {item.share}% · {item.bookings} bookings
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#e7eee4]">
            <div
              className="h-full rounded-full bg-[#82aa79]"
              style={{ width: `${Math.round((item.share / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export const CapacityDonut = ({ value = 0, label, detail }) => {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;

  return (
    <div className="flex items-center gap-4 rounded-md bg-[#f5f8f2] p-4">
      <div className="relative h-28 w-28 shrink-0">
        <svg viewBox="0 0 100 100" className="-rotate-90">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#233d33"
            strokeOpacity="0.08"
            strokeWidth="10"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#285547"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeWidth="10"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-volkhov text-2xl font-normal text-[#233d33]">
          {value}%
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-[#75806f]">{label}</p>
        <p className="mt-1 text-base font-normal leading-relaxed text-[#233d33]">
          {detail}
        </p>
      </div>
    </div>
  );
};

export const LeadSourceDonut = ({ data }) => {
  const series = data?.length ? data : [];
  const total = series.reduce((sum, item) => sum + item.value, 0) || 1;
  let running = 0;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="grid gap-5 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center">
      <div className="relative mx-auto h-40 w-40">
        <svg viewBox="0 0 100 100" className="-rotate-90">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#233d33"
            strokeOpacity="0.06"
            strokeWidth="12"
          />
          {series.map((item) => {
            const length = (item.value / total) * circumference;
            const dashOffset = -running;
            running += length;
            return (
              <circle
                key={item.name}
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={item.color}
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                strokeWidth="12"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="font-volkhov text-3xl font-normal text-[#233d33]">
            {series.some((item) => item.value) ? "100%" : "0%"}
          </p>
          <p className="text-xs font-medium text-[#75806f]">sources</p>
        </div>
      </div>
      <div className="space-y-3">
        {series.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm font-medium text-[#233d33]">
                {item.name}
              </span>
            </div>
            <span className="text-sm text-[#75806f]">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
