import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "./asyncHandler.js";

export function signToken(user) {
  return jwt.sign({ id: user._id.toString(), role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw new AppError("Not authorized", 401);
  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(decoded.id);
    if (!user) throw new AppError("User not found", 401);
    if (user.active === false)
      throw new AppError("This account has been deactivated.", 401);
    req.user = user;
    next();
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("Invalid or expired token", 401);
  }
});

export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(decoded.id);
    if (user && user.active !== false) req.user = user;
  } catch {
    // ignore invalid optional tokens
  }
  next();
});


export function hasPermission(user, permission) {
  if (!user) return false;
  if (user.role === "admin") return true;
  return user.role === "staff" && user.permissions?.includes(permission);
}

// Allows admins, and staff holding at least one of the listed permissions.
export const requirePermission =
  (...permissions) =>
  (req, _res, next) => {
    if (permissions.some((permission) => hasPermission(req.user, permission)))
      return next();
    next(new AppError("You do not have access to this area.", 403));
  };

export function requireAdmin(req, _res, next) {
  if (req.user?.role !== "admin")
    return next(new AppError("Administrator access required", 403));
  next();
}
