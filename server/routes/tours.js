import { Router } from "express";
import { z } from "zod";
import { Tour } from "../models/Tour.js";
import { Departure } from "../models/Departure.js";
import { Booking } from "../models/Booking.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import {
  optionalAuth,
  protect,
  requirePermission,
} from "../middleware/auth.js";
import { AppError } from "../utils/AppError.js";
import { logActivity } from "../utils/activity.js";

import { literalSearch } from "../utils/validation.js";
const router = Router();

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

router.get(
  "/",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const {
      q,
      region,
      sort = "date",
      featured,
      published,
      month,
      guests,
    } = req.query;
    if (
      month &&
      (typeof month !== "string" || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month))
    )
      throw new AppError("Choose a valid travel month.", 400);
    if (
      guests &&
      (!Number.isInteger(Number(guests)) ||
        Number(guests) < 1 ||
        Number(guests) > 30)
    )
      throw new AppError("Choose between 1 and 30 travellers.", 400);
    const filter = {};
    const canSeeAll =
      published === "all" &&
      req.user &&
      ["staff", "admin"].includes(req.user.role);
    if (!canSeeAll) filter.published = { $ne: false };
    if (featured === "true") filter.featured = true;
    if (region) filter.region = literalSearch(region);
    if (q) {
      filter.$or = [
        { title: literalSearch(q) },
        { excerpt: literalSearch(q) },
        { region: literalSearch(q) },
      ];
    }

    let query = Tour.find(filter);
    if (sort === "priceAsc") query = query.sort({ basePrice: 1 });
    else if (sort === "priceDesc") query = query.sort({ basePrice: -1 });
    else if (sort === "name") query = query.sort({ title: 1 });
    else query = query.sort({ featured: -1, createdAt: 1 });

    const tours = await query.lean();
    const tourIds = tours.map((t) => t._id);
    const departures = await Departure.find({
      tour: { $in: tourIds },
      status: { $ne: "cancelled" },
      startDate: { $gt: new Date() },
    })
      .select("tour startDate seats bookedCount status")
      .sort({ startDate: 1 })
      .lean();

    const byTour = new Map();
    for (const dep of departures) {
      if (month && new Date(dep.startDate).toISOString().slice(0, 7) !== month)
        continue;
      if (guests && dep.seats - dep.bookedCount < Number(guests)) continue;
      const key = dep.tour.toString();
      if (!byTour.has(key)) byTour.set(key, []);
      byTour.get(key).push(dep);
    }

    res.json({
      tours: tours
        .map((tour) => ({
          ...tour,
          id: tour._id,
          nextDeparture: byTour.get(tour._id.toString())?.[0] || null,
          departures: byTour.get(tour._id.toString()) || [],
        }))
        .filter((t) => (!month && !guests) || t.departures.length)
        .sort((a, b) =>
          sort === "date"
            ? (a.nextDeparture
                ? new Date(a.nextDeparture.startDate).getTime()
                : Infinity) -
              (b.nextDeparture
                ? new Date(b.nextDeparture.startDate).getTime()
                : Infinity)
            : 0,
        ),
    });
  }),
);

router.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    const tour = await Tour.findOne({ slug: req.params.slug, published: true });
    if (!tour) throw new AppError("Tour not found", 404);
    const departures = await Departure.find({
      tour: tour._id,
      status: { $ne: "cancelled" },
      startDate: { $gt: new Date() },
    })
      .select("startDate seats bookedCount status")
      .sort({ startDate: 1 });
    res.json({ tour, departures });
  }),
);

const tourBody = z.object({
  title: z.string().trim().min(2).max(150),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  description: z.string().optional(),
  region: z.string().optional(),
  durationDays: z.coerce.number().int().min(1).max(365),
  basePrice: z.coerce.number().min(1).max(1000000),
  compareAtPrice: z.coerce.number().optional(),
  rating: z.coerce.number().optional(),
  featured: z.boolean().optional(),
  trending: z.boolean().optional(),
  published: z.boolean().optional(),
  imageKey: z.string().optional(),
  galleryKeys: z.array(z.string()).optional(),
  highlights: z.array(z.string()).optional(),
  facts: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  itinerary: z
    .array(
      z.object({
        day: z.string(),
        title: z.string(),
        body: z.string(),
        highlights: z.array(z.string()).optional(),
      }),
    )
    .optional(),
  mapTitle: z.string().optional(),
  mapEmbed: z.string().optional(),
  locationBlurb: z.string().optional(),
  groupLabel: z.string().optional(),
  reviewCount: z.string().optional(),
  flagKey: z.string().optional(),
});

router.post(
  "/",
  protect,
  requirePermission("tours"),
  asyncHandler(async (req, res) => {
    const data = tourBody.parse(req.body);
    const slug = data.slug || slugify(data.title);
    const exists = await Tour.findOne({ slug });
    if (exists) throw new AppError("Slug already exists", 409);
    const tour = await Tour.create({ ...data, slug });
    await logActivity("inventory", `Tour created: ${tour.title}`);
    res.status(201).json({ tour });
  }),
);

router.patch(
  "/:id",
  protect,
  requirePermission("tours"),
  asyncHandler(async (req, res) => {
    const data = tourBody.partial().parse(req.body);
    const tour = await Tour.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!tour) throw new AppError("Tour not found", 404);
    res.json({ tour });
  }),
);

router.delete(
  "/:id",
  protect,
  requirePermission("tours"),
  asyncHandler(async (req, res) => {
    const tour = await Tour.findById(req.params.id);
    if (!tour) throw new AppError("Tour not found", 404);
    const active = await Booking.countDocuments({
      tour: tour._id,
    });
    if (active)
      throw new AppError("Cannot delete a tour with active bookings", 400);
    await Departure.deleteMany({ tour: tour._id });
    await tour.deleteOne();
    await logActivity("inventory", `Tour deleted: ${tour.title}`);
    res.json({ ok: true });
  }),
);

export default router;
