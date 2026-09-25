import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: "agency" },
    depositPolicy: { type: Boolean, default: true },
    depositPercent: { type: Number, default: 30 },
    autoCancelUnpaidHolds: { type: Boolean, default: true },
    unpaidHoldHours: { type: Number, default: 48 },
    autoReminders: { type: Boolean, default: true },
    guestDocumentRequests: { type: Boolean, default: true },
    supplierAlerts: { type: Boolean, default: true },
    guideAssignmentNotices: { type: Boolean, default: false },
    stripeEnabled: { type: Boolean, default: true },
    mailEnabled: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Settings = mongoose.model("Settings", settingsSchema);
