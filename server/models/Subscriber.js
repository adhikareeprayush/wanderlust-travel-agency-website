import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    subscribedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);
export const Subscriber = mongoose.model("Subscriber", schema);
