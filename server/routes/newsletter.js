import { Router } from "express";
import { z } from "zod";
import { Subscriber } from "../models/Subscriber.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { protect, requirePermission } from "../middleware/auth.js";
const router = Router();
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { email } = z
      .object({ email: z.string().trim().toLowerCase().email().max(254) })
      .parse(req.body);
    await Subscriber.updateOne(
      { email },
      { $setOnInsert: { email, subscribedAt: new Date() } },
      { upsert: true },
    );
    res.json({ ok: true });
  }),
);
router.get(
  "/",
  protect,
  requirePermission("enquiries"),
  asyncHandler(async (_req, res) =>
    res.json({
      subscribers: await Subscriber.find().sort({ createdAt: -1 }).limit(1000),
    }),
  ),
);
export default router;
