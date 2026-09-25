import mongoose from "mongoose";

const guideSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    region: { type: String, default: "" },
    experienceYears: { type: Number, default: 1 },
    languages: [{ type: String }],
    tours: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tour" }],
    rating: { type: Number, default: 4.8 },
    status: {
      type: String,
      enum: ["Available", "On tour", "Leave soon"],
      default: "Available",
    },
    departuresCount: { type: Number, default: 0 },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
  },
  { timestamps: true },
);

export const Guide = mongoose.model("Guide", guideSchema);
