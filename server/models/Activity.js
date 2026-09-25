import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["booking", "payout", "review", "inventory", "enquiry", "ops"],
      default: "ops",
    },
    message: { type: String, required: true },
  },
  { timestamps: true },
);

export const Activity = mongoose.model("Activity", activitySchema);
