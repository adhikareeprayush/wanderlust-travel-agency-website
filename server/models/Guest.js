import mongoose from "mongoose";

const guestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    segment: { type: String, default: "Traveler" },
    notes: { type: String, default: "" },
    lifetimeValue: { type: Number, default: 0 },
    nextTrip: { type: String, default: "" },
  },
  { timestamps: true },
);

guestSchema.index({ email: 1 }, { unique: true });

export const Guest = mongoose.model("Guest", guestSchema);
