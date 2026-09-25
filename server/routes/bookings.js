import { Router } from "express";
import { z } from "zod";
import { Booking } from "../models/Booking.js";
import { Departure } from "../models/Departure.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { optionalAuth, protect, requireStaff } from "../middleware/auth.js";
import { AppError } from "../utils/AppError.js";
import {
  hashAccess,
  nextReference,
  transitionBooking,
  upsertGuest,
} from "../utils/booking.js";
import { logActivity } from "../utils/activity.js";
import { bookingEmail, sendMail } from "../utils/mailer.js";
import { literalSearch } from "../utils/validation.js";
const router = Router();
const populate = (query) =>
  query
    .populate("tour", "title slug imageKey basePrice region durationDays")
    .populate("departure", "startDate seats bookedCount status");
const isStaff = (req) => ["staff", "admin"].includes(req.user?.role);
async function ownedBooking(req) {
  const booking = await Booking.findById(req.params.id).select("+trackingHash");
  if (!booking) throw new AppError("Booking not found", 404);
  const owner =
    req.user && booking.user?.toString() === req.user._id.toString();
  const token = req.get("X-Booking-Token");
  const guestAccess =
    token && token.length <= 128 && booking.trackingHash === hashAccess(token);
  if (!isStaff(req) && !owner && !guestAccess)
    throw new AppError(
      "Sign in to the account that made this request, or use your original browser session.",
      401,
    );
  return booking;
}
router.get(
  "/me",
  protect,
  asyncHandler(async (req, res) =>
    res.json({
      bookings: await populate(Booking.find({ user: req.user._id })).sort({
        createdAt: -1,
      }),
    }),
  ),
);
router.get(
  "/",
  protect,
  requireStaff,
  asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.status && req.query.status !== "all")
      filter.status = req.query.status;
    if (req.query.q) {
      const search = literalSearch(req.query.q);
      filter.$or = [
        { reference: search },
        { guestName: search },
        { email: search },
      ];
    }
    res.json({
      bookings: await populate(Booking.find(filter))
        .sort({ createdAt: -1 })
        .limit(500),
    });
  }),
);
router.get(
  "/:id",
  optionalAuth,
  asyncHandler(async (req, res) => {
    await ownedBooking(req);
    res.json({ booking: await populate(Booking.findById(req.params.id)) });
  }),
);
const schema = z.object({
  departureId: z.string().regex(/^[a-f\d]{24}$/i, "Choose a valid departure."),
  guestName: z.string().trim().min(2, "Please enter your full name.").max(100),
  email: z.string().trim().toLowerCase().email().max(254),
  phone: z.string().trim().max(30).optional(),
  partySize: z.coerce
    .number()
    .int("Travellers must be a whole number.")
    .min(1)
    .max(30),
  notes: z.string().trim().max(2000).optional(),
  requestKey: z.string().uuid(),
  trackingToken: z.string().min(64).max(128),
});
router.post(
  "/",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const data = schema.parse(req.body);
    if (req.user && !isStaff(req) && data.email !== req.user.email)
      throw new AppError(
        "Please use the email address associated with your account.",
        400,
      );
    const existing = await Booking.findOne({
      requestKey: data.requestKey,
    }).select("+trackingHash");
    if (existing) {
      if (existing.trackingHash !== hashAccess(data.trackingToken))
        throw new AppError("Request key already used.", 409);
      return res.json({
        booking: await populate(Booking.findById(existing._id)),
      });
    }
    const departure = await Departure.findById(data.departureId).populate(
      "tour",
    );
    if (
      !departure ||
      !departure.tour?.published ||
      departure.status === "cancelled" ||
      new Date(departure.startDate) <= new Date()
    )
      throw new AppError(
        "This departure is no longer available. Please choose a future date.",
        400,
      );
    const guest = await upsertGuest({
      name: data.guestName,
      email: data.email,
      phone: data.phone,
      userId: req.user?._id,
    });
    const booking = await Booking.create({
      reference: await nextReference(),
      requestKey: data.requestKey,
      trackingHash: hashAccess(data.trackingToken),
      user: req.user?._id || null,
      guest: guest._id,
      guestName: data.guestName,
      email: data.email,
      phone: data.phone || "",
      tour: departure.tour._id,
      departure: departure._id,
      partySize: data.partySize,
      total:
        (Math.round(departure.tour.basePrice * 100) * data.partySize) / 100,
      status:
        departure.seats - departure.bookedCount < data.partySize
          ? "waitlist"
          : "pending",
      notes: data.notes || "",
      source: isStaff(req) ? "staff" : "website",
    });
    await logActivity(
      "booking",
      `New request ${booking.reference} for ${departure.tour.title}`,
    );
    await sendMail({
      to: booking.email,
      ...bookingEmail(
        booking,
        departure.tour.title,
        new Date(departure.startDate).toISOString().slice(0, 10),
      ),
    });
    res
      .status(201)
      .json({ booking: await populate(Booking.findById(booking._id)) });
  }),
);
router.patch(
  "/:id/status",
  protect,
  requireStaff,
  asyncHandler(async (req, res) => {
    const { status } = z
      .object({
        status: z.enum(["pending", "confirmed", "waitlist", "cancelled"]),
      })
      .parse(req.body);
    res.json({ booking: await transitionBooking(req.params.id, status) });
  }),
);
router.post(
  "/:id/claim",
  protect,
  asyncHandler(async (req, res) => {
    const booking = await ownedBooking(req);
    if (
      booking.email !== req.user.email ||
      (booking.user && booking.user.toString() !== req.user._id.toString())
    )
      throw new AppError("This request belongs to a different traveller.", 403);
    const claimed = await Booking.findOneAndUpdate(
      { _id: booking._id, $or: [{ user: null }, { user: req.user._id }] },
      { $set: { user: req.user._id } },
      { new: true },
    );
    if (!claimed)
      throw new AppError(
        "This request is already linked to another account.",
        409,
      );
    res.json({ ok: true });
  }),
);
router.post(
  "/:id/cancel",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const booking = await ownedBooking(req);
    if (!["pending", "waitlist", "cancelled"].includes(booking.status))
      throw new AppError(
        "Please contact our team to discuss cancellation of a confirmed journey.",
        409,
      );
    // A concurrent staff confirmation must win over customer self-cancellation.
    const updated = await Booking.findOneAndUpdate(
      {
        _id: booking._id,
        status: { $in: ["pending", "waitlist", "cancelled"] },
      },
      { $set: { status: "cancelled" } },
      { new: true },
    );
    if (!updated)
      throw new AppError(
        "The request has just been confirmed. Please contact our team.",
        409,
      );
    res.json({ booking: await populate(Booking.findById(updated._id)) });
  }),
);
export default router;
