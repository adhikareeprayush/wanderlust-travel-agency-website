import { Router } from "express";
import { z } from "zod";
import { User } from "../models/User.js";
import { protect, signToken } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import { upsertGuest } from "../utils/booking.js";

const router = Router();

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(8).max(128),
  phone: z.string().max(30).optional(),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1),
});

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const data = registerSchema.parse(req.body);
    const exists = await User.findOne({ email: data.email.toLowerCase() });
    if (exists) throw new AppError("Email already registered", 409);
    const passwordHash = await User.hashPassword(data.password);
    const user = await User.create({
      name: data.name,
      email: data.email,
      passwordHash,
      phone: data.phone || "",
      role: "customer",
    });
    await upsertGuest({
      name: user.name,
      email: user.email,
      phone: user.phone,
      userId: user._id,
      segment: "Website guest",
    });
    const token = signToken(user);
    res.status(201).json({ token, user: user.toSafeJSON() });
  }),
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const data = loginSchema.parse(req.body);
    const user = await User.findOne({ email: data.email.toLowerCase() }).select(
      "+passwordHash",
    );
    if (!user || !(await user.comparePassword(data.password))) {
      throw new AppError("Invalid email or password", 401);
    }
    const token = signToken(user);
    res.json({ token, user: user.toSafeJSON() });
  }),
);

router.get(
  "/me",
  protect,
  asyncHandler(async (req, res) => {
    res.json({ user: req.user.toSafeJSON() });
  }),
);

router.patch(
  "/profile",
  protect,
  asyncHandler(async (req, res) => {
    const schema = z.object({
      name: z.string().trim().min(2).max(100).optional(),
      phone: z.string().max(30).optional(),
      password: z.string().min(8).max(128).optional(),
    });
    const data = schema.parse(req.body);
    if (data.name) req.user.name = data.name;
    if (data.phone !== undefined) req.user.phone = data.phone;
    if (data.password)
      req.user.passwordHash = await User.hashPassword(data.password);
    await req.user.save();
    res.json({ user: req.user.toSafeJSON() });
  }),
);

export default router;
