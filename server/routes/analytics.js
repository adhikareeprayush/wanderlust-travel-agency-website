import { Router } from "express";
import { Booking } from "../models/Booking.js";
import { Departure } from "../models/Departure.js";
import { Enquiry } from "../models/Enquiry.js";
import { Activity } from "../models/Activity.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { protect, requireStaff } from "../middleware/auth.js";
import { expireUnpaidHolds } from "../utils/booking.js";

const router = Router();
router.use(protect, requireStaff);

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

    const monthMap = new Map();
    for (const booking of confirmed) {
      const d = new Date(booking.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const label = d.toLocaleString("en-US", { month: "short" });
      if (!monthMap.has(key))
        monthMap.set(key, { month: label, amount: 0, sort: d });
      monthMap.get(key).amount += booking.total;
    }
    const revenueByMonth = [...monthMap.values()]
      .sort((a, b) => a.sort - b.sort)
      .slice(-6)
      .map(({ month, amount }) => ({ month, amount }));

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
    const sourceTotal =
      sourceCounts.website +
        sourceCounts.agent +
        sourceCounts.repeat +
        sourceCounts.social +
        sourceCounts.staff || 1;
    const leadSources = [
      {
        name: "Website & team",
        value: Math.round(
          ((sourceCounts.website + sourceCounts.staff) / sourceTotal) * 100,
        ),
        color: "#315c46",
      },
      {
        name: "Agent referral",
        value: Math.round((sourceCounts.agent / sourceTotal) * 100),
        color: "#86a875",
      },
      {
        name: "Repeat guest",
        value: Math.round((sourceCounts.repeat / sourceTotal) * 100),
        color: "#c5d5ac",
      },
      {
        name: "Social campaign",
        value: Math.round((sourceCounts.social / sourceTotal) * 100),
        color: "#aebfab",
      },
    ];

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

    res.json({
      stats,
      revenueByMonth: revenueByMonth.length
        ? revenueByMonth
        : [{ month: "Now", amount: revenue30 }],
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
