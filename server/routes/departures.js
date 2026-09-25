import { Router } from "express";
import { z } from "zod";
import { Departure } from "../models/Departure.js";
import { Booking } from "../models/Booking.js";
import { Tour } from "../models/Tour.js";
import { Guide } from "../models/Guide.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { protect, requirePermission } from "../middleware/auth.js";
import { AppError } from "../utils/AppError.js";
const router = Router();
router.use(protect, requirePermission("departures"));
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.tour) filter.tour = req.query.tour;
    res.json({
      departures: await Departure.find(filter)
        .populate("tour", "title slug basePrice region durationDays imageKey")
        .populate("guide", "name status")
        .sort({ startDate: 1 }),
    });
  }),
);
const id = z.string().regex(/^[a-f\d]{24}$/i);
const body = z.object({
  tour: id,
  startDate: z
    .string()
    .refine(
      (value) =>
        !Number.isNaN(Date.parse(value)) && new Date(value) > new Date(),
      "Choose a future departure date.",
    ),
  seats: z.coerce.number().int().min(1).max(200),
  notes: z.string().max(2000).optional(),
  guide: id.nullable().optional(),
  status: z.enum(["open", "full", "cancelled"]).optional(),
});
async function references(data) {
  if (data.tour && !(await Tour.exists({ _id: data.tour })))
    throw new AppError("Tour not found", 404);
  if (data.guide && !(await Guide.exists({ _id: data.guide })))
    throw new AppError("Guide not found", 404);
}
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = body.parse(req.body);
    await references(data);
    const departure = await Departure.create({ ...data, status: "open" });
    res.status(201).json({ departure });
  }),
);
router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = body.partial().parse(req.body);
    await references(data);
    const dep = await Departure.findById(req.params.id);
    if (!dep) throw new AppError("Departure not found", 404);
    if (data.tour && data.tour !== dep.tour.toString())
      throw new AppError("Create a new departure to change its tour.", 409);
    if (
      data.status === "cancelled" &&
      (await Booking.exists({
        departure: dep._id,
        status: { $in: ["pending", "waitlist", "confirmed"] },
      }))
    )
      throw new AppError(
        "Resolve active booking requests before cancelling this departure.",
        409,
      );
    const filter = { _id: dep._id };
    if (data.seats !== undefined) filter.bookedCount = { $lte: data.seats };
    const updated = await Departure.findOneAndUpdate(filter, data, {
      new: true,
      runValidators: true,
    });
    if (!updated)
      throw new AppError(
        "Capacity cannot be lower than confirmed travellers.",
        409,
      );
    res.json({ departure: updated });
  }),
);
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const dep = await Departure.findById(req.params.id);
    if (!dep) throw new AppError("Departure not found", 404);
    if (await Booking.exists({ departure: dep._id }))
      throw new AppError(
        "A departure with booking history cannot be deleted. Cancel it instead.",
        409,
      );
    await dep.deleteOne();
    res.json({ ok: true });
  }),
);
export default router;
