import { Router } from "express";
import { z } from "zod";
import { Guide } from "../models/Guide.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { protect, requirePermission } from "../middleware/auth.js";
import { AppError } from "../utils/AppError.js";
import { logActivity } from "../utils/activity.js";

const router = Router();

router.get(
  "/",
  protect,
  requirePermission("guides", "departures"),
  asyncHandler(async (_req, res) => {
    const guides = await Guide.find()
      .populate("tours", "title slug")
      .sort({ name: 1 });
    res.json({ guides });
  }),
);

const schema = z.object({
  name: z.string().min(2),
  region: z.string().optional(),
  experienceYears: z.coerce.number().optional(),
  languages: z.array(z.string()).optional(),
  tours: z.array(z.string()).optional(),
  rating: z.coerce.number().optional(),
  status: z.enum(["Available", "On tour", "Leave soon"]).optional(),
  departuresCount: z.coerce.number().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
});

router.post(
  "/",
  protect,
  requirePermission("guides"),
  asyncHandler(async (req, res) => {
    const data = schema.parse(req.body);
    const guide = await Guide.create(data);
    await logActivity("ops", `Guide added: ${guide.name}`);
    res.status(201).json({ guide });
  }),
);

router.patch(
  "/:id",
  protect,
  requirePermission("guides"),
  asyncHandler(async (req, res) => {
    const data = schema.partial().parse(req.body);
    const guide = await Guide.findByIdAndUpdate(req.params.id, data, {
      new: true,
    }).populate("tours", "title slug");
    if (!guide) throw new AppError("Guide not found", 404);
    res.json({ guide });
  }),
);

router.delete(
  "/:id",
  protect,
  requirePermission("guides"),
  asyncHandler(async (req, res) => {
    const guide = await Guide.findByIdAndDelete(req.params.id);
    if (!guide) throw new AppError("Guide not found", 404);
    res.json({ ok: true });
  }),
);

export default router;
