import { Router } from "express";
import { z } from "zod";
import { Guest } from "../models/Guest.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { protect, requirePermission } from "../middleware/auth.js";
import { AppError } from "../utils/AppError.js";

const router = Router();
router.use(protect, requirePermission("guests"));

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const guests = await Guest.find().sort({ updatedAt: -1 });
    res.json({ guests });
  }),
);

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  segment: z.string().optional(),
  notes: z.string().optional(),
  nextTrip: z.string().optional(),
  lifetimeValue: z.coerce.number().optional(),
});

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = schema.parse(req.body);
    const guest = await Guest.create(data);
    res.status(201).json({ guest });
  }),
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = schema.partial().parse(req.body);
    const guest = await Guest.findByIdAndUpdate(req.params.id, data, {
      new: true,
    });
    if (!guest) throw new AppError("Guest not found", 404);
    res.json({ guest });
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const guest = await Guest.findByIdAndDelete(req.params.id);
    if (!guest) throw new AppError("Guest not found", 404);
    res.json({ ok: true });
  }),
);

export default router;
