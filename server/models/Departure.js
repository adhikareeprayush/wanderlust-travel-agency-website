import mongoose from "mongoose";

const departureSchema = new mongoose.Schema(
  {
    tour: { type: mongoose.Schema.Types.ObjectId, ref: "Tour", required: true },
    startDate: { type: Date, required: true },
    seats: { type: Number, required: true, min: 1 },
    bookedCount: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["open", "full", "cancelled"],
      default: "open",
    },
    notes: { type: String, default: "" },
    guide: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guide",
      default: null,
    },
  },
  { timestamps: true },
);

departureSchema.virtual("remaining").get(function remaining() {
  return Math.max(this.seats - this.bookedCount, 0);
});

departureSchema.set("toJSON", { virtuals: true });
departureSchema.set("toObject", { virtuals: true });

export const Departure = mongoose.model("Departure", departureSchema);
