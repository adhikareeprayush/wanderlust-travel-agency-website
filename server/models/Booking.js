import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    requestKey: { type: String, unique: true, sparse: true, select: false },
    trackingHash: { type: String, select: false },
    reference: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guest",
      default: null,
    },
    guestName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    tour: { type: mongoose.Schema.Types.ObjectId, ref: "Tour", required: true },
    departure: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Departure",
      required: true,
    },
    partySize: { type: Number, required: true, min: 1 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "waitlist", "cancelled"],
      default: "pending",
    },
    notes: { type: String, default: "" },
    stripeSessionId: { type: String, default: "" },
    paidAt: { type: Date, default: null },
    source: {
      type: String,
      enum: ["website", "agent", "repeat", "social", "staff"],
      default: "website",
    },
  },
  { timestamps: true },
);

export const Booking = mongoose.model("Booking", bookingSchema);
