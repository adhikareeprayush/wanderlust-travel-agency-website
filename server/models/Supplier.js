import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
  {
    vendor: { type: String, required: true },
    type: {
      type: String,
      enum: ["Transport", "Hotels", "Guides", "Experiences"],
      default: "Hotels",
    },
    status: { type: String, default: "Active" },
    action: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

export const Supplier = mongoose.model("Supplier", supplierSchema);
