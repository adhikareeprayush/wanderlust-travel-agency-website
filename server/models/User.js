import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { PERMISSIONS } from "../config/permissions.js";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["customer", "staff", "admin"],
      default: "customer",
    },
    phone: { type: String, default: "" },
    // Only used for staff. Existing staff accounts keep full access by default.
    permissions: {
      type: [{ type: String, enum: PERMISSIONS }],
      default: () => [...PERMISSIONS],
    },
    active: { type: Boolean, default: true },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
);

userSchema.methods.effectivePermissions = function effectivePermissions() {
  if (this.role === "admin") return [...PERMISSIONS];
  if (this.role === "staff") return [...(this.permissions || [])];
  return [];
};

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.statics.hashPassword = function hashPassword(password) {
  return bcrypt.hash(password, 10);
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    phone: this.phone,
    permissions: this.effectivePermissions(),
  };
};

userSchema.methods.toTeamJSON = function toTeamJSON() {
  return {
    ...this.toSafeJSON(),
    active: this.active !== false,
    lastLoginAt: this.lastLoginAt,
    createdAt: this.createdAt,
  };
};

export const User = mongoose.model("User", userSchema);
