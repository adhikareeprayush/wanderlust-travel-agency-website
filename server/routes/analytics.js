import { Router } from "express";
import { Booking } from "../models/Booking.js";
import { Departure } from "../models/Departure.js";
import { Enquiry } from "../models/Enquiry.js";
import { Activity } from "../models/Activity.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { protect, requirePermission } from "../middleware/auth.js";
import { expireUnpaidHolds } from "../utils/booking.js";

const router = Router();
router.use(protect, requirePermission("analytics"));
const TREND_MONTHS = 6;

router.get(
  "/overview",
  asyncHandler(async (_req, res) => {
    await expireUnpaidHolds();
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const prevSince = new Date(since);
    prevSince.setDate(prevSince.getDate() - 30);

    const [
      confirmed,
      recentConfirmed,
      prevConfirmed,
      pendingCount,
      departures,
      enquiries,
      activity,
    ] = await Promise.all([
      Booking.find({ status: "confirmed" }).populate("tour", "title region"),
      Booking.find({ status: "confirmed", createdAt: { $gte: since } }),
      Booking.find({
        status: "confirmed",
        createdAt: { $gte: prevSince, $lt: since },
      }),
      Booking.countDocuments({ status: { $in: ["pending", "waitlist"] } }),
      Departure.find({
        status: { $ne: "cancelled" },
        startDate: { $gt: new Date() },
      }),
      Enquiry.find(),
      Activity.find().sort({ createdAt: -1 }).limit(8),
    ]);

    const revenue30 = recentConfirmed.reduce((sum, b) => sum + b.total, 0);
    const prevRevenue = prevConfirmed.reduce((sum, b) => sum + b.total, 0);
    const revenueChange =
      prevRevenue === 0
        ? revenue30 > 0
          ? 100
          : 0
        : ((revenue30 - prevRevenue) / prevRevenue) * 100;

    const seats = departures.reduce((sum, d) => sum + d.seats, 0);
    const booked = departures.reduce((sum, d) => sum + d.bookedCount, 0);
    const occupancy = seats ? Math.round((booked / seats) * 100) : 0;

    // A continuous, zero-filled window so the chart has a real time axis.
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    monthStart.setMonth(monthStart.getMonth() - (TREND_MONTHS - 1));
    const revenueByMonth = Array.from({ length: TREND_MONTHS }, (_, i) => {
      const d = new Date(monthStart);
      d.setMonth(d.getMonth() + i);
      return {
        key: `${d.getFullYear()}-${d.getMonth()}`,
        month: d.toLocaleString("en-US", { month: "short" }),
        year: d.getFullYear(),
        amount: 0,
        bookings: 0,
      };
    });
    const monthIndex = new Map(revenueByMonth.map((m, i) => [m.key, i]));
    for (const booking of confirmed) {
      const d = new Date(booking.createdAt);
      const index = monthIndex.get(`${d.getFullYear()}-${d.getMonth()}`);
      if (index === undefined) continue;
      const slot = revenueByMonth[index];
      slot.amount += booking.total;
      slot.bookings += 1;
    }

    const destMap = new Map();
    for (const booking of confirmed) {
      const region = booking.tour?.region || "Other";
      if (!destMap.has(region))
        destMap.set(region, { name: region, bookings: 0 });
      destMap.get(region).bookings += 1;
    }
    const destTotal = confirmed.length || 1;
    const topDestinations = [...destMap.values()]
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5)
      .map((d) => ({
        ...d,
        share: Math.round((d.bookings / destTotal) * 100),
      }));

    const sourceCounts = {
      website: 0,
      agent: 0,
      repeat: 0,
      social: 0,
      staff: 0,
    };
    for (const booking of confirmed) {
      sourceCounts[booking.source] = (sourceCounts[booking.source] || 0) + 1;
    }
    const leadSources = [
      {
        key: "website",
        name: "Website & team",
        count: sourceCounts.website + sourceCounts.staff,
      },
      { key: "agent", name: "Agent referral", count: sourceCounts.agent },
      { key: "repeat", name: "Repeat guest", count: sourceCounts.repeat },
      { key: "social", name: "Social campaign", count: sourceCounts.social },
    ];
    const sourceTotal = leadSources.reduce((sum, item) => sum + item.count, 0);
    for (const item of leadSources)
      item.value = sourceTotal
        ? Math.round((item.count / sourceTotal) * 100)
        : 0;

    const stats = [
      {
        id: "revenue",
        label: "Confirmed value (30d)",
        value: `$${Math.round(revenue30).toLocaleString("en-US")}`,
        change: `${revenueChange >= 0 ? "+" : ""}${revenueChange.toFixed(1)}%`,
        positive: revenueChange >= 0,
        hint: "vs previous month",
      },
      {
        id: "bookings",
        label: "Requests to review",
        value: String(pendingCount),
        change: `${recentConfirmed.length} confirmed`,
        positive: true,
        hint: "pending & waitlisted",
      },
      {
        id: "occupancy",
        label: "Avg. tour fill",
        value: `${occupancy}%`,
        change: `${booked}/${seats} seats`,
        positive: occupancy >= 70,
        hint: "capacity utilization",
      },
      {
        id: "nps",
        label: "Open enquiries",
        value: String(enquiries.filter((e) => e.status === "new").length),
        change: `${enquiries.length} total`,
        positive: true,
        hint: "contact inbox",
      },
    ];

    const recentBookings = await Booking.find()
      .populate("tour", "title")
      .populate("departure", "startDate")
      .sort({ createdAt: -1 })
      .limit(8);

    const statusCounts = await Booking.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const pipeline = ["pending", "waitlist", "confirmed", "cancelled"].map(
      (status) => ({
        status,
        count: statusCounts.find((row) => row._id === status)?.count || 0,
      }),
    );

    const upcomingDepartures = [...departures]
      .sort((a, b) => a.startDate - b.startDate)
      .slice(0, 6);
    await Departure.populate(upcomingDepartures, {
      path: "tour",
      select: "title",
    });

    res.json({
      stats,
      revenueByMonth: revenueByMonth.map(({ key: _key, ...month }) => month),
      pipeline,
      upcomingDepartures: upcomingDepartures.map((d) => ({
        id: d._id,
        tour: d.tour?.title || "Journey",
        startDate: d.startDate,
        seats: d.seats,
        booked: d.bookedCount,
      })),
      seats: { booked, total: seats },
      topDestinations,
      leadSources,
      occupancy,
      activity: activity.map((a) => ({
        id: a._id,
        type: a.type,
        message: a.message,
        time: a.createdAt,
      })),
      recentBookings,
      openTasks: departures
        .filter((d) => d.notes)
        .slice(0, 4)
        .map((d) => ({
          id: d._id,
          label: d.notes,
          tour: d.tour,
          meta: new Date(d.startDate).toISOString().slice(0, 10),
        })),
    });
  }),
);

export default router;
