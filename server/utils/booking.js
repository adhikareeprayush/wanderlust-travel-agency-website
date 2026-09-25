import crypto from "node:crypto";
import mongoose from "mongoose";
import { Booking } from "../models/Booking.js";
import { Departure } from "../models/Departure.js";
import { Guest } from "../models/Guest.js";
import { AppError } from "./AppError.js";
import { logActivity } from "./activity.js";
import { bookingEmail, sendMail } from "./mailer.js";

export async function nextReference() {
  return "WL-" + crypto.randomBytes(6).toString("hex").toUpperCase();
}
export function hashAccess(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
export async function upsertGuest({
  name,
  email,
  phone,
  userId,
  segment,
  notes,
}) {
  const normalized = email.trim().toLowerCase();
  return Guest.findOneAndUpdate(
    { email: normalized },
    {
      $setOnInsert: {
        name,
        email: normalized,
        phone: phone || "",
        user: userId || null,
        segment: segment || "Traveller",
        notes: notes || "",
      },
    },
    { new: true, upsert: true, runValidators: true },
  );
}
export async function transitionBooking(id, status) {
  let result;
  let changed = false;
  await mongoose.connection.transaction(async (session) => {
    const booking = await Booking.findById(id).session(session);
    if (!booking) throw new AppError("Booking not found", 404);
    if (booking.status === status) {
      result = booking;
      return;
    }
    if (booking.status === "cancelled" && status === "confirmed")
      throw new AppError(
        "Move a cancelled request to pending before confirming it.",
        409,
      );
    const departure = await Departure.findById(booking.departure).session(
      session,
    );
    if (!departure) throw new AppError("Departure not found", 404);
    if (status === "confirmed") {
      if (
        departure.status === "cancelled" ||
        new Date(departure.startDate) <= new Date()
      )
        throw new AppError("This departure is no longer available.", 409);
      const reserved = await Departure.findOneAndUpdate(
        {
          _id: departure._id,
          status: { $ne: "cancelled" },
          $expr: {
            $lte: [{ $add: ["$bookedCount", booking.partySize] }, "$seats"],
          },
        },
        { $inc: { bookedCount: booking.partySize } },
        { new: true, session },
      );
      if (!reserved)
        throw new AppError(
          "There aren’t enough places. Keep this request on the waitlist or choose another departure.",
          409,
        );
      if (reserved.bookedCount >= reserved.seats) {
        reserved.status = "full";
        await reserved.save({ session });
      }
      if (booking.guest)
        await Guest.updateOne(
          { _id: booking.guest },
          { $inc: { lifetimeValue: booking.total } },
          { session },
        );
    } else if (booking.status === "confirmed") {
      departure.bookedCount = Math.max(
        0,
        departure.bookedCount - booking.partySize,
      );
      if (departure.status === "full") departure.status = "open";
      await departure.save({ session });
      if (booking.guest)
        await Guest.updateOne(
          { _id: booking.guest },
          { $inc: { lifetimeValue: -booking.total } },
          { session },
        );
    }
    booking.status = status;
    changed = true;
    await booking.save({ session });
    result = booking;
  });
  if (!changed)
    return Booking.findById(id)
      .populate("tour", "title slug")
      .populate("departure");
  await logActivity("booking", `Booking ${result.reference}: ${result.status}`);
  const populated = await Booking.findById(id)
    .populate("tour", "title slug")
    .populate("departure");
  if (populated?.departure)
    await sendMail({
      to: populated.email,
      ...bookingEmail(
        populated,
        populated.tour?.title || "your journey",
        new Date(populated.departure.startDate).toISOString().slice(0, 10),
      ),
    });
  return populated;
}
// Requests remain pending until the team reviews them; they are not unpaid holds.
export async function expireUnpaidHolds() {
  return 0;
}
// Retained for older internal imports; payment is never inferred by this function.
export async function confirmBooking(booking) {
  return transitionBooking(booking._id, "confirmed");
}
